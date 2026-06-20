"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { analyzeText, type AnalysisResult } from "../lib/analyze";
import { supabase } from "../lib/supabaseClient";
import ReadingCard, { type VoiceReading } from "./components/ReadingCard";
import InputCard from "./components/InputCard";
import AppHeader from "./components/AppHeader";
import JourneySection, { type JourneyItem } from "./components/JourneySection";
import { toVoiceReading } from "../lib/toVoiceReading";
import { useTier } from "../lib/useTier";

// --------------------------------------------
// TYPES
// --------------------------------------------


// --------------------------------------------
// STATIC LOOKUPS
// --------------------------------------------

const MOODS = [
  "Calm",
  "Sad",
  "Agitated / Angry",
  "Tired",
  "Hopeful",
  "Overwhelmed",
  "Focused",
];

const CATEGORIES = [
  "Relationship",
  "Work & Daily Life",
  "Health & Energy",
  "Mental Clarity",
  "Past Experience",
  "Overall Wellbeing",
];

const CHAR_LIMIT = 2000;
const DAILY_LIMIT = 5;

export default function HomePage() {
  const router = useRouter();
  const { tier } = useTier();
  const isPaid = tier === "premium";

  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [mood, setMood] = useState("");
  const [category, setCategory] = useState("");

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [voiceReading, setVoiceReading] = useState<VoiceReading | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [lastText, setLastText] = useState("");
  const [isVoice, setIsVoice] = useState(false);
  const [journey, setJourney] = useState<JourneyItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [entriesToday, setEntriesToday] = useState(0); // kept for future use
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = text.trim().length > 0 && !loading;

  // -------------------------------------------------
  // Client init: auth + history + daily usage
  // -------------------------------------------------
  useEffect(() => {
    setHydrated(true);

    // Auth: fetch logged-in user
    const devBypass =
      typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      new URLSearchParams(window.location.search).get("dev") === "1";

    if (devBypass) {
      setUserEmail("dev@localhost");
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      const email = data.user.email ?? null;
      setUserEmail(email);

      // Fetch today's server-side count
      if (email) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from("storysignal_entries")
          .select("id", { count: "exact", head: true })
          .eq("email", email)
          .gte("created_at", todayStart.toISOString());
        setEntriesToday(count ?? 0);
      }
    });

    if (typeof window === "undefined") return;

    try {
      const rawHistory = localStorage.getItem("ss2-history") || "[]";
      setJourney(JSON.parse(rawHistory) as JourneyItem[]);
    } catch {
      setJourney([]);
    }

    try {
      // Load daily usage
      const rawUsage = localStorage.getItem("ss-usage");
      const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      if (rawUsage) {
        const parsedUsage = JSON.parse(rawUsage) as {
          date: string;
          count: number;
        };

        if (parsedUsage.date === todayStr) {
          setEntriesToday(parsedUsage.count || 0);
        } else {
          // Different day → reset count
          setEntriesToday(0);
          localStorage.setItem(
            "ss-usage",
            JSON.stringify({ date: todayStr, count: 0 })
          );
        }
      } else {
        // No usage stored yet → initialize
        localStorage.setItem(
          "ss-usage",
          JSON.stringify({ date: todayStr, count: 0 })
        );
        setEntriesToday(0);
      }
    } catch {
      // If anything goes wrong, fall back to 0
      setEntriesToday(0);
    }
  }, []);

  // -------------------------------------------------
  // Analyze handler
  // -------------------------------------------------
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (text.length > CHAR_LIMIT) {
      setError(
        `Your text is longer than the allowed ${CHAR_LIMIT.toLocaleString()} characters.`
      );
      return;
    }

    // ---- Daily Limit Check (simple, safe, local-only) ----
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const rawUsage = localStorage.getItem("ss-usage");

      let usage = rawUsage ? JSON.parse(rawUsage) : { date: today, count: 0 };

      // Reset if different day
      if (usage.date !== today) {
        usage = { date: today, count: 0 };
        localStorage.setItem("ss-usage", JSON.stringify(usage));
      }

      // Enforce limit
      if (usage.count >= DAILY_LIMIT) {
        setError(
          `You've reached your daily limit of ${DAILY_LIMIT} readings. Please come back tomorrow.`
        );
        return;
      }
    } catch {
      // If anything goes wrong, allow usage but don't crash
    }

    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const res = await analyzeText(text, mood, category, accessToken);
      setResult(res);
      const vr = toVoiceReading(res);
      setVoiceReading(vr);

      // Refresh server-side count after a successful reading
      if (userEmail) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from("storysignal_entries")
          .select("id", { count: "exact", head: true })
          .eq("email", userEmail)
          .gte("created_at", todayStart.toISOString());
        setEntriesToday(count ?? 0);
      }

      // Save to Supabase — capture the returned id for the keep-words toggle
      if (userEmail) {
        const { data: inserted } = await supabase
          .from("storysignal_entries")
          .insert({
            email:       userEmail,
            result:      res,
            dominant:    vr.dominant.name,
            active_pair: vr.secondary.name,
            via_voice:   isVoice,
          })
          .select("id")
          .single();
        setEntryId(inserted?.id ?? null);
        setLastText(text);
        setIsVoice(false);
      }

      const item: JourneyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        dominant: vr.dominant.name,
        summary: res.summary,
        reading: vr,
      };

      setJourney((prev) => {
        const next = [...prev, item].slice(-3); // free cap: last 3
        localStorage.setItem("ss2-history", JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while reading your writing. Please try again."
      );
      setResult(null);
    } finally {
      // ---- Increment daily usage count ----
      try {
        const today = new Date().toISOString().slice(0, 10);
        const rawUsage = localStorage.getItem("ss-usage");

        let usage = rawUsage ? JSON.parse(rawUsage) : { date: today, count: 0 };

        // Reset if needed (safety)
        if (usage.date !== today) {
          usage = { date: today, count: 0 };
        }

        usage.count += 1;

        localStorage.setItem("ss-usage", JSON.stringify(usage));
      } catch {
        // fail silently — do NOT block the user
      }

      setLoading(false);
    }
  };

  // -------------------------------------------------
  // RENDER
  // -------------------------------------------------
  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(120% 90% at 50% -10%, #2a2114 0, #19150e 42%, #100d08 100%)",
    }}>
      <div style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "22px 26px 60px",
      }}>
        <AppHeader />
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.46fr) minmax(0, 0.54fr)",
          gap: 22,
          alignItems: "start",
        }}
          className="ss-app-panels"
        >
          {/* LEFT PANEL — new InputCard design -------------------------------- */}
          <InputCard
            text={text}
            mood={mood}
            category={category}
            loading={loading}
            error={error}
            isPaid={isPaid}
            readingsLeftToday={Math.max(0, DAILY_LIMIT - entriesToday)}
            onTextChange={(t) => { setText(t); setError(null); }}
            onMoodChange={setMood}
            onCategoryChange={setCategory}
            onAnalyze={() => handleAnalyze({ preventDefault: () => {} } as React.FormEvent)}
            onVoiceChange={setIsVoice}
          />

          {/* RIGHT PANEL — new ReadingCard design ----------------------------- */}
          <ReadingCard
            reading={voiceReading}
            entryId={entryId}
            originalText={lastText}
            onUsePrompt={(p) => setText(p)}
          />
        </div>

        <JourneySection
          items={journey}
          isPaid={false}
          hydrated={hydrated}
          onSelect={(r) => setVoiceReading(r)}
        />
      </div>
    </main>
  );
}

"use client";

import { supabase } from "../lib/supabaseClient";

import type { AnalysisResult } from "../lib/analyze";
import { useEffect, useState } from "react";
import Image from "next/image";
import { analyzeText } from "../lib/analyze";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// ----- Static lookups -----
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

// ----- Types -----
type HistoryItem = {
  id: number;
  timestamp: string;
  dominant: string;
  textPreview: string;
  fullText: string;
  fullResult: AnalysisResult;
};

const CHAR_LIMIT = 2000;
const DAILY_LIMIT = 5;


export default function HomePage() {

// --- NEW: Auth + router setup ---
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUserEmail(data.user?.email ?? null);
  });
}, []);

  useEffect(() => {
  const timer = setTimeout(() => {
    supabase.auth.getUser().then(({ data, error }) => {

      console.log("AUTH CHECK — data:", data);
      console.log("AUTH CHECK — error:", error);

      if (!data?.user) {
        console.log("AUTH CHECK — No user found → redirecting");
        router.push("/login");
      } else {
        console.log("AUTH CHECK — User found, staying on homepage");
      }
    });
  }, 300);

  return () => clearTimeout(timer);
}, []);

  // --- END NEW ---

// Existing state hooks
  const [text, setText] = useState("");
  const [mood, setMood] = useState("");
  const [category, setCategory] = useState("");

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [entriesToday, setEntriesToday] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = text.trim().length > 0 && !loading;

  // Mark client-hydrated to avoid mismatch + load history
  useEffect(() => {
  setHydrated(true);

  if (typeof window === "undefined") return;

  try {
    // Load history
    const rawHistory = localStorage.getItem("ss-history") || "[]";
    const parsedHistory = JSON.parse(rawHistory) as HistoryItem[];
    setHistory(parsedHistory);
  } catch {
    setHistory([]);
  }

  try {
    // Load daily usage
    const rawUsage = localStorage.getItem("ss-usage");
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    if (rawUsage) {
      const parsedUsage = JSON.parse(rawUsage) as { date: string; count: number };

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

  let usage = rawUsage
    ? JSON.parse(rawUsage)
    : { date: today, count: 0 };

  // Reset if different day
  if (usage.date !== today) {
    usage = { date: today, count: 0 };
    localStorage.setItem("ss-usage", JSON.stringify(usage));
  }

  // Enforce limit
  if (usage.count >= DAILY_LIMIT) {
    setError(`You've reached your daily limit of ${DAILY_LIMIT} readings. Please come back tomorrow.`);
    return;
  }
} catch {
  // If anything goes wrong, allow usage but don't crash
}

    setLoading(true);
    setError(null);

    try {
      const res = await analyzeText(text, mood, category);
      setResult(res);

      const item: HistoryItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        dominant: res.dominant_archetype,
        textPreview: text.slice(0, 160),
        fullText: text,
        fullResult: res,
      };

      setHistory((prev) => {
        // Keep last 3 entries
        const trimmed = prev.slice(-2);
        const next = [...trimmed, item];
        if (typeof window !== "undefined") {
          localStorage.setItem("ss-history", JSON.stringify(next));
        }
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

  let usage = rawUsage
    ? JSON.parse(rawUsage)
    : { date: today, count: 0 };

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

  const visibleHistory = history.slice().reverse(); // newest first

  return (
    <main className="ss-root">
      
      <div className="ss-shell">
        <div className="ss-panels">
          {/* LEFT PANEL ----------------------------------------------------- */}
          <section className="ss-card ss-left-panel">
            
            {/* Brand header */}
<div className="ss-left-header">
  <div className="ss-logo-circle">
    <Image
      src="/tes-logo.png"
      alt="StorySignal logo"
      width={52}
      height={52}
    />
  </div>

  <div className="ss-left-brand-block">
    <div className="ss-brand-title">
      StorySignal<span className="ss-brand-mark">™</span>
    </div>
    <div className="ss-tagline">
      A gentle reflection tool for your writing.
    </div>
  </div>
</div>

{userEmail && (
  <div
    className="ss-user-email"
    style={{ marginTop: "12px", fontSize: "0.9rem", opacity: 0.9 }}
  >
    Logged in as: <strong>{userEmail}</strong>
  </div>
)}

{userEmail && (
  <button
    className="ss-button ss-button-small"
    style={{ marginTop: "8px" }}
    onClick={async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }}
  >
    Logout
  </button>
)}

            {/* Input form */}
            <form className="ss-form" onSubmit={handleAnalyze}>
              {/* Text area */}
              <div className="ss-field-group">
                <label className="ss-label ss-label-strong">Your input</label>
                <p className="ss-helper-text ss-helper-top">
                Free mode — up to {DAILY_LIMIT} readings per day, stored only on this device.
                </p>

                <textarea
                  className="ss-input-area ss-input-large"
                  placeholder="Write or paste your reflection here…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <div className="ss-char-counter">
                  {text.length.toLocaleString()} /{" "}
                  {CHAR_LIMIT.toLocaleString()} characters
                </div>
                <div className="ss-helper-text">
                  Works best with up to {CHAR_LIMIT.toLocaleString()} characters.
                </div>
              </div>

              {/* Mood + category */}
              <div className="ss-field-row">
                <div className="ss-field-col">
                  <label className="ss-label">Mood</label>
                  <select
                    className="ss-select"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                  >
                    <option value="">Select mood…</option>
                    {MOODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ss-field-col">
                  <label className="ss-label">Category</label>
                  <select
                    className="ss-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="ss-error">{error}</div>}

              <button
                type="submit"
                className={`ss-button ss-button-wide ${
                  !canAnalyze ? "ss-button-disabled" : ""
                }`}
                disabled={!canAnalyze}
              >
                {loading ? "Analyzing…" : "Analyze my StorySignal"}
              </button>

              <div className="ss-disclaimer">
                StorySignal offers gentle, non-clinical reflection. It does not
                replace professional support.
              </div>
            </form>
          </section>

          {/* RIGHT PANEL ---------------------------------------------------- */}
          <section className="ss-card">
            <header className="ss-right-header">
              <h2 className="ss-right-title">Your StorySignal reading</h2>
              <p className="ss-right-subtitle">
                A gentle way to listen to the movement within your writing
                today.
              </p>
            </header>

            <div className="ss-result-panel">
              {!result && (
                <p className="ss-result-placeholder">
                  Your reading will appear here after you submit your writing on
                  the left.
                </p>
              )}

              {result && (
                <div className="ss-result-grid">
                  {/* Summary */}
                  <div className="ss-result-block">
                    <h3 className="ss-section-title">Summary</h3>
                    <p className="ss-result-body">{result.summary}</p>
                  </div>

                  {/* Emotional signal */}
                  <div className="ss-result-block">
                    <h3 className="ss-section-title">Emotional signal</h3>
                    <p className="ss-result-body">
                      {result.emotional_signal}
                    </p>
                  </div>

                  {/* Narrative signal */}
                  <div className="ss-result-block">
                    <h3 className="ss-section-title">Narrative signal</h3>
                    <p className="ss-result-body">
                      {result.narrative_signal}
                    </p>
                  </div>

                  {/* Dominant archetype */}
                  <div className="ss-result-block">
                    <h3 className="ss-section-title">Dominant archetype</h3>
                    <p className="ss-result-body">
                      <strong>{result.dominant_archetype}</strong>
                      {result.secondary_archetype
                        ? ` (with ${result.secondary_archetype} in support)`
                        : ""}
                    </p>
                    <p className="ss-result-body">
                      {result.archetype_explanation}
                    </p>
                  </div>

                  {/* Distribution */}
                  {result.archetype_distribution && (
                    <div className="ss-result-block">
                      <h3 className="ss-section-title">
                        Archetype distribution
                      </h3>
                      <div className="ss-arch-grid">
                        {Object.entries(
                          result.archetype_distribution as Record<
                            string,
                            number
                          >
                        ).map(([name, value]) => (
                          <div className="ss-arch-row" key={name}>
                            <div className="ss-arch-label">{name}</div>
                            <div className="ss-arch-bar-container">
                              <div
                                className="ss-arch-bar"
                                style={{
                                  width: `${Math.round(Number(value))}%`,
                                }}
                              />
                            </div>
                            <div className="ss-arch-value">
                              {Math.round(Number(value))}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key themes */}
                  <div className="ss-result-block">
                    <h3 className="ss-section-title">Key themes</h3>
                    <p className="ss-result-note">
                      Central ideas that surfaced in your writing—recurring
                      threads or tensions that shape the emotional landscape.
                    </p>

                    {result.key_themes?.length ? (
                      <div className="ss-tag-row">
                        {result.key_themes.map((theme) => (
                          <span key={theme} className="ss-tag">
                            {theme}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="ss-muted">No themes detected.</p>
                    )}
                  </div>

                  <div className="ss-result-disclaimer">
                    StorySignal offers gentle, non-clinical reflection. It does
                    not replace professional support.
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* HISTORY PANEL --------------------------------------------------- */}
        {hydrated && (
          <div className="ss-history-panel-global">
            <h3 className="ss-history-title">Your Recent Analyses</h3>

            {visibleHistory.length === 0 ? (
              <div className="ss-muted">No history yet.</div>
            ) : (
              <ul className="ss-history-list">
  {visibleHistory.map((item) => (
    <li key={item.id} className="ss-history-item">
      <div className="ss-history-dominant">
        {item.fullResult?.dominant_archetype || "—"}
      </div>

      <div className="ss-history-summary">
        {item.fullResult?.summary || "No summary available."}
      </div>

      <div className="ss-history-date">
        {new Date(item.timestamp).toLocaleDateString()}
      </div>
    </li>
  ))}
</ul>
            )}

            <div className="ss-history-footnote">
              Free mode keeps your last three readings saved only on this device.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


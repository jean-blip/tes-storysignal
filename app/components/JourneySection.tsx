"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type VoiceReading } from "./ReadingCard";
import { getState } from "../../lib/voiceStates";
import { toVoiceReading } from "../../lib/toVoiceReading";
import { supabase } from "../../lib/supabaseClient";
import styles from "./JourneySection.module.css";

// -------------------------------------------------------
// Types
// -------------------------------------------------------

export type JourneyItem = {
  id: number;
  timestamp: string;
  dominant: string;
  summary: string;
  reading: VoiceReading;
};

type SupabaseEntry = {
  id: string;
  created_at: string;
  dominant: string | null;
  result: Record<string, unknown>;
};

type Props = {
  items: JourneyItem[];       // free: from localStorage
  isPaid: boolean;
  hydrated: boolean;
  onSelect: (reading: VoiceReading) => void;
};

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function fmtDate(ts: string) {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch { return ""; }
}

// -------------------------------------------------------
// Timeline SVG (Premium)
// -------------------------------------------------------

function Timeline({ entries }: { entries: SupabaseEntry[] }) {
  if (entries.length === 0) return null;

  const DOT_R  = 9;
  const GAP    = 72;
  const PY     = 36;
  const width  = Math.max(entries.length * GAP, GAP);
  const height = PY * 2 + DOT_R * 2 + 28;

  return (
    <div className={styles.timelineWrap}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ minWidth: entries.length * GAP, overflow: "visible" }}
        aria-hidden="true"
      >
        {/* Connecting line */}
        {entries.length > 1 && (
          <line
            x1={GAP / 2} y1={PY + DOT_R}
            x2={width - GAP / 2} y2={PY + DOT_R}
            stroke="rgba(232,210,170,0.15)"
            strokeWidth={1.5}
          />
        )}

        {entries.map((e, i) => {
          const cx  = GAP / 2 + i * GAP;
          const cy  = PY + DOT_R;
          const hue = getState(e.dominant ?? "").hue;

          return (
            <g key={e.id}>
              <circle cx={cx} cy={cy} r={DOT_R} fill={hue} fillOpacity={0.85} />
              <text
                x={cx} y={cy + DOT_R + 14}
                textAnchor="middle"
                fontSize={9}
                fill="var(--muted)"
                fontFamily="var(--sans)"
              >
                {fmtDate(e.created_at)}
              </text>
              <text
                x={cx} y={cy - DOT_R - 6}
                textAnchor="middle"
                fontSize={9}
                fill="var(--soft)"
                fontFamily="var(--sans)"
              >
                {(e.dominant ?? "").replace("The ", "")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// -------------------------------------------------------
// Component
// -------------------------------------------------------

export default function JourneySection({ items, isPaid, hydrated, onSelect }: Props) {

  // --- Premium: fetch from Supabase ---
  const [premiumEntries, setPremiumEntries] = useState<SupabaseEntry[]>([]);
  const [observation, setObservation]       = useState("");
  const [premiumLoaded, setPremiumLoaded]   = useState(false);

  useEffect(() => {
    if (!isPaid) return;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user?.email) return;

      const { data: rows } = await supabase
        .from("storysignal_entries")
        .select("id, created_at, dominant, result")
        .eq("email", data.user.email)
        .order("created_at", { ascending: true });

      const entries = (rows ?? []) as SupabaseEntry[];
      setPremiumEntries(entries);
      setPremiumLoaded(true);

      // Fetch "What we notice" if we have 2+ readings
      if (entries.length >= 2) {
        const states = entries.map((e) => e.dominant ?? "").filter(Boolean);
        fetch("/api/trend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ states }),
        })
          .then((r) => r.json())
          .then((d) => setObservation(d.observation ?? ""))
          .catch(() => {});
      }
    });
  }, [isPaid]);

  // --- Premium render ---
  if (isPaid) {
    const reversedEntries = [...premiumEntries].reverse();

    return (
      <section className={styles.section}>
        <div className={styles.top}>
          <div>
            <h3 className={styles.heading}>Your journey</h3>
            <p className={styles.sub}>Every reading kept — so the thread of your story stays unbroken.</p>
          </div>
        </div>

        {premiumLoaded && premiumEntries.length === 0 && (
          <p className={styles.empty}>No readings yet — your journey begins with your first entry above.</p>
        )}

        {premiumEntries.length > 0 && (
          <>
            {/* Timeline */}
            <div className={styles.timelineSection}>
              <div className={styles.timelineEyebrow}>Your movement over time</div>
              <div className={styles.timelineScroll}>
                <Timeline entries={premiumEntries} />
              </div>
              {observation && (
                <div className={styles.whatWeNotice}>
                  <span className={styles.noticeLabel}>What we notice · </span>
                  <span className={styles.noticeText}>{observation}</span>
                </div>
              )}
            </div>

            {/* Reading cards */}
            <div className={styles.scroll}>
              {reversedEntries.map((entry) => {
                const hue     = getState(entry.dominant ?? "").hue;
                const reading = toVoiceReading(entry.result as Parameters<typeof toVoiceReading>[0]);
                const summary = (entry.result as { summary?: string }).summary ?? "";

                return (
                  <button
                    key={entry.id}
                    className={styles.card}
                    onClick={() => onSelect(reading)}
                  >
                    <div className={styles.cardTop}>
                      <span className={styles.dot} style={{ background: hue }} />
                      <span className={styles.dominantName}>{entry.dominant}</span>
                    </div>
                    <p className={styles.summary}>{summary}</p>
                    <span className={styles.date}>{fmtDate(entry.created_at)}</span>
                  </button>
                );
              })}
            </div>

            <p className={styles.footnote}>
              {premiumEntries.length} reading{premiumEntries.length === 1 ? "" : "s"} in your journey.
            </p>
          </>
        )}
      </section>
    );
  }

  // --- Free render (unchanged) ---
  const ordered = [...items].reverse();

  return (
    <section className={styles.section}>
      <div className={styles.top}>
        <div>
          <h3 className={styles.heading}>Your recent readings</h3>
          <p className={styles.sub}>Free mode keeps your last three readings on this device.</p>
        </div>
        <Link href="/plan" className={styles.upsellBtn}>
          Unlock your full journey →
        </Link>
      </div>

      {hydrated && items.length === 0 && (
        <p className={styles.empty}>
          No readings yet — your journey begins with your first entry above.
        </p>
      )}

      {items.length > 0 && (
        <>
          <div className={styles.scroll}>
            {ordered.map((item) => {
              const hue = getState(item.dominant).hue;
              return (
                <button
                  key={item.id}
                  className={styles.card}
                  onClick={() => onSelect(item.reading)}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.dot} style={{ background: hue }} />
                    <span className={styles.dominantName}>{item.dominant}</span>
                  </div>
                  <p className={styles.summary}>{item.summary}</p>
                  <span className={styles.date}>{fmtDate(item.timestamp)}</span>
                </button>
              );
            })}

            <div className={styles.lockedCard}>
              <span className={styles.lockedIcon}>⌁</span>
              <span className={styles.lockedText}>
                Premium keeps every reading, so the thread of your story stays unbroken.
              </span>
            </div>
          </div>

          <p className={styles.footnote}>
            Upgrade to Premium to keep your full history and follow how your voice states move over time.
          </p>
        </>
      )}
    </section>
  );
}

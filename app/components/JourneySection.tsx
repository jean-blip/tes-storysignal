"use client";

import Link from "next/link";
import { type VoiceReading } from "./ReadingCard";
import { getState } from "../../lib/voiceStates";
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

type Props = {
  items: JourneyItem[];
  isPaid: boolean;
  hydrated: boolean;
  onSelect: (reading: VoiceReading) => void;
};

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function fmtDate(ts: string) {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// -------------------------------------------------------
// Component
// -------------------------------------------------------

export default function JourneySection({ items, isPaid, hydrated, onSelect }: Props) {
  const title = isPaid ? "Your journey" : "Your recent readings";
  const sub = isPaid
    ? "Every reading kept — so the thread of your story stays unbroken."
    : "Free mode keeps your last three readings on this device.";
  const footnote = isPaid
    ? `${items.length} reading${items.length === 1 ? "" : "s"} in your journey.`
    : "Upgrade to Premium to keep your full history and follow how your voice states move over time.";

  // Newest first
  const ordered = [...items].reverse();

  return (
    <section className={styles.section}>
      <div className={styles.top}>
        <div>
          <h3 className={styles.heading}>{title}</h3>
          <p className={styles.sub}>{sub}</p>
        </div>
        {!isPaid && (
          <Link href="/plan" className={styles.upsellBtn}>
            Unlock your full journey →
          </Link>
        )}
      </div>

      {/* Empty state — only show once hydrated so it doesn't flash */}
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

            {/* Locked placeholder card for free users */}
            {!isPaid && (
              <div className={styles.lockedCard}>
                <span className={styles.lockedIcon}>⌁</span>
                <span className={styles.lockedText}>
                  Premium keeps every reading, so the thread of your story stays unbroken.
                </span>
              </div>
            )}
          </div>

          <p className={styles.footnote}>{footnote}</p>
        </>
      )}
    </section>
  );
}

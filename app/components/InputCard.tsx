"use client";

import styles from "./InputCard.module.css";

// -------------------------------------------------------
// Constants
// -------------------------------------------------------

const MOODS = ["Calm", "Sad", "Agitated", "Tired", "Hopeful", "Overwhelmed", "Focused"];

const CATEGORIES = [
  "Relationship",
  "Work & Daily Life",
  "Health & Energy",
  "Mental Clarity",
  "Past Experience",
  "Overall Wellbeing",
];

const CHAR_LIMIT = 2000;
const MIN_WORDS = 40;

// -------------------------------------------------------
// Readiness meter helpers
// -------------------------------------------------------

function getReadiness(words: number): {
  fillPct: number;
  fillColor: string;
  label: string;
  labelColor: string;
} {
  const fillPct = Math.min(100, Math.round((words / MIN_WORDS) * 100));

  if (words === 0) {
    return {
      fillPct,
      fillColor: "var(--muted)",
      label: `Aim for ${MIN_WORDS}+ words — a few honest sentences.`,
      labelColor: "var(--muted)",
    };
  }
  if (words < MIN_WORDS) {
    return {
      fillPct,
      fillColor: "var(--gold)",
      label: "A few more sentences lets me read the movement, not just the mood.",
      labelColor: "var(--gold-soft)",
    };
  }
  if (words < 160) {
    return {
      fillPct: 100,
      fillColor: "#a9bd8f",
      label: "Ready — enough to read where you are.",
      labelColor: "#a9bd8f",
    };
  }
  return {
    fillPct: 100,
    fillColor: "#a9bd8f",
    label: "A rich entry — a fuller, more confident reading.",
    labelColor: "#a9bd8f",
  };
}

// -------------------------------------------------------
// Props
// -------------------------------------------------------

type Props = {
  text: string;
  mood: string;
  category: string;
  loading: boolean;
  error: string | null;
  isPaid: boolean;
  readingsLeftToday: number;
  onTextChange: (text: string) => void;
  onMoodChange: (mood: string) => void;
  onCategoryChange: (category: string) => void;
  onAnalyze: () => void;
};

// -------------------------------------------------------
// Component
// -------------------------------------------------------

export default function InputCard({
  text,
  mood,
  category,
  loading,
  error,
  isPaid,
  readingsLeftToday,
  onTextChange,
  onMoodChange,
  onCategoryChange,
  onAnalyze,
}: Props) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isReady = words >= MIN_WORDS;
  const { fillPct, fillColor, label, labelColor } = getReadiness(words);

  const btnClass = loading
    ? styles.analyzeBtnLoading
    : isReady
    ? styles.analyzeBtnReady
    : styles.analyzeBtnDisabled;

  const btnLabel = isReady
    ? "Analyze my StorySignal"
    : `${MIN_WORDS - words} more words to analyze`;

  const usageNote = isPaid
    ? "Premium — unlimited readings, every one kept in your journey."
    : `Free mode — ${Math.max(0, readingsLeftToday)} of 5 readings left today, stored on this device.`;

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>What's present for you today?</h2>
      <p className={styles.helper}>
        Write or paste a reflection. The more honest the page, the truer the reading.
      </p>

      {/* Textarea */}
      <div className={styles.textareaWrap}>
        <textarea
          className={styles.textarea}
          placeholder="Begin wherever you are…"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
        <div className={styles.charCount}>
          {text.length.toLocaleString()} / {CHAR_LIMIT.toLocaleString()}
        </div>
      </div>

      {/* Readiness meter */}
      <div className={styles.meter}>
        <div className={styles.meterTrack}>
          <div
            className={styles.meterFill}
            style={{ width: `${fillPct}%`, background: fillColor }}
          />
        </div>
        <div className={styles.meterMeta}>
          <span className={styles.wordCount}>{words} words</span>
          <span className={styles.meterDot} />
          <span className={styles.meterLabel} style={{ color: labelColor }}>
            {label}
          </span>
        </div>
      </div>

      {/* Mood chips */}
      <div className={styles.chipSection}>
        <label className={styles.chipLabel}>
          Mood <span className={styles.chipOptional}>— optional</span>
        </label>
        <div className={styles.chips}>
          {MOODS.map((m) => (
            <button
              key={m}
              className={`${styles.chip} ${mood === m ? styles.chipActive : ""}`}
              onClick={() => onMoodChange(mood === m ? "" : m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className={styles.chipSection}>
        <label className={styles.chipLabel}>
          Category <span className={styles.chipOptional}>— optional</span>
        </label>
        <div className={styles.chips}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`${styles.chip} ${category === c ? styles.chipActive : ""}`}
              onClick={() => onCategoryChange(category === c ? "" : c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Analyze button */}
      <button
        className={`${styles.analyzeBtn} ${btnClass}`}
        onClick={onAnalyze}
        disabled={loading || !isReady}
      >
        {loading ? (
          <span className={styles.spinner}>
            <span className={styles.spinnerIcon} />
            Reading…
          </span>
        ) : (
          btnLabel
        )}
      </button>

      {/* Usage note */}
      <div className={styles.usageNote}>
        <span className={styles.goldDot} />
        {usageNote}
      </div>
    </section>
  );
}

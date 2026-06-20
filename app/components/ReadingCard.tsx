"use client";

import Image from "next/image";
import styles from "./ReadingCard.module.css";

// -------------------------------------------------------
// Types
// -------------------------------------------------------

export type DistributionEntry = {
  name: string;
  hue: string;
  value: number; // 0–100, normalized to sum to 100
};

export type VoiceReading = {
  dominant: {
    name: string;
    essence: string;
    img: string;   // path in /public, e.g. "/states/whisperer.png"
    fn: string;    // function line, e.g. "Safety · Privacy · Gentle processing"
    meaning: string; // plain-language "what this is"
    nudge: string;   // plain-language "what today asks"
  };
  secondary: { name: string };
  explanation: string;
  summary: string;
  emotional: string;
  narrative: string;
  themes: string[];
  distribution: DistributionEntry[];
};

// -------------------------------------------------------
// Static sample — shown while building the design.
// Replace with null (empty state) once the design is approved.
// -------------------------------------------------------

export const SAMPLE_READING: VoiceReading = {
  dominant: {
    name: "The Whisperer",
    essence: "Quiet, tender, protective — a voice that guards before it speaks.",
    img: "/states/whisperer.png",
    fn: "Safety · Privacy · Gentle processing",
    meaning: "Today your writing is protective — turned inward to keep you safe while something settles.",
    nudge: "A day to guard your energy, not push. The quiet is accuracy, not avoidance.",
  },
  secondary: { name: "The Returning Rhythm" },
  explanation:
    "The page moves chiefly through The Whisperer, with The Returning Rhythm threading beneath it at 20%. The two together shape how this piece holds its feeling — the whisperer leading, the returning rhythm steadying.",
  summary:
    "The writing moves softly, returning again and again to a single tender thread before it dares to name it. There is care in how it approaches difficulty — circling, protecting, then quietly opening. By the close, a small honesty has been allowed onto the page.",
  emotional: "A guarded warmth that loosens as the writing continues.",
  narrative: "It organises meaning in slow loops, deferring the hardest line to the end.",
  themes: ["tenderness", "self-protection", "a quiet opening", "letting it be said"],
  distribution: [
    { name: "The Whisperer",        hue: "#c9b4d8", value: 34 },
    { name: "The Returning Rhythm", hue: "#8fc2bd", value: 20 },
    { name: "The Revealing Page",   hue: "#e0a489", value: 18 },
    { name: "The Rooted Mind",      hue: "#a9bd8f", value: 12 },
    { name: "The Rising Voice",     hue: "#e0b265", value: 8  },
    { name: "The Storyteller",      hue: "#9fb4d6", value: 8  },
  ],
};

// -------------------------------------------------------
// Starter prompts (empty state)
// -------------------------------------------------------

const STARTER_PROMPTS = [
  "I keep circling the same worry and I'm not sure why.",
  "Something shifted today and I want to name it.",
  "I'm grateful, but underneath it I feel tired.",
];

// -------------------------------------------------------
// Lotus bloom SVG
// Petal math ported from StorySignal.dc.html prototype.
// -------------------------------------------------------

function buildBloom(dist: DistributionEntry[]) {
  const cx = 140, cy = 140;
  const maxVal = Math.max(...dist.map((d) => d.value), 1);

  // Rotate local point (x,y) by deg degrees around (cx,cy)
  function rot(x: number, y: number, deg: number): [number, number] {
    const r = (deg * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    return [cx + (x * c - y * s), cy + (x * s + y * c)];
  }

  const f = ([x, y]: [number, number]) => `${x.toFixed(1)} ${y.toFixed(1)}`;

  const petals = dist.map((d, i) => {
    const ang = i * 60;
    const sc = 0.5 + 0.5 * (d.value / maxVal);
    const isDom = d.value === maxVal;

    const p0  = rot(0,   0,          ang);
    const c1a = rot(24,  -46 * sc,   ang);
    const c1b = rot(18,  -102 * sc,  ang);
    const tip = rot(0,   -120 * sc,  ang);
    const c2a = rot(-18, -102 * sc,  ang);
    const c2b = rot(-24, -46 * sc,   ang);

    const path = `M ${f(p0)} C ${f(c1a)} ${f(c1b)} ${f(tip)} C ${f(c2a)} ${f(c2b)} ${f(p0)} Z`;

    return (
      <path
        key={d.name}
        d={path}
        fill={d.hue}
        fillOpacity={isDom ? 0.92 : 0.55}
        stroke={d.hue}
        strokeOpacity={0.92}
        strokeWidth={isDom ? 1.6 : 0.8}
      />
    );
  });

  return (
    <svg
      viewBox="0 0 280 280"
      width="100%"
      style={{ maxWidth: 260, overflow: "visible" }}
      aria-hidden="true"
    >
      <g
        style={{
          animation: "ss-breathe 9s ease-in-out infinite",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      >
        {petals}
        <circle cx={cx} cy={cy} r={7} fill="#15120d" stroke="var(--gold)" strokeWidth={1.5} />
      </g>
    </svg>
  );
}

// -------------------------------------------------------
// Component
// -------------------------------------------------------

type Props = {
  reading: VoiceReading | null;
  onUsePrompt?: (text: string) => void;
};

export default function ReadingCard({ reading, onUsePrompt }: Props) {
  // Sort distribution descending for the legend
  const sortedDist = reading
    ? [...reading.distribution].sort((a, b) => b.value - a.value)
    : [];

  return (
    <section className={styles.card}>
      <div className={styles.eyebrow}>Your reading</div>

      {/* ── Empty state ── */}
      {!reading && (
        <div className={styles.empty}>
          <div className={styles.halo}>
            <Image
              src="/tes-logo.png"
              alt=""
              width={62}
              height={62}
              className={styles.emptyLogo}
            />
          </div>
          <h3 className={styles.emptyTitle}>A quiet page, waiting.</h3>
          <p className={styles.emptyBody}>
            Write something on the left and StorySignal will reflect the voice
            states moving through it.
          </p>
          {onUsePrompt && (
            <>
              <div className={styles.promptsLabel}>Not sure where to start?</div>
              <div className={styles.prompts}>
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    className={styles.prompt}
                    onClick={() => onUsePrompt(p)}
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Result state ── */}
      {reading && (
        <div className={styles.result}>
          {/* Headline: portrait + dominant name */}
          <div className={styles.headline}>
            <Image
              src={reading.dominant.img}
              alt={reading.dominant.name}
              width={118}
              height={118}
              className={styles.medallion}
            />
            <div className={styles.dominantMeta}>
              <div className={styles.dominantEyebrow}>Dominant voice state</div>
              <h2 className={styles.dominantName}>{reading.dominant.name}</h2>
              <div className={styles.dominantFn}>{reading.dominant.fn}</div>
            </div>
          </div>

          {/* Essence + explanation */}
          <p className={styles.essence}>{reading.dominant.essence}</p>
          <p className={styles.explanation}>{reading.explanation}</p>

          {/* Plain-language panel */}
          <div className={styles.plainPanel}>
            <div>
              <div className={styles.plainLabel}>What this is, plainly</div>
              <p className={styles.plainText}>{reading.dominant.meaning}</p>
            </div>
            <div className={styles.plainDivider} />
            <div>
              <div className={styles.plainLabel}>What today asks of you</div>
              <p className={styles.plainSerif}>{reading.dominant.nudge}</p>
            </div>
          </div>

          {/* Bloom SVG + distribution legend */}
          <div className={styles.bloomGrid}>
            <div className={styles.bloomWrap}>{buildBloom(reading.distribution)}</div>
            <div>
              <div className={styles.legendEyebrow}>Voice state distribution</div>
              <div className={styles.legend}>
                {sortedDist.map((d, i) => (
                  <div key={d.name} className={styles.legendRow}>
                    <span
                      className={styles.legendDot}
                      style={{ background: d.hue }}
                    />
                    <span
                      className={`${styles.legendName} ${
                        i === 0 ? styles.legendDominant : styles.legendSecondary
                      }`}
                    >
                      {d.name}
                    </span>
                    <span className={styles.legendValue}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary — cream card */}
          <div className={styles.summary}>
            <div className={styles.summaryEyebrow}>Summary</div>
            <p className={styles.summaryBody}>{reading.summary}</p>
          </div>

          {/* Signals */}
          <div className={styles.signalsGrid}>
            <div className={styles.signalCard}>
              <div className={styles.signalEyebrow}>Emotional signal</div>
              <p className={styles.signalBody}>{reading.emotional}</p>
            </div>
            <div className={styles.signalCard}>
              <div className={styles.signalEyebrow}>Narrative signal</div>
              <p className={styles.signalBody}>{reading.narrative}</p>
            </div>
          </div>

          {/* Key themes */}
          <div className={styles.themesSection}>
            <div className={styles.themesEyebrow}>Key themes</div>
            <div className={styles.tagRow}>
              {reading.themes.map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          </div>

          <p className={styles.disclaimer}>
            StorySignal offers gentle, non-clinical reflection. It does not replace professional support.
          </p>
        </div>
      )}
    </section>
  );
}

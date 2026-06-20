"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./Plan.module.css";

const FREE_FEATURES = [
  { icon: "✓", label: "Up to 5 readings per day",               muted: false },
  { icon: "✓", label: "Full voice-state reading each time",      muted: false },
  { icon: "✓", label: "Your last 3 readings, on this device",    muted: false },
  { icon: "—", label: "No long-term journey or trends",          muted: true  },
];

const PAID_FEATURES = [
  { icon: "✓", label: "Unlimited readings, no daily cap",                    muted: false },
  { icon: "✦", label: "Every reading kept — your full journey, retained",    muted: false, gold: true },
  { icon: "✦", label: "See how your voice states shift across time",         muted: false, gold: true },
  { icon: "✓", label: "Revisit and continue any past reflection",            muted: false },
  { icon: "✓", label: "Synced across your devices",                          muted: false },
];

export default function PlanPage() {
  // In production this derives from Supabase is_paid.
  // For now treat everyone as free so the upgrade CTA is always visible.
  const isPaid = false;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Header */}
        <header className={styles.header}>
          <Link href="/" className={styles.backBtn}>← Back</Link>
          <div className={styles.wordmark}>
            <Image src="/tes-logo.png" alt="" width={26} height={26} />
            <span className={styles.wordmarkText}>StorySignal</span>
          </div>
        </header>

        {/* Intro */}
        <div className={styles.intro}>
          <h1 className={styles.title}>Follow the whole thread.</h1>
          <p className={styles.subtitle}>
            No voice state is better than another — and neither is a single
            reading. The meaning lives in the movement between them, over time.
          </p>
        </div>

        {/* Plan cards */}
        <div className={styles.grid}>

          {/* Free */}
          <div className={styles.freeCard}>
            <span className={`${styles.tierLabel} ${styles.tierLabelFree}`}>Free</span>
            <div className={styles.price}>
              <span className={styles.priceAmount}>$0</span>
              <span className={styles.pricePer}>/ forever</span>
            </div>
            <p className={styles.cardSub}>For the occasional check-in.</p>
            <div className={styles.features}>
              {FREE_FEATURES.map((f) => (
                <div key={f.label} className={styles.feature}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span style={{ color: f.muted ? "var(--muted)" : "var(--text)" }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
            <button
              className={`${styles.freeBtn} ${isPaid ? "" : styles.currentPlanBtn}`}
              disabled={!isPaid}
            >
              {isPaid ? "Switch to Free" : "Your current plan"}
            </button>
          </div>

          {/* Premium */}
          <div className={styles.paidCard}>
            <span className={styles.badge}>Keeps your memory</span>
            <span className={`${styles.tierLabel} ${styles.tierLabelPaid}`}>Premium</span>
            <div className={styles.price}>
              <span className={styles.priceAmount}>$9</span>
              <span className={styles.pricePer}>/ month</span>
            </div>
            <p className={styles.cardSub}>For an unbroken, evolving reflection practice.</p>
            <div className={styles.features}>
              {PAID_FEATURES.map((f) => (
                <div key={f.label} className={styles.feature}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span style={{ color: f.gold ? "var(--gold-soft)" : "var(--text)" }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
            <button
              className={`${styles.paidBtn} ${styles.currentPlanBtn}`}
              disabled
            >
              Coming soon
            </button>
          </div>

        </div>

        <p className={styles.finePrint}>Cancel anytime. Your readings remain yours.</p>

      </div>
    </div>
  );
}

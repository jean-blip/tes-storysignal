"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useTier } from "../../lib/useTier";
import styles from "./Plan.module.css";

const FREE_FEATURES = [
  { icon: "✓", label: "Up to 5 readings per day",            muted: false },
  { icon: "✓", label: "Full voice-state reading each time",  muted: false },
  { icon: "✓", label: "Your last 3 readings, on this device",muted: false },
  { icon: "—", label: "No long-term journey or trends",      muted: true  },
];

const PAID_FEATURES = [
  { icon: "✓", label: "25 readings per day",                                muted: false },
  { icon: "✦", label: "Every reading kept — your full journey, retained",   muted: false, gold: true },
  { icon: "✦", label: "See how your voice states shift across time",        muted: false, gold: true },
  { icon: "✓", label: "Speak instead of type — dictate your entry",        muted: false },
  { icon: "✓", label: "Revisit and continue any past reflection",           muted: false },
];

export default function PlanPage() {
  const { tier, loading: tierLoading } = useTier();
  const isPaid = tier === "premium";

  const [annual, setAnnual]       = useState(true); // default annual
  const [checking, setChecking]   = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [err, setErr]             = useState("");

  async function handleUpgrade() {
    setChecking(true);
    setErr("");
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email ?? "";

    const res  = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: annual ? "annual" : "monthly", email }),
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
    } else {
      setErr("Something went wrong — please try again.");
      setChecking(false);
    }
  }

  async function handlePortal() {
    setPortalBusy(true);
    setErr("");
    const { data: { user } } = await supabase.auth.getUser();
    const res  = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user?.email }),
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
    } else {
      setErr(json.error ?? "Could not open billing portal.");
      setPortalBusy(false);
    }
  }

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

        {/* Billing toggle */}
        {!isPaid && (
          <div className={styles.toggle}>
            <button
              className={`${styles.toggleBtn} ${annual ? "" : styles.toggleBtnActive}`}
              onClick={() => setAnnual(false)}
            >
              Monthly · $12
            </button>
            <button
              className={`${styles.toggleBtn} ${annual ? styles.toggleBtnActive : ""}`}
              onClick={() => setAnnual(true)}
            >
              Annual · $96 <span className={styles.saveBadge}>save 33%</span>
            </button>
          </div>
        )}

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
                  <span style={{ color: f.muted ? "var(--muted)" : "var(--text)" }}>{f.label}</span>
                </div>
              ))}
            </div>
            <button
              className={`${styles.freeBtn} ${!isPaid ? styles.currentPlanBtn : ""}`}
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
              {annual ? (
                <>
                  <span className={styles.priceAmount}>$96</span>
                  <span className={styles.pricePer}>/ year · ~$8/mo</span>
                </>
              ) : (
                <>
                  <span className={styles.priceAmount}>$12</span>
                  <span className={styles.pricePer}>/ month</span>
                </>
              )}
            </div>
            <p className={styles.cardSub}>For an unbroken, evolving reflection practice.</p>
            <div className={styles.features}>
              {PAID_FEATURES.map((f) => (
                <div key={f.label} className={styles.feature}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span style={{ color: f.gold ? "var(--gold-soft)" : "var(--text)" }}>{f.label}</span>
                </div>
              ))}
            </div>

            {isPaid ? (
              <button
                className={`${styles.paidBtn} ${styles.currentPlanBtn}`}
                onClick={handlePortal}
                disabled={portalBusy}
              >
                {portalBusy ? "Opening…" : "Manage subscription"}
              </button>
            ) : (
              <button
                className={styles.paidBtn}
                onClick={handleUpgrade}
                disabled={checking || tierLoading}
              >
                {checking ? "Redirecting…" : `Upgrade to Premium`}
              </button>
            )}
          </div>

        </div>

        {err && <p className={styles.errMsg}>{err}</p>}

        <p className={styles.finePrint}>Cancel anytime. Your readings remain yours.</p>

        {/* About strip */}
        <div className={styles.about}>
          Built on <strong>Voice Intelligence</strong> by <strong>Jean Dorff</strong> — part of the wider work of <strong>The Empowering Story.</strong>
        </div>

      </div>
    </div>
  );
}

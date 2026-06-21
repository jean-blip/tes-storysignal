"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useTier } from "../../lib/useTier";
import styles from "./Plan.module.css";

// -------------------------------------------------------
// Clarity Call CTA
// -------------------------------------------------------
function ClarityCall() {
  const [path, setPath]         = useState<"self" | "coach" | null>(null);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [note, setNote]         = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy]         = useState(false);
  const [done, setDone]         = useState(false);
  const [err, setErr]           = useState("");

  async function handlePath(p: "self" | "coach") {
    setPath(p);
    setErr("");
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) setEmail(user.email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setErr("Please enter your name and email."); return; }
    setBusy(true);
    setErr("");
    const { data: { session } } = await supabase.auth.getSession();
    const res  = await fetch("/api/clarity-call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ name, email, note, path, honeypot }),
    });
    const json = await res.json();
    if (res.ok) {
      setDone(true);
    } else {
      setErr(json.error ?? "Something went wrong — please try again.");
    }
    setBusy(false);
  }

  return (
    <div className={styles.clarityWrap}>
      <div className={styles.clarityInner}>
        <p className={styles.clarityEyebrow}>Free · No obligation</p>
        <h2 className={styles.clarityTitle}>Not sure where to start?<br />Book a free clarity call.</h2>
        <p className={styles.claritySub}>
          A short conversation to see where you are, what StorySignal can offer you,
          and whether it fits what you're looking for.
        </p>

        {!done ? (
          <>
            <div className={styles.pathRow}>
              <button
                className={`${styles.pathBtn} ${path === "self" ? styles.pathBtnActive : ""}`}
                onClick={() => handlePath("self")}
                type="button"
              >
                For myself
              </button>
              <button
                className={`${styles.pathBtn} ${path === "coach" ? styles.pathBtnActive : ""}`}
                onClick={() => handlePath("coach")}
                type="button"
              >
                For coaches &amp; practitioners
              </button>
            </div>

            {path && (
              <form className={styles.clarityForm} onSubmit={handleSubmit}>
                {/* Honeypot — hidden from real users */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ position: "absolute", left: "-9999px" }}
                  tabIndex={-1}
                  aria-hidden="true"
                  autoComplete="off"
                />
                <input
                  className={styles.clarityInput}
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className={styles.clarityInput}
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className={styles.clarityInput}
                  type="text"
                  placeholder="Anything you'd like to focus on — optional"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {err && <p className={styles.clarityErr}>{err}</p>}
                <button className={styles.claritySubmit} type="submit" disabled={busy}>
                  {busy ? "Sending…" : "Request my call"}
                </button>
              </form>
            )}
          </>
        ) : (
          <div className={styles.clarityConfirm}>
            <p className={styles.clarityConfirmTitle}>Thank you — we've got it.</p>
            <p className={styles.claritySub}>
              We'll be in touch from <strong>call@storysignal.app</strong> with a link to choose
              a time for your {path === "coach" ? "practitioner" : "personal"} call.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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
    try {
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
        setErr(json.error ?? "Something went wrong — please try again.");
        setChecking(false);
      }
    } catch (e) {
      setErr("Could not connect to payment service — please try again.");
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

        {/* Clarity Call CTA */}
        <ClarityCall />

        {/* About strip */}
        <div className={styles.about}>
          Built on <strong>Voice Intelligence</strong> by <strong>Jean Dorff</strong> — part of the wider work of <strong>The Empowering Story.</strong>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./Login.module.css";

type Mode = "login" | "signup" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const isLogin  = mode === "login";
  const isSignup = mode === "signup";

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setSuccess("");
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
      },
    });
    if (error) { setError(error.message); }
    else { setSuccess("Magic link sent — check your inbox and click the link to sign in."); }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const m = error.message.toLowerCase();
        setError(
          m.includes("confirm")
            ? "Please confirm your email first — check your inbox."
            : m.includes("invalid")
            ? "Email or password is incorrect."
            : error.message
        );
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/login`
              : undefined,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Supabase returns empty identities when email already exists
      if (data.user?.identities?.length === 0) {
        setError("That email is already registered — try logging in instead.");
        setLoading(false);
        return;
      }
      setSuccess("Account created — check your inbox for the confirmation link.");
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>

        {/* ---- Brand half ---- */}
        <div className={styles.brand}>
          <div className={styles.brandTop}>
            <Image src="/tes-logo.png" alt="" width={40} height={40} />
            <span className={styles.brandName}>StorySignal</span>
          </div>

          <div className={styles.halo}>
            <Image
              src="/tes-logo.png"
              alt="StorySignal"
              width={92}
              height={92}
              className={styles.haloLogo}
            />
          </div>

          <h1 className={styles.headline}>
            Listen to the movement within your writing.
          </h1>
          <p className={styles.brandBody}>
            A gentle, non-clinical reflection tool. Write freely, and
            StorySignal reflects the emotional and narrative currents moving
            through the page — never a verdict, only a mirror.
          </p>
          <div className={styles.sixNote}>
            <span className={styles.goldDot} />
            Six Voice States · none above another
          </div>
        </div>

        {/* ---- Auth half ---- */}
        <div className={styles.authWrap}>
          <div className={styles.card}>

            {/* Tab switcher */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${isLogin ? styles.tabActive : styles.tabInactive}`}
                onClick={() => switchMode("login")}
              >
                Log in
              </button>
              <button
                className={`${styles.tab} ${isSignup ? styles.tabActive : styles.tabInactive}`}
                onClick={() => switchMode("signup")}
              >
                Create account
              </button>
            </div>

            <h2 className={styles.cardTitle}>
              {isLogin ? "Welcome back" : mode === "magic" ? "Magic link" : "Begin your reflection"}
            </h2>
            <p className={styles.cardSub}>
              {isLogin
                ? "Pick up where your story left off."
                : mode === "magic"
                ? "We'll email you a one-click sign-in link."
                : "A space to listen to your own writing."}
            </p>

            {/* Magic link form */}
            {mode === "magic" && (
              <form className={styles.fields} onSubmit={handleMagicLink}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error   && <div className={styles.errorMsg}>{error}</div>}
                {success && <div className={styles.successMsg}>{success}</div>}
                <button type="submit" className={styles.primaryBtn} disabled={loading}>
                  {loading ? "Sending…" : "Send magic link"}
                </button>
                <button type="button" className={styles.freeBtn} onClick={() => switchMode("login")}>
                  ← Back to log in
                </button>
              </form>
            )}

            {/* Email + password form */}
            {mode !== "magic" && (
            <form className={styles.fields} onSubmit={handleSubmit}>
              {/* Name — signup only */}
              {isSignup && (
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Name</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="What should we call you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              {/* Email */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className={styles.field}>
                <div className={styles.fieldRow}>
                  <label className={styles.fieldLabel}>Password</label>
                  {isLogin && (
                    <Link href="/forgot-password" className={styles.forgotLink}>
                      Forgot?
                    </Link>
                  )}
                </div>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error   && <div className={styles.errorMsg}>{error}</div>}
              {success && <div className={styles.successMsg}>{success}</div>}

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading}
              >
                {loading
                  ? isLogin ? "Logging in…" : "Creating account…"
                  : isLogin ? "Log in" : "Create account"}
              </button>
            </form>
            )}

            {mode !== "magic" && (
              <>
                <div className={styles.divider}>
                  <span className={styles.dividerLine} />
                  or
                  <span className={styles.dividerLine} />
                </div>
                <button className={styles.freeBtn} onClick={() => switchMode("magic")}>
                  Send me a magic link instead
                </button>
              </>
            )}

            <p className={styles.finePrint}>
              Gentle, non-clinical reflection. It does not replace professional support.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

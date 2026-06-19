"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const m = error.message.toLowerCase();
      setError(
        m.includes("confirm")
          ? "Please confirm your email first — check your inbox for the link."
          : m.includes("invalid")
          ? "Email or password is incorrect."
          : error.message
      );
      setLoading(false);
      return;
    }

    setMessage("Login successful. Redirecting…");
    router.push("/");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className={styles.inputWrapper}>
        <input
          type={showPass ? "text" : "password"}
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className={styles.eye} onClick={() => setShowPass(!showPass)}>
          {showPass ? "👁️" : "👁️‍🗨️"}
        </span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.success}>{message}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Logging in…" : "Log In"}
      </button>

      <p className={styles.forgotPassword}>
        <a href="/forgot-password" className={styles.forgotLink}>
          Forgot your password?
        </a>
      </p>
    </form>
  );
}

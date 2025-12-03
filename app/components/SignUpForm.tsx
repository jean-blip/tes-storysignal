"use client";

import { useState } from "react";
import styles from "./SignUpForm.module.css";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");      // success
  const [error, setError] = useState("");          // errors

  const passwordsMatch = password === confirm && confirm.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!passwordsMatch) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
  const msg = (data.error || "").toLowerCase();

  // --- Handle "email already registered" clearly ---
  if (
    msg.includes("already registered") ||
    msg.includes("email already exists") ||
    msg.includes("email address already exists")
  ) {
    setError("This email is already registered. Please log in instead.");
    return;
  }

  // All other errors → show original error
  setError(data.error || "Something went wrong.");
  return;
}

    } catch (err) {
      setError("Network error. Please try again.");
    }

    setLoading(false);
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

      {/* PASSWORD FIELD */}
      <div className={styles.inputWrapper}>
        <input
          type={showPass ? "text" : "password"}
          placeholder="Create your password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className={!passwordsMatch && confirm.length > 0 ? styles.errorInput : ""}
        />
        <span className={styles.eye} onClick={() => setShowPass(!showPass)}>
          {showPass ? "👁️" : "👁️‍🗨️"}
        </span>
      </div>

      {/* CONFIRM PASSWORD */}
      <div className={styles.inputWrapper}>
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm your password so you don’t lose access"
          value={confirm}
          required
          onChange={(e) => setConfirm(e.target.value)}
          className={!passwordsMatch && confirm.length > 0 ? styles.errorInput : ""}
        />
        <span className={styles.eye} onClick={() => setShowConfirm(!showConfirm)}>
          {showConfirm ? "👁️" : "👁️‍🗨️"}
        </span>
      </div>

      {/* MATCH FEEDBACK */}
      {!passwordsMatch && confirm.length > 0 && (
        <p className={styles.helperError}>These passwords don’t match yet.</p>
      )}

      {passwordsMatch && confirm.length > 0 && (
        <p className={styles.helperSuccess}>Passwords match ✓</p>
      )}

      {/* ERROR MESSAGE */}
      {error && <p className={styles.errorBanner}>{error}</p>}

      {/* SUCCESS MESSAGE */}
      {message && <p className={styles.successBanner}>{message}</p>}

      <button type="submit" disabled={!passwordsMatch || loading}>
        {loading ? "Creating account…" : "Create Free Account"}
      </button>
    </form>
  );
}

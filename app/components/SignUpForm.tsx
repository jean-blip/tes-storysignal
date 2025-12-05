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
  const [message, setMessage] = useState("");      
  const [error, setError] = useState("");          
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const passwordsMatch = password === confirm && confirm.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setResendMessage("");

    if (!passwordsMatch) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = (data.error || "").toLowerCase();

        if (
          msg.includes("already registered") ||
          msg.includes("email already exists") ||
          msg.includes("email address already exists")
        ) {
          setError("This email is already registered. Please log in instead.");
          setLoading(false);
          return;
        }

        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      // SUCCESS
      setMessage(
        data.message ||
          "Your account has been created. Please check your inbox — we’ve sent you a confirmation link."
      );

      setEmail("");
      setPassword("");
      setConfirm("");

      // ---- Auto-redirect to login after 8 seconds ----
      setTimeout(() => {
        window.location.href = "/login";
      }, 8000);

    } catch (err) {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  // ---- Resend confirmation email ----
  async function resendEmail() {
    setResendLoading(true);
    setResendMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to resend confirmation email.");
        setResendLoading(false);
        return;
      }

      setResendMessage("We’ve sent a new confirmation email.");
    } catch (err) {
      setError("Network error. Please try again.");
    }

    setResendLoading(false);
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
      {message && (
        <>
          <p className={styles.successBanner}>{message}</p>

          <button
            type="button"
            className={styles.resendBtn}
            disabled={resendLoading}
            onClick={resendEmail}
          >
            {resendLoading ? "Sending…" : "Resend confirmation email"}
          </button>

          {resendMessage && (
            <p className={styles.successBanner}>{resendMessage}</p>
          )}
        </>
      )}

      <button type="submit" disabled={!passwordsMatch || loading}>
        {loading ? "Creating account…" : "Create Free Account"}
      </button>
    </form>
  );
}

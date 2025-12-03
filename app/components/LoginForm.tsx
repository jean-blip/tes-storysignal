"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed.");
      return;
    }

    setMessage("Login successful. Redirecting…");

    setTimeout(() => router.push("/"), 1000);
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

        <span
          className={styles.eye}
          onClick={() => setShowPass(!showPass)}
        >
          {showPass ? "👁️" : "👁️‍🗨️"}
        </span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.success}>{message}</p>}

      <button type="submit">Log In</button>

      {/* Updated Forgot Password Link */}
      <p className={styles.forgotPassword}>
        <a href="/forgot-password" className={styles.forgotLink}>
          Forgot your password?
        </a>
      </p>
    </form>
  );
}

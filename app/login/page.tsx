"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./LoginPage.module.css";

import SignUpForm from "../components/SignUpForm";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Brand Row: Logo + StorySignal™ */}
        <div className={styles.brandRow}>
          <Image
            src="/tes-logo.png"
            alt="TES Logo"
            width={64}
            height={64}
            className={styles.brandLogo}
            priority
          />

          <div className={styles.brandTextWrapper}>
            <span className={styles.brandText}>StorySignal</span>
            <span className={styles.tm}>™</span>
          </div>
        </div>

        {/* SIGNUP MODE */}
        {mode === "signup" ? (
          <>
            <h1 className={styles.title}>Welcome to StorySignal</h1>

            <p className={styles.subtitle}>
              Your voice holds meaning.
              <br />
              Let’s begin with a free account.
            </p>

            <SignUpForm />

            <p className={styles.footerText}>
              No credit card required. You’ll always have access to your free reflections.
            </p>

            <p className={styles.switchMode}>
              Already have an account?{" "}
              <span onClick={() => setMode("login")}>Log in</span>
            </p>
          </>
        ) : (
          <>
            {/* LOGIN MODE */}
            <h1 className={styles.title}>Welcome back</h1>

            <p className={styles.subtitle}>Good to see you again.</p>

            <LoginForm />

            <p className={styles.switchMode}>
              Don’t have an account?{" "}
              <span onClick={() => setMode("signup")}>Create one</span>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

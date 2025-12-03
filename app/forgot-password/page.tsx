"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setMessage(
          "If this email exists, a login link has been sent."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b0b14] text-white px-6">
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Forgot your password?
        </h2>
        <p className="text-sm text-gray-300 mb-8">
          We’ll email you a secure login link.  
          It works only for registered email addresses.
        </p>

        <input
          type="email"
          placeholder="Your email"
          className="w-full mb-4 p-3 rounded bg-[#1a1a25] border border-gray-600 focus:outline-none focus:border-yellow-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSendLink}
          disabled={loading}
          className="w-full py-3 rounded bg-yellow-600 hover:bg-yellow-700 transition font-medium disabled:opacity-60"
        >
          {loading ? "Sending link…" : "Email login link"}
        </button>

        {message && (
          <p className="text-green-400 mt-4">{message}</p>
        )}
        {error && (
          <p className="text-red-400 mt-4">{error}</p>
        )}

        <p className="text-xs text-gray-500 mt-6">
          Having trouble? Email us at{" "}
          <a
            href="mailto:support@theempoweringstory.com"
            className="underline"
          >
            support@theempoweringstory.com
          </a>{" "}
          and we’ll help you get back in.
        </p>
      </div>
    </div>
  );
}

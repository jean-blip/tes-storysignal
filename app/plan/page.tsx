"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setSending(true);

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        console.error(error);
        setError("Could not send magic link. Try again.");
      } else {
        setMessage("Magic link sent! Check your email.");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-10 max-w-md mx-auto rounded-2xl border border-[#262334] bg-[#181522] px-6 py-6 text-sm text-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <Image src="/tes-logo.png" alt="TES" width={30} height={30} />
        <div className="text-lg font-semibold">StorySignal™</div>
      </div>

      <h1 className="text-base font-semibold mb-2">Sign in with a magic link</h1>
      <p className="text-xs text-slate-400 mb-4">
        Enter your email and we’ll send a secure link to log in.
      </p>

      <form onSubmit={handleSendMagicLink}>
        <input
          type="email"
          className="w-full mb-3 px-3 py-2 rounded bg-[#1f1e24] text-slate-200 border border-[#3a3648]"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full py-2 rounded bg-[#ee9d1a] text-black font-semibold hover:opacity-90"
          disabled={sending}
        >
          {sending ? "Sending…" : "Send Magic Link"}
        </button>
      </form>

      {error && <div className="mt-3 text-red-400">{error}</div>}
      {message && <div className="mt-3 text-green-400">{message}</div>}

      <p className="text-xs text-slate-500 mt-4 text-center">
        No password needed. The magic link signs you in.
      </p>
    </div>
  );
}

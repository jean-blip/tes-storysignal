"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Create client once at module level so it can auto-recover session from URL
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const updatePassword = async () => {
    setErrorMsg("");
    setMessage("");

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    // No manual session games. Just ask Supabase to update the current user.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message); // This is where "Auth session missing" comes from
    } else {
      setMessage("Your password has been successfully updated.");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b0b14] text-white px-6">
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
        <p className="text-sm text-gray-300 mb-8">
          Enter your new password below.
        </p>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-[#1a1a25] border border-gray-600"
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-[#1a1a25] border border-gray-600"
        />

        <button
          onClick={updatePassword}
          className="w-full py-3 rounded bg-yellow-600 hover:bg-yellow-700 transition font-medium"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>

        {message && <p className="text-green-400 mt-4">{message}</p>}
        {errorMsg && <p className="text-red-400 mt-4">{errorMsg}</p>}
      </div>
    </div>
  );
}

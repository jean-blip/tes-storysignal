"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore errors for now – goal is just to get back to /login
      console.error("Logout error", e);
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="w-full h-16 bg-[#1B1B1D] text-white flex items-center justify-between px-6 border-b border-white/10">

      {/* LEFT: Logo + Title */}
      <div className="flex items-center gap-3">
        <Image
          src="/tes-logo.png"
          alt="StorySignal Logo"
          width={32}
          height={32}
          className="rounded-sm"
        />
        <span className="text-xl font-semibold tracking-tight">
          StorySignal<span className="align-super text-xs">™</span>
        </span>
      </div>

      {/* RIGHT: Logout button */}
      <button
        onClick={handleLogout}
        className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 border border-white/30 rounded-md"
      >
        Logout
      </button>
    </div>
  );
}

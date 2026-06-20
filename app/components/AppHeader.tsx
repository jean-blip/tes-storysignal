"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./AppHeader.module.css";

export default function AppHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleExport = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;
    const { data } = await supabase
      .from("storysignal_entries")
      .select("id, created_at, dominant, active_pair, result, kept_text, via_voice")
      .eq("email", user.email)
      .order("created_at", { ascending: false });
    const blob = new Blob([JSON.stringify(data ?? [], null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `storysignal-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Image src="/tes-logo.png" alt="" width={30} height={30} />
        <div className={styles.brandText}>
          <span className={styles.brandName}>StorySignal</span>
          <span className={styles.brandTagline}>A gentle reflection tool</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <Link href="/atlas" className={styles.navBtn}>The Six</Link>
        <Link href="/plan" className={styles.navBtn}>Plans</Link>
        <button className={styles.navBtn} onClick={handleExport}>Export</button>
        <button className={styles.signOutBtn} onClick={handleSignOut}>
          Sign out
        </button>
      </nav>
    </header>
  );
}

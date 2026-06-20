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
        <button className={styles.signOutBtn} onClick={handleSignOut}>
          Sign out
        </button>
      </nav>
    </header>
  );
}

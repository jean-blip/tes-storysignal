"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export type Tier = "free" | "premium";

async function fetchTier(email: string): Promise<Tier> {
  const { data: row } = await supabase
    .from("storysignal_users")
    .select("is_paid")
    .eq("email", email)
    .maybeSingle();
  return row?.is_paid === true ? "premium" : "free";
}

export function useTier(): { tier: Tier; loading: boolean } {
  const [tier, setTier]       = useState<Tier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const justUpgraded =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("upgraded") === "1";

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user?.email) { setLoading(false); return; }
      const email = data.user.email;

      const initial = await fetchTier(email);
      setTier(initial);
      setLoading(false);

      if (justUpgraded && initial !== "premium") {
        // Webhook may still be in flight — poll up to 8 times (8 seconds)
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          const t = await fetchTier(email);
          if (t === "premium" || attempts >= 8) {
            setTier(t);
            clearInterval(poll);
          }
        }, 1000);
      }
    });
  }, []);

  return { tier, loading };
}

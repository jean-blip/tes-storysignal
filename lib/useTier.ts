"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export type Tier = "free" | "premium";

export function useTier(): { tier: Tier; loading: boolean } {
  const [tier, setTier]       = useState<Tier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user?.email) { setLoading(false); return; }

      const { data: row } = await supabase
        .from("storysignal_users")
        .select("is_paid")
        .eq("email", data.user.email)
        .maybeSingle();

      setTier(row?.is_paid === true ? "premium" : "free");
      setLoading(false);
    });
  }, []);

  return { tier, loading };
}

// lib/supabaseClient.ts
// TEMP: hard-coded for local/dev so we stop fighting .env issues.
// Later, we can move these back into NEXT_PUBLIC_ env vars.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://thrglylxdrlkwnsssifm.supabase.co";
const supabaseAnonKey = "sb_publishable_ys2TzIFlDZxQTUATw7h0oQ_JzFtH2Sd";

// If these ever go missing, fail loudly so we see it quickly.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or anon key is missing. Check supabaseClient.ts configuration."
  );
}

// Single shared client for the whole app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

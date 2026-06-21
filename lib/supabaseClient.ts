// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://thrglylxdrlkwnsssifm.supabase.co";
const supabaseAnonKey = "sb_publishable_ys2TzIFlDZxQTUATw7h0oQ_JzFtH2Sd";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
});

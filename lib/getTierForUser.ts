import { createClient } from "@supabase/supabase-js";

export async function getTierForUser(
  email: string
): Promise<"free" | "premium"> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("storysignal_users")
    .select("is_paid")
    .eq("email", email)
    .maybeSingle();

  return data?.is_paid === true ? "premium" : "free";
}

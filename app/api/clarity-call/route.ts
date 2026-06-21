import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { name, email, note, path, honeypot } = await req.json();

  // Silently drop honeypot-filled submissions
  if (honeypot) return NextResponse.json({ ok: true });

  // Validate
  if (!name?.trim() || !email?.trim() || !path) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  if (!["self", "coach"].includes(path)) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  // Require authenticated session
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");

  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to request a call." }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Rate limit: one per user per day
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("clarity_calls")
    .select("id")
    .eq("user_id", user.id)
    .gte("created_at", today)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You've already requested a call today — we'll be in touch soon." },
      { status: 429 }
    );
  }

  // Save to DB
  const { error: dbErr } = await supabase.from("clarity_calls").insert({
    user_id: user.id,
    name: name.trim(),
    email: email.trim(),
    note: note?.trim() ?? null,
    path,
  });

  if (dbErr) {
    return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
  }

  // Send notification email (non-blocking — a failure won't lose the DB record)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "StorySignal <call@storysignal.app>",
        to: ["call@storysignal.app"],
        subject: `New clarity call request — ${path === "coach" ? "Practitioner" : "Personal"}`,
        text: `Name: ${name}\nEmail: ${email}\nPath: ${path}\nNote: ${note || "—"}`,
      }),
    }).catch(() => { /* log silently */ });
  } else {
    console.log(`[clarity-call] RESEND not configured. Request from ${email} (${path}): ${note}`);
  }

  return NextResponse.json({ ok: true });
}

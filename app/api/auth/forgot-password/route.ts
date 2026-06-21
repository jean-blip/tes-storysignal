import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://thrglylxdrlkwnsssifm.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_ys2TzIFlDZxQTUATw7h0oQ_JzFtH2Sd"
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "If this email exists, a password reset link has been sent." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}

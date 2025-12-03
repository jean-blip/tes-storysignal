import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // ---- FIX 1: Catch known Supabase "silent" failures ----
    if (error) {
      // Supabase already provides a readable message in most cases
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // ---- FIX 2: If Supabase reports no error but NO user was created ----
    if (!data?.user) {
      return NextResponse.json(
        {
          error:
            "This email may already be registered. Try signing in or resetting your password.",
        },
        { status: 400 }
      );
    }

    // ---- FIX 3: Handle "user exists but unconfirmed" ----
    if (data.user?.identities?.length === 0) {
      return NextResponse.json(
        {
          error:
            "This email is already registered. Please log in or request a password reset.",
        },
        { status: 400 }
      );
    }

    // Success
    return NextResponse.json(
      {
        message:
          "Account created! Check your email for a confirmation link from Supabase Auth.",
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

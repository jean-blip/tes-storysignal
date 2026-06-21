// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const FREE_LIMIT    = 5;
const PREMIUM_LIMIT = 25;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Utility: keep distribution safe + normalized
function normalizeDistribution(numbers: number[]): number[] {
  const safe = numbers.map((n) => Math.max(0, n));
  const total = safe.reduce((a, b) => a + b, 0);

  if (total === 0) {
    // default gentle spread that still gives a clear dominant archetype
    return [16, 16, 16, 16, 16, 20];
  }

  return safe.map((n) => Math.round((n / total) * 100));
}

export async function POST(req: Request) {
  try {
    const { text, mood, category } = await req.json();

    // --- 40-word minimum (server-side) ---
    const wordCount = text?.trim().split(/\s+/).filter(Boolean).length ?? 0;
    if (wordCount < 40) {
      return NextResponse.json(
        { error: `Your entry needs a little more — at least 40 words to get a meaningful reading. You have ${wordCount} so far.` },
        { status: 400 }
      );
    }

    // --- Daily cap (server-side) ---
    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.replace("Bearer ", "") ?? "";

    if (accessToken) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      );

      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        // Check tier using service role to bypass RLS
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: userRow } = await supabaseAdmin
          .from("storysignal_users")
          .select("is_paid")
          .eq("email", user.email)
          .maybeSingle();

        const isPaid = userRow?.is_paid === true;
        const limit  = isPaid ? PREMIUM_LIMIT : FREE_LIMIT;

        // Count today's entries
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from("storysignal_entries")
          .select("id", { count: "exact", head: true })
          .eq("email", user.email)
          .gte("created_at", todayStart.toISOString());

        const usedToday = count ?? 0;

        if (usedToday >= limit) {
          const tierLabel = isPaid ? "Premium" : "free";
          return NextResponse.json(
            { error: `You've reached your ${tierLabel} limit of ${limit} readings today. Come back tomorrow — your voice will be here.` },
            { status: 429 }
          );
        }
      }
    }

    const userText = text.trim().slice(0, 6000);

    const systemMessage = `
You are StorySignal, an interpretive reading tool.
Your tone is gentle, non-clinical, reflective, and human.
You only describe the movement of the WRITING itself — never the person.

IMPORTANT:
You must STILL return JSON with the *archetype* keys exactly as shown below.
These backend keys DO NOT CHANGE for compatibility.
But the *explanatory text* must use “Voice State” terminology instead of “Archetype”.

Return JSON ONLY in this exact shape:

{
  "summary": "...",
  "emotional_signal": "...",
  "narrative_signal": "...",
  "key_themes": ["...", "..."],
  "archetype_distribution": {
    "The Whisperer": 0-100,
    "The Rising Voice": 0-100,
    "The Returning Rhythm": 0-100,
    "The Rooted Mind": 0-100,
    "The Revealing Page": 0-100,
    "The Storyteller": 0-100
  },
  "dominant_archetype": "...",
  "secondary_archetype": "...",
  "archetype_explanation": "..."
}

Guidelines:
- Use **Voice State** terminology in your text explanations.
- "summary": 3–5 sentences describing the emotional + narrative movement.
- "emotional_signal": 1–2 sentences about the emotional tone or movement.
- "narrative_signal": 1–2 sentences about how the writing organises meaning or time.
- "key_themes": 2–6 short phrases.
- "archetype_distribution": relative expression in THIS writing only (0–100 each).
- "dominant_archetype": the highest-scoring voice state.
- "secondary_archetype": the second-highest.
- "archetype_explanation":
    Write **2–3 sentences explaining the Dominant and Secondary Voice States,**
    how they appear in this writing,
    and how these Voice States interact in this piece.

The six Voice States you MUST use:

- The Whisperer — quiet, tender, cautious, protective emotional presence.
- The Rising Voice — emerging clarity, courage, boundary formation.
- The Returning Rhythm — circling back, memory, integration, repeating emotional patterns.
- The Rooted Mind — grounded, stabilising, intellectual clarity.
- The Revealing Page — emotional exposure, honesty, self-revelation.
- The Storyteller — shaping meaning, narrative momentum, threading pieces into a whole.

Important:
- Talk ONLY about the writing, not the writer.
- Do NOT use diagnostic language or clinical terms.
- Use warm, calm, precise language.
`;


    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemMessage },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            mood ? { type: "text", text: `Mood: ${mood}` } : null,
            category
              ? { type: "text", text: `Category: ${category}` }
              : null,
          ].filter(Boolean) as { type: "text"; text: string }[],
        },
      ],
    });

    const raw = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(raw);

    const dist = parsed.archetype_distribution || {};

    const percentages = [
      dist["The Whisperer"] ?? 0,
      dist["The Rising Voice"] ?? 0,
      dist["The Returning Rhythm"] ?? 0,
      dist["The Rooted Mind"] ?? 0,
      dist["The Revealing Page"] ?? 0,
      dist["The Storyteller"] ?? 0,
    ];

    const normalized = normalizeDistribution(percentages);

    const distNormalized = {
      "The Whisperer": normalized[0],
      "The Rising Voice": normalized[1],
      "The Returning Rhythm": normalized[2],
      "The Rooted Mind": normalized[3],
      "The Revealing Page": normalized[4],
      "The Storyteller": normalized[5],
    };

    const sorted = Object.entries(distNormalized).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0]?.[0] ?? "";
    const secondary = sorted[1]?.[0] ?? "";

    return NextResponse.json(
      {
        summary: parsed.summary ?? "",
        emotional_signal: parsed.emotional_signal ?? "",
        narrative_signal: parsed.narrative_signal ?? "",
        key_themes: parsed.key_themes ?? [],
        archetype_distribution: distNormalized,
        dominant_archetype: parsed.dominant_archetype ?? dominant,
        secondary_archetype: parsed.secondary_archetype ?? secondary,
        archetype_explanation: parsed.archetype_explanation ?? "",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Something went wrong while analyzing the text." },
      { status: 500 }
    );
  }
}

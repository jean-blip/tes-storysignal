import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { states } = await req.json() as { states: string[] };

    if (!states || states.length < 2) {
      return NextResponse.json({ observation: "" });
    }

    const sequence = states.join(" → ");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 120,
      messages: [
        {
          role: "system",
          content: `You write gentle, non-prescriptive observations about the movement of Voice States in someone's writing over time.
Rules:
- 1–2 sentences only.
- Describe movement and presence — never "progress", "improvement", or hierarchy between states.
- No clinical language. No diagnoses. Warm and precise.
- Talk about the writing's movement, not the person.
- Do not name states as "good" or "bad".
- Example tone: "Over these entries, the writing has moved between quieter, protective currents and moments of emerging clarity — a rhythm of gathering and opening."`,
        },
        {
          role: "user",
          content: `The sequence of dominant voice states across ${states.length} readings, oldest to newest: ${sequence}. Write a brief "What we notice" observation.`,
        },
      ],
    });

    const observation = completion.choices[0].message.content?.trim() ?? "";
    return NextResponse.json({ observation });
  } catch {
    return NextResponse.json({ observation: "" });
  }
}

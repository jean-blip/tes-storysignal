import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
  }

  const openaiForm = new FormData();
  openaiForm.append("file", file, "recording.webm");
  openaiForm.append("model", "whisper-1");
  openaiForm.append("language", "en");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: openaiForm,
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const json = await res.json();
  return NextResponse.json({ text: json.text });
}

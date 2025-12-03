// lib/analyze.ts

export type AnalysisResult = {
  summary: string;
  emotional_signal: string;
  narrative_signal: string;
  key_themes: string[];
  archetype_distribution: Record<string, number>;
  dominant_archetype: string;
  secondary_archetype?: string;
  archetype_explanation: string;
};

export async function analyzeText(
  text: string,
  mood: string,
  category: string
): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mood, category }),
  });

  if (!res.ok) {
    let message = "Something went wrong while analyzing the text.";

    try {
      const errJson = await res.json();
      if (errJson?.error) message = errJson.error;
    } catch {
      // ignore JSON parse error, keep default message
    }

    throw new Error(message);
  }

  const data = await res.json();
  return data as AnalysisResult;
}

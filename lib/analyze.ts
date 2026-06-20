// lib/analyze.ts

export type AnalysisResult = {
  summary: string;

  // renamed signals stay the same — they are unrelated to the Voice States
  emotional_signal: string;
  narrative_signal: string;
  key_themes: string[];

  // *** Voice State terminology ***
  voice_state_distribution: Record<string, number>;
  dominant_voice_state: string;
  secondary_voice_state?: string;
  voice_state_explanation: string;

  // *** Backwards compatibility for any old saved results ***
  dominant_archetype?: string;
  secondary_archetype?: string;
  archetype_distribution?: Record<string, number>;
  archetype_explanation?: string;
};

export async function analyzeText(
  text: string,
  mood: string,
  category: string,
  accessToken?: string
): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ text, mood, category }),
  });

  if (!res.ok) {
    let message = "Something went wrong while analyzing the text.";

    try {
      const errJson = await res.json();
      if (errJson?.error) message = errJson.error;
    } catch {
      // ignore JSON parse error
    }

    throw new Error(message);
  }

  const data = await res.json();

  // --- Backwards compatibility mapping ---
  // If older archetype keys exist, convert them into the new Voice State naming.
  if (data.dominant_archetype && !data.dominant_voice_state) {
    data.dominant_voice_state = data.dominant_archetype;
    data.secondary_voice_state = data.secondary_archetype;
    data.voice_state_distribution = data.archetype_distribution;
    data.voice_state_explanation = data.archetype_explanation;
  }

  return data as AnalysisResult;
}

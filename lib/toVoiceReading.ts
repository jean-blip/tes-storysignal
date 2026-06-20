import { type AnalysisResult } from "./analyze";
import { getState, VOICE_STATES } from "./voiceStates";
import { type VoiceReading } from "../app/components/ReadingCard";

export function toVoiceReading(result: AnalysisResult): VoiceReading {
  const distObj =
    result.archetype_distribution ??
    result.voice_state_distribution ??
    {};

  // Build distribution array in canonical state order, with hues
  const distribution = VOICE_STATES.map((s) => ({
    name: s.name,
    hue: s.hue,
    value: Math.round(Number(distObj[s.name] ?? 0)),
  }));

  // Normalize so values sum to exactly 100
  const total = distribution.reduce((a, b) => a + b.value, 0) || 1;
  const normalized = distribution.map((d) => ({
    ...d,
    value: Math.round((d.value / total) * 100),
  }));
  const diff = 100 - normalized.reduce((a, b) => a + b.value, 0);
  const maxEntry = normalized.reduce((a, b) => (b.value > a.value ? b : a));
  maxEntry.value += diff;

  const dominantName =
    result.dominant_archetype ?? result.dominant_voice_state ?? "";
  const secondaryName =
    result.secondary_archetype ?? result.secondary_voice_state ?? "";

  const domState = getState(dominantName);

  return {
    dominant: {
      name:    domState.name,
      essence: domState.essence,
      img:     domState.img,
      fn:      domState.fn,
      meaning: domState.meaning,
      nudge:   domState.nudge,
    },
    secondary: { name: secondaryName },
    explanation: result.archetype_explanation ?? result.voice_state_explanation ?? "",
    summary:     result.summary,
    emotional:   result.emotional_signal,
    narrative:   result.narrative_signal,
    themes:      result.key_themes ?? [],
    distribution: normalized,
  };
}

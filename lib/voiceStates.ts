// Canonical Voice State definitions — single source of truth for
// hues, portraits, function lines, and plain-language copy.

export type VoiceStateDef = {
  name: string;
  hue: string;
  img: string;
  fn: string;
  essence: string;
  meaning: string;
  nudge: string;
};

export const VOICE_STATES: VoiceStateDef[] = [
  {
    name: "The Whisperer",
    hue: "#c9b4d8",
    img: "/states/whisperer.png",
    fn: "Safety · Privacy · Gentle processing",
    essence: "Quiet, tender, protective — a voice that guards before it speaks.",
    meaning: "Today your writing is protective — turned inward to keep you safe while something settles.",
    nudge: "A day to guard your energy, not push. The quiet is accuracy, not avoidance.",
  },
  {
    name: "The Rising Voice",
    hue: "#e0b265",
    img: "/states/rising-voice.png",
    fn: "Emergence · Courage · Boundaries",
    essence: "Emerging clarity and courage, drawing its first firm boundaries.",
    meaning: "Something in you is stepping forward — finding its edge and starting to claim it.",
    nudge: "A day to say the thing. Let the boundary be drawn while the courage is here.",
  },
  {
    name: "The Returning Rhythm",
    hue: "#8fc2bd",
    img: "/states/returning-rhythm.png",
    fn: "Rhythm · Memory · Restoration",
    essence: "Circling back through memory, integrating what repeats.",
    meaning: "You're circling back — revisiting what matters to find your pace again.",
    nudge: "A day to slow and repeat, not decide. Rhythm is restoring you; let it.",
  },
  {
    name: "The Rooted Mind",
    hue: "#a9bd8f",
    img: "/states/rooted-mind.png",
    fn: "Grounding · Structure · Stability",
    essence: "Grounded and stabilising — thought that holds its own weight.",
    meaning: "You're steadying yourself — putting thoughts in order so things stop feeling scattered.",
    nudge: "A good day to set things in order. Structure now is what lets the rest relax.",
  },
  {
    name: "The Revealing Page",
    hue: "#e0a489",
    img: "/states/revealing-page.png",
    fn: "Exposure · Honesty · Disclosure",
    essence: "Honest exposure; the page where something true is finally said.",
    meaning: "You're being honest — letting something true come out instead of holding it in.",
    nudge: "A day for openness. What you name today loses its weight by being said.",
  },
  {
    name: "The Storyteller",
    hue: "#9fb4d6",
    img: "/states/storyteller.png",
    fn: "Integration · Meaning · Narrative",
    essence: "Shaping meaning and momentum, threading pieces into a whole.",
    meaning: "You're making sense of things — threading scattered moments into a story that holds.",
    nudge: "A day to connect the dots. Tell it as a whole and the meaning will steady.",
  },
];

export function getState(name: string): VoiceStateDef {
  return (
    VOICE_STATES.find((s) => s.name === name) ?? VOICE_STATES[0]
  );
}

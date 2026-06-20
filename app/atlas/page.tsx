"use client";

import Image from "next/image";
import Link from "next/link";
import { VOICE_STATES } from "../../lib/voiceStates";
import styles from "./Atlas.module.css";

const PAIRS = [
  {
    title: "Safety & Structure",
    sub: "Regulating exposure · holding form",
    states: ["The Whisperer", "The Rooted Mind"],
  },
  {
    title: "Emergence",
    sub: "Allowing voice to surface",
    states: ["The Rising Voice", "The Revealing Page"],
  },
  {
    title: "Integration",
    sub: "Restoring rhythm · shaping meaning",
    states: ["The Returning Rhythm", "The Storyteller"],
  },
];

export default function AtlasPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Header */}
        <header className={styles.header}>
          <Link href="/" className={styles.backBtn}>← Back</Link>
          <div className={styles.wordmark}>
            <Image src="/tes-logo.png" alt="" width={26} height={26} />
            <span className={styles.wordmarkText}>StorySignal</span>
          </div>
        </header>

        {/* Intro */}
        <div className={styles.intro}>
          <div className={styles.eyebrow}>The Six Voices</div>
          <h1 className={styles.title}>Meet the voice states.</h1>
          <p className={styles.subtitle}>
            Six ways a voice locates itself before it speaks. None is higher
            than another — they move in pairs, balancing one another as
            conditions change.
          </p>
        </div>

        {/* Pair groups */}
        <div className={styles.groups}>
          {PAIRS.map((pair) => {
            const pairStates = pair.states.map(
              (name) => VOICE_STATES.find((s) => s.name === name)!
            );
            return (
              <div key={pair.title}>
                <div className={styles.pairDivider}>
                  <span className={styles.pairTitle}>{pair.title}</span>
                  <span className={styles.pairLine} />
                  <span className={styles.pairSub}>{pair.sub}</span>
                </div>
                <div className={styles.pairGrid}>
                  {pairStates.map((st) => (
                    <div key={st.name} className={styles.stateCard}>
                      <Image
                        src={st.img}
                        alt={st.name}
                        width={104}
                        height={104}
                        className={styles.medallion}
                        style={{ border: `1.5px solid ${st.hue}` }}
                      />
                      <div className={styles.stateMeta}>
                        <h3 className={styles.stateName}>{st.name}</h3>
                        <div className={styles.stateFn}>{st.fn}</div>
                        <p className={styles.stateDesc}>{st.essence}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing quote */}
        <div className={styles.quote}>
          <p className={styles.quoteText}>
            "Voice does not need permission to exist. It needs conditions."
          </p>
          <span className={styles.quoteAttrib}>Voice Intelligence — Jean Dorff</span>
        </div>

      </div>
    </div>
  );
}

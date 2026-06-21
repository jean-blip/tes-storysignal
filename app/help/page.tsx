"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Help.module.css";

const SECTIONS = [
  {
    heading: "Speaking instead of typing",
    items: [
      {
        q: "The mic button isn't doing anything.",
        a: "Speak to type is a Premium feature. If you're on a free account, the mic button will take you to the upgrade page instead of recording.",
      },
      {
        q: "I clicked the mic but nothing was transcribed.",
        a: "Make sure your browser has microphone permission. In Chrome: click the lock icon in the address bar → Microphone → Allow. In Safari: go to Settings → Websites → Microphone and set StorySignal to Allow.",
      },
      {
        q: "It transcribed something completely wrong.",
        a: "Speak clearly and close to your microphone. Background noise — music, TV, open windows — can confuse the transcription. A quiet room works best.",
      },
      {
        q: "It only returned one word or something that makes no sense.",
        a: "This usually means the recording captured silence. Check that your microphone is selected as the input device: on Mac go to System Settings → Sound → Input and make sure the correct mic is selected. Then reload the page and try again.",
      },
      {
        q: "Voice input works on my phone but not my laptop.",
        a: "Your laptop may be routing audio to a different input device — a headset, an external interface, or a virtual audio driver. Check System Settings → Sound → Input (Mac) or Settings → Sound → Input device (Windows) and switch to your built-in microphone.",
      },
      {
        q: "Which browsers support voice input?",
        a: "Voice input works in Chrome, Safari, Firefox, and Edge on both desktop and mobile. Chrome on Android and Safari on iPhone tend to work most reliably.",
      },
    ],
  },
  {
    heading: "Logging in",
    items: [
      {
        q: "I didn't receive the magic link email.",
        a: "Check your spam or junk folder. If it's not there, wait a minute and try again — there is a short delay. If you see 'email rate limit exceeded', wait an hour before requesting another link.",
      },
      {
        q: "The magic link says it expired.",
        a: "Magic links are valid for 24 hours. Request a new one from the login page.",
      },
    ],
  },
  {
    heading: "Premium & billing",
    items: [
      {
        q: "I just upgraded but the app still shows free.",
        a: "Wait a few seconds and refresh the page — your account updates automatically after payment. If it still shows free after a minute, log out and log back in.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to the Plan page inside the app and click 'Manage subscription'. That opens the billing portal where you can cancel anytime. Your access continues until the end of the current billing period.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <header className={styles.header}>
          <Link href="/" className={styles.backBtn}>← Back</Link>
          <div className={styles.wordmark}>
            <Image src="/tes-logo.png" alt="" width={26} height={26} />
            <span className={styles.wordmarkText}>StorySignal</span>
          </div>
        </header>

        <div className={styles.intro}>
          <h1 className={styles.title}>Help & troubleshooting</h1>
          <p className={styles.subtitle}>
            Something not working the way you expected? Most issues are small and easy to fix.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.heading} className={styles.section}>
            <h2 className={styles.sectionHeading}>{section.heading}</h2>
            <div className={styles.items}>
              {section.items.map((item) => (
                <div key={item.q} className={styles.item}>
                  <p className={styles.question}>{item.q}</p>
                  <p className={styles.answer}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.contact}>
          <p>Still stuck? Write to <a href="mailto:hello@theempoweringstory.com" className={styles.link}>hello@theempoweringstory.com</a> and we'll help you get sorted.</p>
        </div>

      </div>
    </div>
  );
}

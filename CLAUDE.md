# StorySignal — Working rules for Claude Code

You are helping a **solo, non-developer founder** port a redesign into this existing
**Next.js + Supabase** app (deployed on Render). Read these rules before doing anything, and
follow them every session.

## The source of truth
- The redesign spec is `design_handoff_storysignal_redesign/README.md`. Read it **in full**
  before writing code.
- The visual reference is `design_handoff_storysignal_redesign/StorySignal.dc.html`. It is a
  **prototype in an in-house HTML format — DO NOT ship it or `support.js`.** Recreate it as
  React in this app's existing patterns.
- The production analysis spec is
  `design_handoff_storysignal_redesign/Voice-Intelligence-Analysis-Spec.md`.
- Auth is already working; the pattern is documented in
  `design_handoff_storysignal_redesign/Supabase-Auth-Fix.md`. **Do not break it.**

## How to work
1. **Go one screen at a time.** Build it, show the user, wait for approval before the next.
   Order: Reading view → Input card (+ readiness meter / 40-word gate) → Atlas → Plans →
   Login/Sign-up → (optional) Welcome.
2. **Match the spec exactly** — colors, fonts (Newsreader + Geist), spacing, radii, and copy
   are final. Use the hex values and measurements in the README verbatim.
3. **Use the app's existing conventions** — React function components, CSS Modules, the Supabase
   client in `lib/supabaseClient.ts`. Don't introduce new frameworks or UI libraries.
4. **Don't touch the analysis engine until the UI is approved.** Build the Reading view against
   static sample data first.
5. **Preserve Supabase auth and RLS.** Tier (free/premium) derives from
   `storysignal_users.is_paid`. Enforce the free 5-readings/day cap and the 40-word minimum
   **server-side** in `app/api/analyze`.
6. **Explain changes in plain language.** The user is not a developer — say what each change does
   and how to test it at `localhost:3000` before committing.
7. **Small, reviewable commits.** Don't refactor unrelated code. Don't delete the old files until
   their replacement is working and approved.

## Assets
Use the user's own brand assets in `design_handoff_storysignal_redesign/assets/` (six Voice-State
portraits + the lotus logo). Copy them into the app's `public/` folder as needed.

## Definition of done (per screen)
Pixel-faithful to the prototype, responsive (single column ≤820px), wired to real data where
applicable, runs cleanly at `localhost:3000`, and the user has confirmed it looks right.

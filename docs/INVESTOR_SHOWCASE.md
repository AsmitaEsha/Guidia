# Investor and hackathon showcase (`/showcase`)

A 16:9-friendly presentation mode built from the real product components. It needs no sign-in. Everything inside is clearly labelled **Guided demo** and uses pretend content.

## Running it

Start the app (`npm run dev`) and open `http://localhost:5173/showcase`. A full-screen browser window (F11) at 1440×900 or larger looks best. The language picker in the top bar switches all copy between English, বাংলা, हिन्दी and Tiếng Việt.

## Controls

| Control | Action |
|---|---|
| **Start demo** (first step) | Starts the elapsed-time timer and moves to step 2 |
| **Next** / **Previous**, or the numbered step pills | Navigate |
| ↻ Replay | Restarts the current step's interaction |
| Timer ▶ / ⏸ / reset | Presentation timer |
| ✕ | Exit to the landing page |
| Keyboard: → or Space | Next (Space only when a button isn't focused) |
| Keyboard: ← | Previous |
| Keyboard: R | Restart the current step |
| Keyboard: ? | Show shortcuts |
| Keyboard: Esc | Close the shortcuts panel |

## The 3–5 minute story

| # | Step | What to show (≈ time) |
|---|---|---|
| 01 | The problem | A confusing "Enter PIN" screen. Click **What happens next?** for "What should I press?", then **Bring in Guidia**. (30 s) |
| 02 | Meet Guidia | The home question and four actions; in the Ask demo, tap "How do I send a photo…". (30 s) |
| 03 | Understand | Screen demo: tap the numbered markers, then **Why does this matter?** and **What should I do?**, then **Listen**. (40 s) |
| 04 | Practise | Pick Rupa, choose the middle amount and a purpose, then **Review**. The checkpoint asks for a trusted person; tap **Ask someone I trust**, then **Continue**. (40 s) |
| 05 | Protect | **Check this message**: Stop — very risky. Tap **Why?** clue chips, then **What should I do?** (Pause → Verify → Safe response). (30 s) |
| 06 | Learn & remember | Pick a confidence answer and watch the ring change; step the skill from Guided to Remembered. (30 s) |
| 07 | Human support | Toggle permission chips (support without surveillance), then **I need help** and watch the handoff timeline. (30 s) |
| 08 | Why Guidia scales | The six-layer architecture, four languages and the twelve practice apps. (20 s) |
| 09 | Final frame | "Understand technology. Practise safely. Stay independent." (10 s) |

Every number shown comes from the codebase: the languages are counted from `config/languages.js` and the apps from `components/sims/registry.js`. No user metrics are invented.

## Showing the real product afterwards

Sign in with a demo account to show the live app. Create the demo accounts with `SEED_DEMO_ACCOUNTS=true npm --prefix backend run db:setup`; the README lists the logins. Good live moments:

- **Ask Guidia** in বাংলা.
- **Understand my screen** with a real screenshot.
- **Practice → bKash** with a guardian approval.
- **Safety → Scam practice**.
- **Learn → the Facebook, Nagad, Gmail and imo lessons**.

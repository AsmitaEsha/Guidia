# Guidia public demo (free, from this laptop)

Guidia runs on this laptop. Cloudflare gives it a free public HTTPS link that
anyone can open on their phone, and a QR code is made for that link.

- Cost: free. No accounts needed for the link.
- The laptop must stay **on, awake and online** for the whole demo.
- The link is **new every time** the tunnel starts, so make the QR code on the day.
- Everything is real: real accounts, the real database (`backend/prisma/guidia.db`),
  real AI (Gemini), real voices. Nothing is mocked.

## Which laptop?

Any teammate's laptop works (Windows, macOS or Linux). It needs internet, and
this once (about 5 minutes):

1. **Node.js 20 or newer:** https://nodejs.org (the "LTS" button). Check with `node -v`.
2. **Get the code:** `git clone <your repo URL>`, then open a terminal in that folder.
3. **Install and set up everything:**
   ```
   npm run demo:setup
   ```
   This installs the packages, creates `backend/.env` with fresh random sign-in
   secrets, creates the database and fills it with all lessons and practice apps.
   It is safe to run again; it never deletes accounts.
4. **Add an AI key (free):** open `backend/.env` and paste a key after
   `GEMINI_API_KEY=` (https://aistudio.google.com/apikey) and/or after
   `GROQ_API_KEYS=` (https://console.groq.com/keys). Each teammate can use their
   own free key. Keys are never in git; never paste them in chat or on slides.
5. **Install cloudflared** (Cloudflare's free tunnel program):
   - Windows: `winget install --id Cloudflare.cloudflared`, then open a **new** terminal.
     Or download `cloudflared-windows-amd64.exe` from
     https://github.com/cloudflare/cloudflared/releases/latest and save it as
     `C:\Users\<you>\tools\cloudflared.exe`.
   - macOS: `brew install cloudflared`
   - Check with `cloudflared --version`.

On Esha's laptop all of this is already done (cloudflared is in `C:\Users\ESHA\tools`).

A new laptop starts with an **empty database**: accounts made on another laptop
don't move with the code. Create your demo accounts on the laptop you present from.

## On the day — 4 steps (about 3 minutes)

### 1. Before you start: make the AI reliable (strongly recommended, 2 minutes)

Only one free Gemini key is set up. Many judges asking questions or sharing
screenshots can use up its daily limit, and then those features show a polite
"not available right now" message. Add a free Groq key as a backup:

1. Open https://console.groq.com/keys, sign in with Google, click **Create API Key**, copy it.
2. Open `backend/.env`, find the line `GROQ_API_KEYS=` and paste the key after `=`.
3. Save the file. (An extra Gemini key from another Google account can go in `GEMINI_API_KEYS=` the same way.)

### 2. Build and start Guidia (terminal 1)

Open a terminal in the project folder (`E:\Guidia` on Esha's laptop) and run:

```
npm run demo:build
npm run demo:start
```

Wait for `Guidia demo is running at http://localhost:10000`. Leave this window open.
(`demo:build` is only needed again if the code changed.)

### 3. Open the public link (terminal 2)

Open a second terminal in the same folder and run:

```
npm run demo:tunnel
```

After 10–30 seconds it prints:

```
Public link:  https://something-random.trycloudflare.com
Checked:      the link opens Guidia and the server is ready
QR code:      E:\Guidia\demo-qr.png
```

Leave this window open too.

### 4. Check it, then use the QR code

1. Open the printed link on your **phone (mobile data, not Wi-Fi)** to be sure it works from outside.
2. Put `E:\Guidia\demo-qr.png` on your slide, or show it on screen.
3. Judges scan it, then they can create an account and try everything.

## Keep it running

- Plug the laptop in.
- Windows Settings → System → Power → set **Screen and sleep** to **Never** while plugged in.
- Do not close the two terminal windows. Closing either one stops the link.
- If the link stops working: run `npm run demo:tunnel` again. It gives a **new** link
  and a new `demo-qr.png`, so update the QR on your slide.

## What judges can do

Welcome setup (language, guidance, reading size, age) → sign up as a learner or a
family member → lessons → practice apps (WhatsApp, Facebook, Messenger, imo, bKash,
Nagad, MoMo, Google Pay, PayPal, Gmail, Amazon, Booking.com, Practo) → Ask Guidia →
Understand my screen (upload a screenshot) → scam checker → Memory Book → progress →
family code → "I need help" alert to family → read aloud in English, বাংলা, हिन्दी, Tiếng Việt.

Tip for the presentation: create a demo learner and a family account yourself
beforehand, so you can show the family alert live on two phones.

## Honest limits

- AI answers and screenshot explanations depend on the free AI quota (see step 1).
  If it runs out, Ask Guidia still answers from Guidia's own lessons, and the
  screen page says it is unavailable. It never pretends.
- Password-reset emails are not sent (no email service is set up). Ask judges to
  remember their password.
- Reading a screenshot takes about 20–30 seconds; the page shows "Looking carefully…".
- A quick tunnel is for demos, not a permanent home. When the demo ends, close both windows.

## After the demo

- Close both terminal windows (or press Ctrl+C in each).
- To keep a copy of the demo accounts and progress, copy `backend/prisma/guidia.db`
  somewhere safe.

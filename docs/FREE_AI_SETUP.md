# Running Guidia for free

Every part of Guidia can run at no cost. Free tiers and their limits change from time to time, so check the provider's page when you sign up.

| Part | Free option | What you need |
|---|---|---|
| AI answers + screenshot reading | **Google Gemini** (main) | A free API key |
| Backup AI when Gemini's daily limit runs out (or fully offline) | **Ollama** on your computer | No key, just an install |
| Voice | The browser's built-in speech | Nothing (Chrome or Edge recommended) |
| Email alerts (optional) | Brevo or Resend free plan, or Gmail | SMTP settings |
| Database | SQLite (a single file) | Nothing — it's created by `npm --prefix backend run db:setup` |
| Intent/safety models (optional) | Hugging Face models trained on Google Colab | A free Google account |

---

## 1. Google Gemini (free API key)

1. Go to **https://aistudio.google.com** and sign in with a Google account.
2. Accept the terms if asked.
3. Open **https://aistudio.google.com/apikey** (or click **Get API key** in the left menu), then **Create API key**. If you're asked to choose a Google Cloud project, let it create a new one.
4. Copy the key (it starts with `AIza…`) and keep it private.
5. In `backend/.env`, set:

   ```
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIza...your key...
   GEMINI_MODEL=gemini-flash-latest
   ```

   `gemini-flash-latest` always points at Google's newest Flash model, so it keeps working when older versions are retired (`gemini-2.5-flash`, for example, is no longer available to new accounts). It reads images and handles Bengali, Hindi and Vietnamese. The current list is at https://ai.google.dev/gemini-api/docs/models.

Notes:

- Google sometimes answers "This model is currently experiencing high demand" (error 503). Guidia then retries once with `GEMINI_FALLBACK_MODEL` (default `gemini-flash-lite-latest`, which is faster and less busy) before falling back to anything else.
- The free tier has per-minute and per-day request limits. When they run out, Guidia switches to Ollama automatically if you set it up (section 2).
- **Privacy:** Google's terms allow free-tier prompts to be used to improve its products. Guidia removes passwords, PINs, OTPs and card numbers before sending anything, but for real users' data consider a paid tier or Ollama.

## 2. Ollama (free, runs on your own computer, no key)

1. Download from **https://ollama.com/download** (Windows, macOS or Linux) and install. It runs in the background on `http://localhost:11434`.
2. Open a terminal and download one model that can read images:

   | Your computer | Model | Command | Size |
   |---|---|---|---|
   | 8 GB RAM | Gemma 3 4B | `ollama pull gemma3:4b` | ~3.3 GB |
   | 16 GB RAM or a GPU | Qwen 2.5 VL 7B | `ollama pull qwen2.5vl:7b` | ~6 GB |

3. Test it with `ollama run gemma3:4b "Say hello in Bengali"`.
4. In `backend/.env`:

   ```
   # as a backup behind Gemini:
   AI_FALLBACK_PROVIDER=ollama
   OLLAMA_MODEL=gemma3:4b

   # or as the only AI (fully private and offline):
   AI_PROVIDER=ollama
   AI_FALLBACK_PROVIDER=none
   ```

Notes:

- Local models are slower, and reading a screenshot on a laptop CPU can take 30–90 seconds. Guidia allows up to 2 minutes for Ollama.
- Answer quality, especially in Bengali, is lower than Gemini's.

## 3. Voice (free)

There's nothing to set up. With Gemini or Ollama, Guidia uses the browser's speech:

- **Reading aloud** works when a voice for the language is installed. English is always present. For Bengali, Hindi or Vietnamese on Windows: Settings → Time & language → Speech → Add voices, or install the language pack. Android and Chrome usually include them. If no voice exists, Guidia shows the text and says so; it never switches to an English voice.
- **Speaking to Guidia** uses the browser's speech recognition (Chrome or Edge) and asks for microphone permission.

## 4. Email alerts (optional, free)

Without email, alerts still appear inside Guidia. To also send emails, pick one option.

**Brevo (300 emails/day free)**
1. Sign up at https://www.brevo.com and verify your sender email.
2. Go to Settings → **SMTP & API** → SMTP tab and copy the login and SMTP key.
3. Set:

   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=<your SMTP login>
   SMTP_PASSWORD=<your SMTP key>
   SMTP_FROM="Guidia <the email you verified>"
   ```

**Gmail (for testing)**
1. Turn on 2-Step Verification: Google Account → Security.
2. Create an App password at https://myaccount.google.com/apppasswords.
3. Set:

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=you@gmail.com
   SMTP_PASSWORD=<16-character app password>
   SMTP_FROM="Guidia <you@gmail.com>"
   ```

## 5. Hugging Face models (optional, free)

1. Create a free account at https://huggingface.co.
2. You only need a token to upload or download *private* models: Settings → **Access Tokens** → New token. Choose **Read** to download, or **Write** to upload. Put it in `HF_API_TOKEN`.
3. Train for free on **Google Colab** (https://colab.research.google.com): Runtime → Change runtime type → T4 GPU, then follow [ML.md](ML.md).
4. Leave `ML_SERVICE_URL` empty until you've trained a model. Guidia uses its built-in rules meanwhile.

## 6. Your complete free `backend/.env`

```
PORT=8000
NODE_ENV=development
APP_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

DATABASE_URL="file:./guidia.db"

JWT_ACCESS_SECRET=<run: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
JWT_REFRESH_SECRET=<run it again for a different value>
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d

AI_PROVIDER=gemini
AI_FALLBACK_PROVIDER=ollama
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-flash-latest
GEMINI_FALLBACK_MODEL=gemini-flash-lite-latest
OLLAMA_MODEL=gemma3:4b

# optional
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="Guidia <no-reply@example.com>"
ML_SERVICE_URL=
HF_API_TOKEN=
```

## 7. Check that it works

1. Start the API (`npm run dev`), then open http://localhost:8000/api/v1/config. `capabilities.assistant` and `capabilities.vision` should be `true`, and `voice` stays `false` because the browser voice is used.
2. Open http://localhost:8000/api/v1/health/ready. `ai` should be `configured`.
3. In Guidia, ask "How do I send a photo on WhatsApp?" in Ask Guidia, then upload any screenshot in *Understand my screen*.
4. To see which provider answered, look at the `ai_request_logs` table: `provider` is `gemini` or `ollama`, and `degraded=true` means the fallback was used.

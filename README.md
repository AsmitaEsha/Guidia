# Guidia

**A calm digital companion that helps older adults understand, practise, and safely use everyday digital services, with trusted people beside them.**

Guidia is a social and digital literacy platform. It covers how to use apps, how to communicate with others online, how to judge what is safe or true, and how AI and privacy affect you. You can talk to it in English, বাংলা, हिन्दी or Tiếng Việt, by text or by voice. You can also show it your screen.

```
LISTEN → UNDERSTAND → SEE → KNOW → THINK → CHECK → GUIDE → PAUSE → VERIFY → HELP → REMEMBER → PRACTISE
```

## What a senior can do

| | |
|---|---|
| **Learn** | Short lessons in five areas: everyday tasks, talking with people, staying safe, "is it true?", and AI & privacy. Every step can be read aloud. |
| **Ask Guidia** | Type or say a question. Guidia shows what it heard before sending it. Answers come one step at a time, and say when they come from a reviewed Guidia lesson. |
| **Understand my screen** | Share a screenshot and ask "what do I press?" or "is this safe?". Guidia marks the right button and warns about anything risky. Screenshots are deleted after 30 minutes. |
| **Practise** | Twelve practice apps (WhatsApp, bKash, Nagad, MoMo, Google Pay, PayPal, Gmail, Facebook, Messenger, Amazon, Booking.com, Practo) that use pretend money and messages. Steps are guided, and progress survives a page refresh. |
| **Stay safe** | A scam checker that gives reasons, a scam-practice quiz (genuine messages included), and calm recovery steps for "I think I made a mistake". |
| **Ask for help** | "I need help" alerts trusted people right away. If nobody is connected yet, Guidia says so. |
| **Trusted people** | The senior chooses who helps and exactly what each person can see. Guardians can approve larger practice payments but never see passwords, PINs or OTPs. |
| **Remember** | The Memory Book and Progress pages track competence and confidence separately, show progress towards working independently, and schedule reviews. |

## Architecture

```
React + Vite (UI state only)
   │  /api/v1  {success,data}
Express API ── auth · rate limits · zod · request IDs · audit
   ├─ AI orchestrator → Gemini / Ollama / Grok · HF ML service · verified knowledge
   ├─ Safety Engine (deterministic, final authority) → action state machine → simulation executor
   ├─ Guardian permissions · emergencies · notification outbox + worker (SMTP)
   ├─ Tasks · lessons · practice · skills · Memory Book
   └─ Prisma → SQLite (one file: backend/prisma/guidia.db)
ml-service (FastAPI)  intent + safety classifiers (XLM-R)
extension (MV3)       explicit capture, pairing-code auth
```

There are a few rules the code holds to. AI proposes and code decides. No secret ever reaches the AI, the logs or a guardian. Practice never pretends to be a real transaction. When something is unavailable, the app shows that honestly instead of faking a result. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Quick start (local)

Requirements: Node 20+. Python 3.11+ is needed only for the optional ML models. There's no database server and no Docker; Guidia stores its data in a single SQLite file.

```bash
npm install && npm --prefix backend install
```

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`: set the two JWT secrets and a free AI provider. The free Gemini key and Ollama setup are covered step by step in [docs/FREE_AI_SETUP.md](docs/FREE_AI_SETUP.md).

Create the database file, the lessons and the demo accounts (in PowerShell, run `$env:SEED_DEMO_ACCOUNTS="true"` first, then `npm --prefix backend run db:setup`):

```bash
SEED_DEMO_ACCOUNTS=true npm --prefix backend run db:setup
```

```bash
npm run dev
```

Open http://localhost:5173. The demo accounts are created only by the seed command above:

| Role | Email | Password |
|---|---|---|
| Senior (Bengali) | demo@guidia.app | Demo1234 |
| Guardian of the demo senior | guardian@guidia.app | Guardian1234 |
| Admin | admin@guidia.app | Admin1234 |

Without an AI provider, everything except AI-generated answers and screen explanations still works. Ask Guidia falls back to reviewed lessons, and every page shows clearly what is unavailable.

## Tests

```bash
npm --prefix backend test
```

```bash
npm --prefix backend run test:integration
```

```bash
npm run lint && npm run build
```

```bash
npm run test:e2e
```

`test:e2e` runs browser smoke and accessibility checks with Playwright on your installed Microsoft Edge (no browser download); `npm run test:visual` compares screenshots at phone, tablet and desktop sizes. The integration suite uses a separate SQLite file (`guidia_test.db`) and refuses any database whose name doesn't contain `test`. See [docs/TESTING.md](docs/TESTING.md).

## Project layout

```
src/                 web app (pages/app, components, context, styles, i18n)
backend/src/         API (routes, services, ai, safety, security, notifications, jobs)
backend/prisma/      schema, SQLite migrations, seed + lesson content
ml/                  datasets, training and evaluation scripts
ml-service/          FastAPI inference service
extension/           Chrome/Edge extension
e2e/                 Playwright smoke, accessibility and visual tests
docs/                architecture, security, deployment and more
```

## Documentation

[Free AI setup](docs/FREE_AI_SETUP.md) · [Architecture](docs/ARCHITECTURE.md) · [Database](docs/DATABASE.md) · [AI](docs/AI.md) · [Voice](docs/VOICE.md) · [ML](docs/ML.md) · [Security](docs/SECURITY.md) · [Guardian](docs/GUARDIAN.md) · [Extension](docs/EXTENSION.md) · [Data lifecycle](docs/DATA_LIFECYCLE.md) · [Deployment](docs/DEPLOYMENT.md) · [Testing](docs/TESTING.md) · [Rebuild audit](docs/REBUILD_AUDIT.md) · [UI design system](docs/UI_DESIGN_SYSTEM.md) · [UI rebuild audit](docs/UI_REBUILD_AUDIT.md) · [Investor showcase](docs/INVESTOR_SHOWCASE.md) · [Implementation plan](docs/IMPLEMENTATION_PLAN.md)

Guidia does not give medical, legal or investment advice, and it never moves real money.

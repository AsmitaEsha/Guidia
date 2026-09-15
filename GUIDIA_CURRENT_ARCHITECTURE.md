# Guidia — Current Architecture Audit

Date: 2026-09-15
Scope: Full repository at time of audit (`main` branch, commit `8e00875`).

This document records what the repository **actually contains today**, as distinct from what `README.md` describes as the product's intent. It is the baseline for `GUIDIA_IMPLEMENTATION_PLAN.md`.

---

## 1. High-Level Summary

The repository is a **single-page, frontend-only visual prototype**. There is no working backend application, no database, no real authentication, and no real AI integration wired end-to-end. All application data (users, notifications, transactions, progress, guardian alerts, memory entries) lives in one hardcoded JS file and is held in React state that resets on reload. A `backend/` folder exists but only proxies text-to-speech audio — it has no relationship to the rest of the app's data or logic.

This is consistent with the README's own "Current Status" section, which describes the project as an early-stage prototype evolving toward a full-stack product — but the prototype is **less complete** than a casual reading of the polished mockup screenshots would suggest.

## 2. Stack Inventory

| Layer | Technology | Status |
|---|---|---|
| Frontend framework | React 19 + Vite 8 | Present, working |
| Routing | `react-router-dom` v7 is a listed dependency | **Not verified from current repository — not actually used.** `App.jsx` renders pages via a hand-rolled `activeTab` string in React state, not `<Routes>`/`<Route>`. There is no URL-based navigation; refreshing the page always returns to the splash screen. |
| Styling | Plain CSS (`src/index.css`) + inline `style={}` objects throughout components | Present; no Bootstrap actually in use despite README mentioning "Bootstrap-compatible" design |
| Icons | `lucide-react` | Present, partially used; raw emoji characters (👴👵👨🇧🇩⚠️ etc.) are used throughout components alongside/instead of icons |
| State management | One React Context (`AppStateContext.jsx`) holding all app state via `useState` | Present, functional, but entirely in-memory (no persistence layer) |
| Backend | FastAPI app (`backend/main.py`), 2 endpoints: `/api/health`, `/api/tts` | Present but minimal; `/api/tts` proxies Google Translate's undocumented TTS endpoint. No auth, no data endpoints, no database access. Not started by any npm script — must be run manually. |
| Database | None | **Not present.** No ORM, no migrations, no schema, no `.db`/`.sqlite` file, no connection string anywhere in the repo. |
| Authentication | None (simulated) | Phone/OTP UI exists (`Auth.jsx`) but OTP is hardcoded to `"123456"` client-side; "login" just sets a role from a static `USERS` object. No password, no session, no token, no server round-trip. |
| AI integration | `@google/genai` SDK is a dependency; `src/services/geminiVoice.js` calls the Gemini TTS REST API directly from the browser | Present but **not wired into any UI flow** (no import of `geminiVoice.js` found in components other than itself) and **security-critical**: the file is designed to accept a `VITE_`-prefixed API key, which Vite inlines into the client bundle — this would expose the Gemini key publicly if ever configured. No text-generation/chat model call, no vision/screenshot-analysis model call exists anywhere in the repo. |
| Voice/TTS | Google Translate TTS via Vite dev-server proxy (`/api/tts`) in `AppStateContext.jsx`'s `speak()` function | Functional in dev only (the proxy is defined in `vite.config.js`, which does not apply to a production build) |
| Env config | None | **Not present.** No `.env.example`, no `.env` reference in `vite.config.js`, no `import.meta.env` usage found anywhere in `src/`. |
| Linting | ESLint 10 flat config, React Hooks + Refresh plugins | Present, standard Vite template config, not Guidia-specific |
| Testing | None | **Not present.** No test runner, no test files, no CI config. |
| Build/deploy | `vite build` → `dist/` | `dist/` is already gitignored; a stale build output directory exists locally but is not tracked by git |

## 3. Application Structure

```
src/
  App.jsx                 — root layout + hand-rolled page switch (no router)
  main.jsx                — ReactDOM root
  index.css                — global styles/design tokens (CSS variables)
  context/AppStateContext.jsx — single global state store, all hardcoded data
  data/
    hardcoded.js            — USERS, NOTIFICATIONS, FAKE_TRANSACTIONS, GUARDIAN_ALERTS, MEMORY_ENTRIES
    buttonGuides.jsx, buttonReplicas.jsx, uiGuides.js — static content for the screenshot/UI explainer feature
  services/geminiVoice.js — unused, insecure client-side Gemini TTS call
  components/
    SplashScreen, Onboarding, Auth, Home, Learn, Practice, Assistant, Safety,
    ScreenshotAnalyzer, UIExplainer, MemoryBook, ProgressDashboard, Notifications,
    GuardianDashboard, Guardian, GuidedTaskTracker, EmergencyHelp, SettingsPage,
    Navigation (Sidebar/TopBar/BottomNav), AppLogo
    sims/ — 11 simulated app replicas (WhatsApp, Messenger, Gmail, Facebook, bKash,
             Nagad, GPay, PayPal, Amazon, Booking, Practo)
backend/
  main.py                 — FastAPI, health check + TTS proxy only
  requirements.txt
```

No `pages/`, `layouts/`, `hooks/`, `constants/`, `middleware/`, `models/`, `repositories/` directories exist. No `docs/` directory exists yet.

## 4. Feature-by-Feature Status

| Feature | Current Status | Current Location | Problems | Required Action |
|---|---|---|---|---|
| Entry / Splash | Implemented (visual only) | `SplashScreen.jsx` | Auto-advances on a timer; not a real trust-building entry per README | Rebuild as calm, professional landing with real CTAs |
| Onboarding / emotional calibration | Simulated | `Onboarding.jsx` | Sets `mode` (calm/unsure/scared) in memory only; not persisted; doesn't gate anything beyond CSS variables | Persist per-user; wire into a real Cognitive Load Governor service |
| Cognitive Load Governor | Partially implemented | `App.jsx` `MODE_STYLES`, CSS vars | Only affects font-size/animation-speed CSS variables; does not change information density, copy verbosity, confirmation frequency, or voice speed as README requires; no auto-downgrade on repeated errors/inactivity | Build a real governor: content-density rules per component, voice-speed integration, error/inactivity detection |
| Authentication | Simulated (fake) | `Auth.jsx`, `AppStateContext.login` | Hardcoded OTP, no password, no backend call, no session, no protected routes (there are no routes at all) | Full rebuild: real registration/login, password hashing, session, protected routing |
| Routing / protected routes | Not implemented | `App.jsx` (`activeTab` state) | `react-router-dom` installed but unused; no URL routes; no route guards; refresh loses all state | Introduce real `react-router-dom` routing per README's route list |
| Learning (lessons/courses) | Simulated | `Learn.jsx`, `data/hardcoded.js`/related | Static hardcoded lesson list and progress; no persistence of completion | Real Course/Lesson data model + API + persistence |
| Safe Practice (sim apps) | Implemented (UI only) | `Practice.jsx`, `components/sims/*` | 11 well-built simulated app UIs — this is a genuine strength; but no scenario engine, no scoring/attempt tracking, no backend | Keep sim UIs; add scenario/attempt data model and Cognitive-Load-aware guidance |
| AI Assistant | Simulated | `Assistant.jsx` | Not verified from current repository whether it calls any real model — no LLM call found in the file; responses appear to be canned/local logic | Build real AI Gateway + assistant service; ground in Guidia content |
| Screenshot Understanding | Simulated | `ScreenshotAnalyzer.jsx`, `UIExplainer.jsx`, `data/buttonGuides.jsx`, `data/buttonReplicas.jsx` | Uses static pre-authored annotation data keyed by matching UI, not real vision-model inference; no upload validation/pipeline | Build real upload → validate → (V)LM call → structured annotation pipeline behind AI Gateway |
| Voice guidance | Partially implemented | `AppStateContext.speak()` (Google Translate TTS via dev proxy), `geminiVoice.js` (unused) | Works only in `npm run dev` (proxy not present in production build/backend); no pause/resume/replay/speed controls surfaced in UI; Gemini path unused and insecure if activated | Move TTS proxy to real backend; add full playback controls; remove/secure the client-side Gemini key path |
| Scam Detection | Simulated | `Safety.jsx` | Not verified from current repository whether any rule engine exists — appears to use static/hardcoded example results | Build hybrid rule-engine + AI-interpretation service |
| Psychological Safety Net | Partially implemented | `sims/BkashSim.jsx`, `NagadSim.jsx`, etc. (per-sim confirmation dialogs) | Confirmation UI exists inside individual sims but is not a shared, reusable interception component as README requires | Extract into one reusable `GuidiaSafetyPanel`/interception component used by all sensitive actions |
| Guardian | Simulated | `Guardian.jsx`, `GuardianDashboard.jsx`, hardcoded `GUARDIAN_ALERTS` | No real invitation/consent/relationship model; alerts are static seed data mutated in memory | Real Guardian relationship + approval data model and workflow |
| Memory Book | Simulated | `MemoryBook.jsx`, hardcoded `MEMORY_ENTRIES` | Static seed entries; `addMemory()` exists in context but nothing in the app currently calls it | Real persistence; wire lesson/practice/screenshot completions into it |
| Progress / Confidence & Competence | Simulated | `ProgressDashboard.jsx`, `progress` state in context | Single flat `{messaging, banking, ...}` percentage object; no distinction between confidence and competence as README requires | Model confidence and competence as separate profiles fed by real activity |
| Notifications | Simulated | `Notifications.jsx`, hardcoded `NOTIFICATIONS` | Static seed list; read/unread toggling works in memory only | Real notification model, generated by actual events, persisted |
| Admin area | Not implemented | — | **Not verified from current repository** — no admin routes, components, or role exist at all | Build from scratch: routes, role, all admin screens |
| Accessibility | Partially implemented | `SettingsPage.jsx` (font size, dark mode toggle state exist), CSS vars | `darkMode`, `fontSize`, `reducedMotion`, `voiceEnabled` all exist in context state, but not verified whether they are consistently applied across every component/page; no visible focus-state audit; no keyboard-nav audit done | Full accessibility pass once design system exists |
| Responsive design | Partially implemented | inline styles + `index.css` | Layout uses `Sidebar`/`BottomNav` split suggesting some responsive intent; not verified against actual breakpoints without a running/browser check | Verify and formalize breakpoints in the new design system |
| Security controls | Not implemented | — | No password hashing (no passwords exist), no secret management, no input validation, no rate limiting, no auth on the one real backend that exists (`/api/tts` is open, unauthenticated, and proxies an undocumented third-party endpoint) | Full security architecture per Phase 17 |
| Emojis / decorative icons | Present, extensive | `Auth.jsx`, and broadly across components (not individually audited file-by-file here) | Directly contradicts README's own "Design Philosophy" section ("should NOT feel... emoji-driven") | Remove during UI rebuild; replace with `lucide-react` icons used purposefully |

## 5. Duplicate Code / Dead Code / Technical Debt

- `react-router-dom` is installed and imported nowhere — dead dependency until routing is built.
- `src/services/geminiVoice.js` is fully unused dead code today, and is also the repository's single largest security risk if ever wired up without a backend proxy (it puts a `VITE_GEMINI_API_KEY` into the client bundle).
- `backend/` is effectively disconnected from the rest of the product (only TTS), while the README's architecture section implies backend should own auth, data, and AI orchestration. This is the biggest structural gap between current implementation and product intent.
- Two independent app names appear in the codebase: "Guidia" (README, product intent) and "Guideia" (FastAPI app title, `Auth.jsx`/`App.jsx` UI text, logo alt text, comments in `geminiVoice.js`). This needs to be resolved to a single consistent name during the rebuild.
- `data/buttonGuides.jsx` and `data/buttonReplicas.jsx` overlap in purpose (both describe UI element annotations for the screenshot/explainer feature) and should be reconciled into one content model rather than two parallel hardcoded structures.

## 6. What Is Genuinely Reusable

Despite the gaps above, several things are worth preserving rather than discarding:

- The **11 simulated-app UIs** in `components/sims/` are a real asset — they are detailed, purpose-built replicas (not generic placeholders) and match the "Safe Practice" product requirement closely. They need a shared scenario/attempt engine wrapped around them, not a rewrite from scratch.
- The **three-state cognitive load concept** (`calm`/`unsure`/`scared`) is already modeled as a first-class piece of state and threaded through `App.jsx` — the foundation is right, it just needs to control more than CSS variables.
- The **bilingual (`t()` translation helper) and TTS integration pattern** in `AppStateContext.jsx` is a reasonable starting shape for a voice/i18n service, once moved server-side and given real playback controls.
- The overall **module list matches the README's intended feature set 1:1** (Home, Learn, Practice, Assistant, Safety, Memory, Progress, Notifications, Guardian, Settings) — the naming and screen inventory don't need to be reinvented, only the data layer and design underneath them.

## 7. Conclusion

The repository is best described as a **complete UI skeleton with zero production data/auth/backend architecture behind it**, plus one unrelated FastAPI microservice. Nothing in this audit should be read as blocking implementation — see `GUIDIA_IMPLEMENTATION_PLAN.md` for the phased path from this state to the product described in the README.

# AI

## Providers

| `AI_PROVIDER` | Cost | Text + vision | Server voice | Setup |
|---|---|---|---|---|
| `gemini` (default) | Free tier with limits | Yes | No (browser voice) | [FREE_AI_SETUP.md](FREE_AI_SETUP.md) |
| `ollama` | Free, runs locally | Yes, with a vision model such as `gemma3:4b` or `qwen2.5vl:7b` | No (browser voice) | [FREE_AI_SETUP.md](FREE_AI_SETUP.md) |
| `xai` (Grok) | Paid | Yes | Yes (`XAI_TTS_MODEL`/`XAI_STT_MODEL`) | console.x.ai |
| `mock` | — | Deterministic test output | Test audio | Tests only |

`AI_FALLBACK_PROVIDER` is tried automatically when the main provider fails or hits its limit, for example Gemini → Ollama. Calls answered by the fallback are logged with `degraded=true`.

Gemini and Ollama share `providers/openaiCompatibleProvider.js`, which uses their OpenAI-compatible chat-completions endpoints. It asks for schema-constrained JSON first and, if the endpoint rejects that, retries in JSON mode with the schema written into the prompt. zod validates the result either way. xAI uses `providers/xaiProvider.js` (Responses API, `store: false`).

Only the provider files import an AI SDK. Everything else goes through `ai/gateway.js`:

| Function | Use |
|---|---|
| `generateText` | Free text (not used for user-facing answers) |
| `generateStructured` | JSON-schema-constrained output, re-validated with zod |
| `analyzeImage` | Vision with a structured schema |
| `synthesizeSpeech` / `transcribe` | Server voice, only with providers that support it ([VOICE.md](VOICE.md)) |

The gateway converts provider failures into user-safe errors (`AI_NOT_CONFIGURED`, `AI_UPSTREAM_ERROR`, `AI_BAD_OUTPUT`). It records one `AIRequestLog` row per call with provider, feature, model, latency, tokens and status, and never stores prompts or replies.

## Orchestrator (`ai/orchestrator.js`)

1. Normalise the input and **redact secrets**. The raw text goes no further.
2. Run a heuristic prompt-injection check (for telemetry). The real defence is step 6.
3. **Intent**: the HF classifier through the ML service, with confidence bands from `INTENT_HIGH_CONFIDENCE_THRESHOLD` and `INTENT_LOW_CONFIDENCE_THRESHOLD`. A low-confidence result becomes `UNKNOWN`. If the service is down, multilingual rules are used and marked `degraded`.
4. **Task context**: a short summary of the active `GuidedTaskSession` (app, scenario step).
5. **Deterministic safety** on the message. If the user pasted a scam, Grok is told the concrete warning signs.
6. **Prompt assembly**: security rules come first, and every piece of untrusted content (user text, earlier user turns, screenshot text) is fenced as data.
7. **Knowledge**: up to four chunks from `PUBLISHED` `KnowledgeDocument`s in the user's language (falling back to English).
8. **Grok**: structured `assistant_reply` with `reply`, `steps`, `intent`, `grounding`, `needsClarification`, `safetyNote` and an optional `actionProposal`.
9. **Safety Engine**: any `actionProposal` is evaluated deterministically and returned only as a preview. Nothing is executed from chat.
10. **Persist**: redacted user and assistant messages, plus provenance (knowledge document and chunk ids and versions).

If Grok is unavailable or switched off and a lesson matches, Guidia returns that whole reviewed lesson, marked `VERIFIED_GUIDIA` and `degraded`.

## Grounding policy

`grounding` is one of `VERIFIED_GUIDIA`, `SIMULATION`, `USER_PROVIDED`, `MODEL_INTERPRETATION` or `UNKNOWN`. The prompt tells Grok to:

- prefer reviewed Guidia knowledge whenever it applies;
- describe what to look for rather than invent exact button names when relying on general knowledge;
- say it is unsure (`UNKNOWN`) instead of guessing, especially about money or security, and never invent phone numbers or procedures.

When the topic is sensitive and the answer isn't grounded in a lesson, the server adds a safety note automatically. The UI shows a "From a Guidia lesson" or "Guidia is not sure" badge.

## Scope guard

Guidia covers apps, communication, safety, privacy, information literacy and AI literacy. It declines medical diagnosis, legal advice, investment advice, politics and dangerous instructions, and points to the right kind of help. For healthcare apps it explains only booking and app use.

## Vision (See & Guide)

`services/visionService.js` handles screenshots in this order:

1. sharp decodes the image. Only the real format (png, jpeg, webp) counts, never the MIME label. There is a 40-megapixel limit, EXIF data is stripped and orientation applied, the image is resized to at most 2000 px and re-encoded.
2. The image is stored ephemerally and linked to its owner and active task. It expires after 30 minutes.
3. Grok returns a structured `screen_analysis`: `screenType`, `detectedApp`, `userGoal`, `risk`, `summary`, `nextAction`, `requiresConfirmation`, `warning`, and up to 8 `elements`, each with `label`, `type`, `description`, `x`, `y` and `confidence`.
4. Coordinates are kept only when both x and y were given. Grok is told to return `null` rather than guess. The UI draws markers only for real coordinates.
5. All text fields are redacted again before they are stored.

Follow-up questions (`POST /vision/:id/ask`) re-send the same stored image together with the earlier explanation. Text inside screenshots is treated as untrusted data.

## Scam checks

`safetyService.analyze` runs `safety/fusion.js`, which combines three signals in a fixed order:

1. **Deterministic rules** set the floor and are never lowered. A request for an OTP counts only when something actually asks for it, so "Never share your OTP" is SAFE.
2. **The HF safety classifier** may raise the verdict when its confidence is at least 0.7.
3. **Grok** explains, and may raise the verdict but never lower it.

If no second opinion is available and the message tries to make the reader act (a link, a number, "pay", "click"), the verdict is `UNKNOWN` rather than a silent SAFE. The decision trace (policy, rules and model versions) is stored on `RiskAssessment`.

## Verifying a live setup

The xAI provider is covered by the gateway contract and the mock-provider tests, but it hasn't been exercised against the live xAI API in this repository: no key was available. After adding `XAI_API_KEY`:

```bash
curl -s localhost:8000/api/v1/config
```

Check that `capabilities.assistant` is `true`. Then ask something in Ask Guidia and confirm that a `feature=assistant status=ok` row appears in `ai_request_logs`. If the provider rejects `text.format` (structured output) or the model name, adjust `XAI_MODEL`, or the request shape in `xaiProvider.js` only.

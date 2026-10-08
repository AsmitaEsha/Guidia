# Voice

## Languages

`en`, `bn`, `hi` and `vi` are defined once, in `src/config/languages.js` and `backend/src/config/languages.js`. These files hold the locale, BCP-47 speech tag and the hints used to pick a browser voice.

## Speaking (text to speech)

The order of preference lives in `src/context/VoiceContext.jsx`:

1. **Guidia server voice.** When `GET /config` reports `capabilities.voice`, the client splits text at sentence boundaries (smaller chunks in gentler comfort modes) and plays one `POST /api/v1/voice/speak` request per chunk. The endpoint requires sign-in, is rate-limited per user, redacts secrets before speaking and calls the xAI speech API through the gateway.
2. **A browser voice that really speaks this language.** If none is installed for Bengali, Hindi or Vietnamese, Guidia does **not** fall back to an English voice.
3. **Text only.** The UI shows a calm message asking the user to read the text.

Controls are pause, resume, stop, replay and speed (slow, normal, faster), and speed is saved to the account. Changing page or language stops speech.

## Listening (speech to text)

1. Guidia records with `MediaRecorder` and sends the audio to `POST /api/v1/voice/transcribe` (sign-in required, 10 MB limit). The server returns a **redacted** transcript.
2. If server voice is unavailable, the browser's `SpeechRecognition` is used with the user's language tag.
3. The transcript is placed in the text box for the user to read and correct. **Guidia never acts on speech without that review.**

Pressing the microphone first stops any speech, so the user can interrupt (barge-in).

## Safety rules for voice

- A voice transcript can never confirm a HIGH or CRITICAL action. Confirmation always needs the on-screen controls, which show the amount and recipient (`safety/confirmationPolicy.voiceConfirmationAllowed`).
- Spoken output never reads out secrets.

## Configuration

```
XAI_TTS_MODEL=    # xAI text-to-speech model name for your account
XAI_STT_MODEL=    # xAI speech-to-text model name for your account
XAI_TTS_VOICE=    # optional voice id
DISABLE_VOICE=false
FEATURE_REALTIME_VOICE=false
```

The REST speech endpoints use the OpenAI-compatible `audio.speech` and `audio.transcriptions` shapes. Check the model names and endpoint support against your xAI account; if they differ, change only `xaiProvider.speech`/`transcribe`. Until they're verified, the browser-voice and text fallbacks keep Guidia fully usable.

## Realtime speech-to-speech (not yet built)

Realtime is behind `FEATURE_REALTIME_VOICE` and is not implemented yet. The intended design keeps the permanent xAI key on the server: the API mints a short-lived session token, the browser connects with that token, and the session has explicit start, stop and timeout handling. The REST path has to be solid first.

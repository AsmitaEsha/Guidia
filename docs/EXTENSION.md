# Browser extension

Manifest V3, for Chrome and Edge, in `extension/`. Its job is to let a signed-in user ask "what is this page?" about an ordinary website.

## Security model

| Concern | Design |
|---|---|
| What runs on websites | Nothing. There is no content script (V1 injected one into every site). The extension acts only from its toolbar popup, through Chrome's `activeTab`. |
| When a screenshot is taken | Only after the user presses *Capture & explain* in the popup |
| Sensitive pages | Refused: `chrome:`, `edge:`, `about:`, `file:`, extension stores, password managers, and banking or payment domains (including any host containing "bank") |
| Identity | A pairing code generated in Guidia → Settings (8 characters, no look-alike letters, single use, 10 minutes, stored hashed) is exchanged for a token `gx_…`. The token has scope `SCREENSHOT_CAPTURE` only, lasts 30 days, is stored hashed server-side, and is kept in `chrome.storage.session` (cleared when the browser closes). |
| What the token can do | Upload to `POST /vision/sessions` and nothing else. Any other route rejects it as "not a session". |
| What is sent | The PNG of the visible tab, the user's language and the page **origin** only (full URLs can hold tokens or personal data) |
| Viewing the result | The extension opens `/app/screen/:id` in Guidia. The normal signed-in session reads it, and only the owner can. |
| CORS | Production allows only the extension IDs listed in `ALLOWED_EXTENSION_IDS`. V1 allowed any `chrome-extension://` origin. |
| Consent | Pairing records an `EXTENSION_CONNECTION` consent. Settings shows connected extensions and can revoke them. |

## Environments

- **Development:** `extension/config.js` points at `http://localhost:5173`, and the Vite proxy forwards `/api` to the API. Load the folder unpacked.
- **Production:**

  ```bash
  node extension/build.mjs --app https://app.example.org --api https://api.example.org/api/v1
  ```

  This writes `extension/dist/` with the production URLs, and host permissions for the API origin only. HTTPS is enforced and no localhost permissions are shipped.

After publishing, add the extension ID to `ALLOWED_EXTENSION_IDS`.

## Possible next steps

- DOM grounding: send visible button labels and roles (never input values) so suggested targets can be checked against the page instead of estimated from pixels.
- Attach captures to the active GuidedTaskSession on the server. This already happens: the vision service links each analysis to the user's open task.

## Popup states

The popup follows Guidia's design and speaks the connected account's language (English, বাংলা, हिन्दी, Tiếng Việt):

| State | What the user sees |
|---|---|
| Not connected | Three numbered steps, a code box that groups the code as `ABCD EFGH`, **Connect**, and a link to Guidia's *Browser helper* settings |
| Pairing | "Connecting…" with a spinner |
| Connected / capture ready | A green "Connected" pill, a privacy note ("captures the visible page only when you press the button; banking and password pages are never captured"), an optional question, **Capture & explain**, **Open Guidia** and **Disconnect** |
| Capture in progress | "Capturing page…" |
| Result opened | "Opening Guidia…", then the explanation opens in a new tab at `/app/screen/:id` |
| Error | The server's plain-language message (wrong code, blocked page, signed out) in a red status line |

# Guidia browser extension (Chrome / Edge, Manifest V3)

Lets a signed-in Guidia user ask "what is this page?" about any ordinary
website. See `docs/EXTENSION.md` for the full security model.

## How it behaves

- **Nothing runs on websites.** There is no content script. The extension
  only acts when the user clicks its toolbar button and then presses
  *Explain this page* (Chrome's `activeTab` permission).
- **Pairing, not passwords.** In Guidia → Settings → *Connect the
  extension*, the user gets an 8-letter code (single use, 10 minutes). The
  extension exchanges it for a scoped token that can only upload
  screenshots. It is kept in `chrome.storage.session` (cleared when the
  browser closes) and never gives access to the account.
- **Sensitive pages are refused**: browser pages, extension stores,
  password managers and banking/payment sites.
- Only the site's origin is sent, never the full URL.

## Development

1. Run the API and web app (`npm run dev` at the repo root).
2. `chrome://extensions` → Developer mode → *Load unpacked* → this folder.
3. In development the extension talks to the Vite dev server
   (`http://localhost:5173`), which proxies `/api` to the backend.

## Production build

```bash
node extension/build.mjs --app https://app.example.org --api https://api.example.org/api/v1
```

Load or publish `extension/dist/`, then add the published extension ID to
`ALLOWED_EXTENSION_IDS` on the API.

# Guidia Anywhere Screenshot Assistant

This folder contains the Chrome/Edge extension for the Guidia Anywhere Screenshot Assistant.

## Local Development

1. Start Guidia:

   ```bash
   npm run dev
   ```

2. Open Chrome or Edge extensions:

   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`

3. Enable **Developer mode**.

4. Choose **Load unpacked**.

5. Select this folder:

   ```text
   E:\Guideai\Guidia\extension
   ```

6. Visit a normal website such as `https://example.com`.

7. Click the floating **Guidia Screenshot** button.

The extension captures only the visible viewport after the user clicks **Take Screenshot**. It uploads the image to the local Guidia backend, then opens:

```text
http://localhost:5173/screenshot-explain/{analysisId}
```

Screenshots are stored only temporarily in backend memory for the current development session.

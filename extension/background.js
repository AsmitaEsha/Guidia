const GUIDIA_APP_URL = 'http://localhost:5173';
const GUIDIA_API_URL = 'http://localhost:8000/api';

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime = /data:(.*?);base64/.exec(header)?.[1] || 'image/png';
  const bytes = atob(data);
  const array = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) {
    array[index] = bytes.charCodeAt(index);
  }
  return new Blob([array], { type: mime });
}

async function captureAndOpen(tab) {
  if (!tab?.windowId || !tab?.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
    throw new Error("Guidia can't capture this browser page. Try using Guidia on a normal website.");
  }

  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  const form = new FormData();
  form.append('screenshot', dataUrlToBlob(dataUrl), 'guidia-visible-screen.png');
  form.append('sourceUrl', tab.url);
  form.append('language', 'en');

  const response = await fetch(`${GUIDIA_API_URL}/screenshots/sessions`, {
    method: 'POST',
    body: form,
    credentials: 'include'
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Guidia could not analyze this screenshot.');
  }

  await chrome.tabs.create({ url: `${GUIDIA_APP_URL}/screenshot-explain/${payload.analysisId}` });
  return payload;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'GUIDIA_CAPTURE_VISIBLE_TAB') return false;

  captureAndOpen(sender.tab)
    .then((payload) => sendResponse({ ok: true, payload }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

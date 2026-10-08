import { GUIDIA_API_URL, GUIDIA_APP_URL } from './config.js';

// Pages Guidia never captures: browser internals, extension stores,
// password managers and common banking / payment domains. Users can still
// share those screens deliberately with a screenshot inside Guidia.
const BLOCKED_SCHEMES = ['chrome:', 'edge:', 'about:', 'chrome-extension:', 'edge-extension:', 'file:', 'view-source:'];
const SENSITIVE_HOST_PATTERNS = [
  /(^|\.)bkash\.com$/, /(^|\.)nagad\.com\.bd$/, /(^|\.)paypal\.com$/, /(^|\.)pay\.google\.com$/,
  /(^|\.)momo\.vn$/, /(^|\.)1password\.com$/, /(^|\.)lastpass\.com$/, /(^|\.)bitwarden\.com$/,
  /bank/i, /ibanking/i, /netbanking/i,
  /(^|\.)chromewebstore\.google\.com$/, /(^|\.)microsoftedge\.microsoft\.com$/,
];

function blockedReason(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return 'This page can’t be captured.'; }
  if (BLOCKED_SCHEMES.includes(parsed.protocol)) return 'Guidia can’t capture browser pages. Try a normal website.';
  if (SENSITIVE_HOST_PATTERNS.some((p) => p.test(parsed.hostname))) {
    return 'For your safety, Guidia doesn’t capture banking, payment or password pages. You can describe what you see in Guidia instead.';
  }
  return null;
}

async function getToken() {
  const { guidiaToken } = await chrome.storage.session.get('guidiaToken');
  return guidiaToken || null;
}

async function pair(code) {
  const res = await fetch(`${GUIDIA_API_URL}/extension/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, extensionId: chrome.runtime.id }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.success) throw new Error(body?.error?.message || 'That code didn’t work. Please make a new one in Guidia.');
  // Session storage: cleared when the browser closes, never synced.
  await chrome.storage.session.set({ guidiaToken: body.data.token, guidiaUser: body.data.user });
  return body.data.user;
}

async function capture({ question }) {
  const token = await getToken();
  if (!token) throw new Error('Please connect Guidia first.');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) throw new Error('No page to capture.');
  const reason = blockedReason(tab.url);
  if (reason) throw new Error(reason);

  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  const blob = await (await fetch(dataUrl)).blob();
  const { guidiaUser } = await chrome.storage.session.get('guidiaUser');
  const form = new FormData();
  form.append('screenshot', blob, 'page.png');
  form.append('language', guidiaUser?.language || 'en');
  // Only the site name is sent — full addresses can contain private data.
  form.append('sourceUrl', new URL(tab.url).origin);
  if (question) form.append('question', question.slice(0, 500));

  const res = await fetch(`${GUIDIA_API_URL}/vision/sessions`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) {
    await chrome.storage.session.remove(['guidiaToken', 'guidiaUser']);
    throw new Error('Please connect Guidia again.');
  }
  if (!res.ok || !body.success) throw new Error(body?.error?.message || 'Guidia could not explain this page right now.');
  await chrome.tabs.create({ url: `${GUIDIA_APP_URL}/app/screen/${body.data.analysisId}` });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handlers = {
    status: async () => ({ connected: Boolean(await getToken()), user: (await chrome.storage.session.get('guidiaUser')).guidiaUser || null }),
    pair: () => pair(String(message.code || '').trim().toUpperCase()),
    capture: () => capture({ question: message.question }),
    disconnect: () => chrome.storage.session.remove(['guidiaToken', 'guidiaUser']),
    openGuidia: () => chrome.tabs.create({ url: `${GUIDIA_APP_URL}/app/settings#set-browser` }),
    openApp: () => chrome.tabs.create({ url: `${GUIDIA_APP_URL}/app/home` }),
  };
  const run = handlers[message?.type];
  if (!run) return false;
  run().then((data) => sendResponse({ ok: true, data })).catch((err) => sendResponse({ ok: false, error: err.message }));
  return true;
});

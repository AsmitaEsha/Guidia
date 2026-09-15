const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Wraps the raw browser fetch() so a network-level failure (backend not
// running, no connection, blocked by the browser) never surfaces as the
// browser's own "Failed to fetch" — it becomes a clear, actionable message.
async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      "Can't reach the Guidia server right now. Please make sure it's running, then try again."
    );
  }
}

// Thin fetch wrapper. Sends cookies (for the httpOnly refresh token) and an
// Authorization header when an access token is supplied. Every AI/data
// feature should eventually go through this, never call an AI provider
// directly from the browser.
export async function apiFetch(path, { method = 'GET', body, accessToken, headers = {} } = {}) {
  const res = await safeFetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.code || 'ERROR', data?.error?.message || 'Something went wrong.');
  }

  return data;
}

// Like apiFetch, but for binary responses (e.g. TTS audio) — returns a Blob
// instead of parsing JSON.
export async function apiFetchBlob(path, { accessToken, headers = {} } = {}) {
  const res = await safeFetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data?.error?.code || 'ERROR', data?.error?.message || 'Voice playback failed.');
  }

  return res.blob();
}

// Like apiFetch, but sends a FormData body (file uploads) instead of JSON —
// the browser sets the multipart Content-Type header itself, so it must not
// be set manually here.
export async function apiFetchForm(path, { formData, accessToken } = {}) {
  const res = await safeFetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.code || 'ERROR', data?.error?.message || 'Upload failed.');
  }

  return data;
}

// Single HTTP client for the Guidia API.
// - Unwraps { success, data } responses; errors become ApiError with the
//   server's user-safe message and request id.
// - Holds the short-lived access token in memory only (never storage).
// - On an expired access token, refreshes once (single flight) and retries.
// - Never talks to an AI provider: every AI feature goes through the API.

const BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, code, message, requestId) {
    super(message);
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

let accessToken = null;
let refreshing = null;
let onSessionLost = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function onSessionExpired(callback) {
  onSessionLost = callback;
}

export function newIdempotencyKey() {
  return (crypto.randomUUID?.() || `${Date.now()}${Math.random()}`).replace(/[^A-Za-z0-9_-]/g, '');
}

const SERVER_DOWN = "Guidia's server isn't answering right now. Please try again in a moment.";

async function rawFetch(path, init) {
  try {
    return await fetch(`${BASE_URL}${path}`, { credentials: 'include', ...init });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', navigator.onLine === false
      ? "Guidia can't reach the internet right now. Please check your connection and try again."
      : SERVER_DOWN);
  }
}

/** True when the API answers its liveness check. */
export async function apiReachable() {
  try {
    const res = await fetch(`${BASE_URL}/health/live`, { credentials: 'include' });
    return res.ok;
  } catch {
    return false;
  }
}

async function parse(res) {
  if (res.status === 204) return null;
  const type = res.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    if (res.ok) return res.blob();
    // The dev proxy answers 502/503/504 when the API isn't running.
    if ([502, 503, 504].includes(res.status)) throw new ApiError(res.status, 'SERVER_UNAVAILABLE', SERVER_DOWN);
    throw new ApiError(res.status, 'ERROR', 'Something went wrong. Please try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const e = body.error || {};
    throw new ApiError(res.status, e.code || 'ERROR', e.message || 'Something went wrong. Please try again.', e.requestId);
  }
  return Object.hasOwn(body, 'data') ? body.data : body;
}

export async function refreshSession() {
  if (!refreshing) {
    refreshing = rawFetch('/auth/refresh', { method: 'POST' })
      .then(parse)
      .then((data) => {
        accessToken = data.accessToken;
        return data;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

/**
 * @param {string} path  e.g. '/memory'
 * @param {{ method?: string, body?: any, form?: FormData, headers?: object, idempotent?: boolean|string, retry?: boolean }} [opts]
 */
export async function api(path, { method = 'GET', body, form, headers = {}, idempotent, retry = true } = {}) {
  const init = {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(idempotent ? { 'Idempotency-Key': typeof idempotent === 'string' ? idempotent : newIdempotencyKey() } : {}),
      ...headers,
    },
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  };
  const res = await rawFetch(path, init);

  if (res.status === 401 && retry && accessToken !== null && !path.startsWith('/auth/')) {
    try {
      await refreshSession();
    } catch {
      accessToken = null;
      onSessionLost();
      throw new ApiError(401, 'SESSION_EXPIRED', 'Your session has ended. Please sign in again.');
    }
    // Same idempotency key on the retry, so it can't double-apply.
    return api(path, { method, body, form, headers: { ...headers, ...(init.headers['Idempotency-Key'] ? { 'Idempotency-Key': init.headers['Idempotency-Key'] } : {}) }, retry: false });
  }
  return parse(res);
}

export const get = (path) => api(path);
export const post = (path, body, opts) => api(path, { method: 'POST', body: body ?? {}, ...opts });
export const put = (path, body, opts) => api(path, { method: 'PUT', body, ...opts });
export const patch = (path, body, opts) => api(path, { method: 'PATCH', body, ...opts });
export const del = (path, body) => api(path, { method: 'DELETE', ...(body ? { body } : {}) });
export const upload = (path, form, opts) => api(path, { method: 'POST', form, ...opts });

function resolveApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
}

const API_BASE_URL = resolveApiBaseUrl();
const STORAGE_KEY = "biyahenyo.auth";

function getToken() {
  const raw = window.localStorage.getItem(STORAGE_KEY) || window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const auth = JSON.parse(raw);
    return auth ? auth.token : null;
  } catch (err) {
    console.error("Auth parse error:", err);
    return null;
  }
}

function buildUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

async function request(path, options = {}) {
  const token = options.auth === false ? null : getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(buildUrl(path, options.params), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || response.statusText || `Request failed (${response.status})`);
  }

  return data;
}

export function get(path, params) {
  return request(path, { params });
}

export function post(path, body, params, options = {}) {
  return request(path, { method: "POST", body, params, ...options });
}

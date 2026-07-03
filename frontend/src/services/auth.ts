const TOKEN_KEY = "token";
const GOOGLE_EMAIL_KEY = "google_email";
const GOOGLE_NAME_KEY = "google_name";
const GOOGLE_REMEMBER_KEY = "google_remember_me";

const storages = () => [localStorage, sessionStorage];

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string, rememberMe: boolean) {
  const primary = rememberMe ? localStorage : sessionStorage;
  const secondary = rememberMe ? sessionStorage : localStorage;

  secondary.removeItem(TOKEN_KEY);
  primary.setItem(TOKEN_KEY, token);
}

export function clearAuthSession() {
  storages().forEach((storage) => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(GOOGLE_EMAIL_KEY);
    storage.removeItem(GOOGLE_NAME_KEY);
    storage.removeItem(GOOGLE_REMEMBER_KEY);
  });
}

function decodeJwtPayload(token: string) {
  const payload = token.split(".")[1];
  if (!payload) return null;

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(window.atob(padded));
}

export function isTokenExpired(token: string) {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function getValidAuthToken() {
  const token = getAuthToken();
  if (!token) return null;

  if (isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }

  return token;
}

export function setPendingGoogleRegistration(email: string, fullName: string, rememberMe: boolean) {
  storages().forEach((storage) => {
    storage.removeItem(GOOGLE_EMAIL_KEY);
    storage.removeItem(GOOGLE_NAME_KEY);
    storage.removeItem(GOOGLE_REMEMBER_KEY);
  });

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(GOOGLE_EMAIL_KEY, email);
  storage.setItem(GOOGLE_NAME_KEY, fullName);
  storage.setItem(GOOGLE_REMEMBER_KEY, rememberMe ? "true" : "false");
}

export function getPendingGoogleRegistration() {
  const storage = localStorage.getItem(GOOGLE_EMAIL_KEY) ? localStorage : sessionStorage;

  return {
    email: storage.getItem(GOOGLE_EMAIL_KEY),
    fullName: storage.getItem(GOOGLE_NAME_KEY) || "",
    rememberMe: storage.getItem(GOOGLE_REMEMBER_KEY) === "true",
  };
}

export function clearPendingGoogleRegistration() {
  storages().forEach((storage) => {
    storage.removeItem(GOOGLE_EMAIL_KEY);
    storage.removeItem(GOOGLE_NAME_KEY);
    storage.removeItem(GOOGLE_REMEMBER_KEY);
  });
}

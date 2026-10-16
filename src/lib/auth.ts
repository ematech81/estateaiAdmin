// A different storage key from the public site's token, so being signed in
// as an agent on estateai.com.ng never leaks into (or collides with) the
// admin session — they're separate origins anyway, this just keeps local
// development on localhost clean too.
const TOKEN_KEY = 'estateai_admin_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Returns the logout redirect URL.
 *
 * In the browser we ALWAYS use `window.location.origin` — it is, by definition,
 * the exact host:port the user is currently on (the real dev port, and in
 * production the real public domain). Relying on NEXT_PUBLIC_APP_URL here broke
 * logout whenever the dev server fell back to a different port than the env var
 * (e.g. the app runs on :3002 but NEXT_PUBLIC_APP_URL still says :3001) — the
 * redirect went to a dead port and the page just spun.
 *
 * The env var is only used as a fallback on the server (no `window`).
 */
export function getLogoutUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/login`;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return appUrl ? `${appUrl}/login` : '/login';
}

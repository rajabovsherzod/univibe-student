/**
 * Session updater singleton.
 *
 * Problem: NextAuth's `getSession()` (GET /api/auth/session) does NOT trigger
 * the JWT callback. So calling it after an access token expires returns the
 * old expired token instead of triggering a refresh.
 *
 * `update()` from `useSession()` (POST /api/auth/session) DOES trigger the
 * JWT callback with trigger="update", which runs the proactive refresh logic.
 *
 * Since `update()` is only available inside React components, we store a
 * reference here so the axios interceptor (outside React) can call it directly
 * instead of using the unreliable event-dispatch + 2s-wait approach.
 */

type UpdateFn = (data?: Record<string, unknown>) => Promise<unknown>;

let _update: UpdateFn | null = null;

/** Called once from useActivityTracker when the update fn becomes available. */
export function registerSessionUpdate(fn: UpdateFn) {
  _update = fn;
}

/**
 * Forces a server-side JWT callback refresh by calling `update({ forceRefresh: true })`.
 * Returns the new access token, or null if refresh failed.
 */
export async function forceTokenRefresh(): Promise<string | null> {
  if (!_update) return null;
  try {
    const updatedSession = await _update({ forceRefresh: true });
    return (updatedSession as Record<string, unknown> | null)?.accessToken as string ?? null;
  } catch {
    return null;
  }
}

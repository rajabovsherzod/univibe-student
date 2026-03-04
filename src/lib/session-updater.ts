/**
 * Session updater singleton.
 *
 * Problem with the old approach (update({ forceRefresh: true })):
 *   NextAuth's `update()` requires a valid CSRF token round-trip. In production
 *   this can silently return null due to timing, CSRF failures, or network hiccups.
 *   When it returns null, the 401 interceptor immediately calls signOut() → logout.
 *
 * New approach — POST /api/auth/refresh:
 *   A dedicated server-side route that reads the refresh token directly from the
 *   JWT cookie, calls the backend, and updates the cookie — no CSRF needed.
 *   After the cookie is updated, we call update() with a no-op payload just to
 *   sync the React session state (useSession().data) without triggering another
 *   backend refresh.
 */

type UpdateFn = (data?: Record<string, unknown>) => Promise<unknown>;

let _update: UpdateFn | null = null;

/** Called once from useActivityTracker when the update fn becomes available. */
export function registerSessionUpdate(fn: UpdateFn) {
  _update = fn;
}

/**
 * Refreshes the access token reliably via the dedicated /api/auth/refresh route.
 *
 * Flow:
 *  1. POST /api/auth/refresh  → server reads refresh token, calls backend,
 *                               updates JWT cookie, returns new accessToken
 *  2. update({})              → fires a no-op session update so NextAuth
 *                               re-reads the updated cookie and syncs React
 *                               state (accessToken + accessTokenExpiry)
 *
 * Returns the new access token string, or null if refresh failed.
 */
export async function forceTokenRefresh(): Promise<string | null> {
  console.log("[session-updater] forceTokenRefresh() called");
  try {
    // ── Primary path: direct server-side refresh ─────────────────────────────
    const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" });

    console.log(`[session-updater] /api/auth/refresh returned status: ${res.status}`);

    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const newAccessToken = data?.accessToken as string | undefined;

      if (newAccessToken) {
        console.log("[session-updater] Successfully retrieved new access token from /api/auth/refresh");
        // Sync React state: POST to /api/auth/session with empty data.
        if (_update) {
          console.log("[session-updater] Calling _update({}) to sync session state");
          _update({}).catch(() => { });
        }
        return newAccessToken;
      } else {
        console.error("[session-updater] Response was OK, but no accessToken in JSON data:", data);
      }
    } else {
      const errorText = await res.text();
      console.error(`[session-updater] /api/auth/refresh failed with status: ${res.status}, body:`, errorText);
      // If the backend refuses the refresh token with a 401/403, do not fallback.
      // The token is permanently dead.
      if (res.status === 401 || res.status === 403) {
        console.warn("[session-updater] Server rejected refresh token. Triggering natural logout.");
        return null;
      }
    }

    // ── Fallback: trigger JWT callback via update({ forceRefresh: true }) ────
    console.warn("[session-updater] Falling back to _update({ forceRefresh: true }) method...");
    if (!_update) {
      console.error("[session-updater] _update function is NOT available! Cannot run fallback.");
      return null;
    }
    const updatedSession = await _update({ forceRefresh: true });

    const sess = updatedSession as Record<string, unknown> | null;

    // Check if the NextAuth JWT callback explicitly reported a refresh error:
    if (sess?.error === "RefreshAccessTokenError") {
      console.error("[session-updater] Fallback NextAuth update explicitly reported RefreshAccessTokenError.");
      return null;
    }

    const fallbackToken = (sess?.accessToken as string | undefined) ?? null;

    console.log(`[session-updater] Fallback refresh resulted in new token: ${!!fallbackToken}`);
    return fallbackToken;
  } catch (error) {
    console.error("[session-updater] forceTokenRefresh encountered a network or logic exception:", error);
    return null;
  }
}

"use client";

/**
 * useActivityTracker
 *
 * Registers the NextAuth `update` fn in the session-updater singleton so that
 * the axios request interceptor can call it to sync React session state after
 * a direct cookie refresh (POST /api/auth/refresh).
 *
 * Token refresh is handled entirely in the axios interceptors:
 *  - Request interceptor: proactively refreshes when < 2 min remain on the token.
 *  - Response interceptor: retries on 401 with a single-flight mutex.
 *  - Logout only when the refresh token itself is expired/invalid.
 */

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { registerSessionUpdate } from "@/lib/session-updater";

export function useActivityTracker() {
  const { update } = useSession();

  // Register `update` in the singleton so axios interceptors can sync React
  // state after a successful direct-cookie refresh (no CSRF needed).
  useEffect(() => {
    registerSessionUpdate(update);
  }, [update]);
}

"use client";

/**
 * useActivityTracker
 *
 * Tracks real user activity and manages session lifecycle:
 *
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │  User active?  │  Token state          │  Action             │
 *  ├──────────────────────────────────────────────────────────────┤
 *  │  YES           │  expires in < 5 min   │  proactive refresh  │
 *  │  NO > 20 min   │  any                  │  auto logout        │
 *  └──────────────────────────────────────────────────────────────┘
 *
 *  lastActivity stored in localStorage — survives tab refreshes.
 *  On login the value is reset automatically (hook mounts fresh).
 */

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

// ── Constants ─────────────────────────────────────────────────────────────────
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;  // 20 min → auto logout
const PROACTIVE_REFRESH_MS = 5 * 60 * 1000;    // refresh when < 5 min left on token
const CHECK_INTERVAL_MS = 60 * 1000;            // check every 60 s
const ACTIVITY_THROTTLE_MS = 30 * 1000;         // update localStorage max every 30 s
const STORAGE_KEY = "uni_last_active";

// User-interaction events that count as "activity"
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useActivityTracker() {
  const { data: session, update } = useSession();
  const lastSavedRef = useRef(0);    // tracks last localStorage write (in-memory, no re-render)
  const lastRefreshRef = useRef(0);  // throttles proactive refresh calls

  // Keep a ref to the latest session so check() always reads current expiry
  // without needing session in the effect dependency array (avoids infinite loop).
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  });

  // ── 1. Register activity listeners ──────────────────────────────────────────
  useEffect(() => {
    // ALWAYS reset the activity tracker on mount!
    // If we only set it when missing, a stale timestamp from a previous session
    // will instantly trigger the 20-minute logout loop right after a fresh login.
    const mountTime = Date.now();
    localStorage.setItem(STORAGE_KEY, String(mountTime));
    lastSavedRef.current = mountTime;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastSavedRef.current > ACTIVITY_THROTTLE_MS) {
        lastSavedRef.current = now;
        try { localStorage.setItem(STORAGE_KEY, String(now)); } catch { /* storage full */ }
      }
    };

    ACTIVITY_EVENTS.forEach(ev =>
      window.addEventListener(ev, handleActivity, { passive: true })
    );
    return () =>
      ACTIVITY_EVENTS.forEach(ev =>
        window.removeEventListener(ev, handleActivity)
      );
  }, []);

  // ── 2. Periodic check (inactivity + proactive refresh) ───────────────────────
  // We depend on `!!session` (not the full session object) so the effect:
  //  - starts up as soon as the session becomes available after initial load
  //  - does NOT restart on every session data update (avoids infinite loops)
  const hasSession = !!session;

  useEffect(() => {
    if (!hasSession) return;

    const check = async () => {
      // Read last activity from localStorage
      let lastActive: number;
      try { lastActive = Number(localStorage.getItem(STORAGE_KEY) || Date.now()); }
      catch { lastActive = Date.now(); }

      const inactiveMs = Date.now() - lastActive;

      // ── Case 1: Inactive too long → auto logout ───────────────────────────
      if (inactiveMs > INACTIVITY_TIMEOUT_MS) {
        await signOut({ callbackUrl: `${window.location.origin}/login` });
        return;
      }

      // ── Case 2: Token about to expire + user is active → proactive refresh ──
      // Always read from the ref so we have the latest accessTokenExpiry value
      // even though session is not in the dependency array.
      const expiry = (sessionRef.current as { accessTokenExpiry?: number } | null)?.accessTokenExpiry;
      if (expiry) {
        const timeLeft = expiry - Date.now();
        if (timeLeft < PROACTIVE_REFRESH_MS) {
          // Throttle refresh calls to once per minute to avoid hammering the backend
          if (Date.now() - lastRefreshRef.current > 60_000) {
            lastRefreshRef.current = Date.now();
            try { await update({ forceRefresh: true }); } catch { /* axios interceptor handles 401 if this fails */ }
          }
        }
      }
    };

    // Also run check immediately when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") check();
    };

    check(); // immediate check on mount / session arrival
    const timer = setInterval(check, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibility);

    // Listen for Forced Session Refresh commands emitted by Axios Interceptor
    const handleForceUpdate = () => {
      update({ forceRefresh: true });
    };
    window.addEventListener("force-session-update", handleForceUpdate);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("force-session-update", handleForceUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession, update]);
  // - hasSession: re-run when session becomes available (null → truthy)
  // - update: stable reference from useSession, safe to include
  // - session object itself intentionally excluded: changes on every update() call
  //   which would restart the interval; instead we read the latest data via sessionRef
}

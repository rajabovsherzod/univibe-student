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
 *  │  YES           │  already expired      │  refresh (axios 401 │
 *  │                │                       │  interceptor does   │
 *  │                │                       │  this too)          │
 *  │  NO > 20 min   │  any                  │  auto logout        │
 *  │  Return < 20min│  any                  │  check & refresh    │
 *  └──────────────────────────────────────────────────────────────┘
 *
 *  lastActivity stored in localStorage — survives tab refreshes.
 *  On login the value is reset automatically (hook mounts fresh).
 */

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

// ── Constants ─────────────────────────────────────────────────────────────────
const INACTIVITY_TIMEOUT_MS  = 20 * 60 * 1000;  // 20 min → auto logout
const PROACTIVE_REFRESH_MS   =  5 * 60 * 1000;  // refresh when < 5 min left on token
const CHECK_INTERVAL_MS      = 60 * 1000;        // check every 60 s
const ACTIVITY_THROTTLE_MS   = 30 * 1000;        // update localStorage max every 30 s
const STORAGE_KEY             = "uni_last_active";

// User-interaction events that count as "activity"
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useActivityTracker() {
  const { data: session, update } = useSession();
  const lastSavedRef = useRef(0); // tracks last localStorage write (in-memory, no re-render)

  // ── 1. Register activity listeners ──────────────────────────────────────────
  useEffect(() => {
    // Init lastActivity if not present (covers first login or cleared storage)
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }

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
  useEffect(() => {
    if (!session) return;

    const check = async () => {
      // Read last activity from localStorage
      let lastActive: number;
      try { lastActive = Number(localStorage.getItem(STORAGE_KEY) || Date.now()); }
      catch { lastActive = Date.now(); }

      const inactiveMs = Date.now() - lastActive;

      // ── Case 1: Inactive too long → auto logout ───────────────────────────
      if (inactiveMs > INACTIVITY_TIMEOUT_MS) {
        console.log(`[activity] inactive ${Math.round(inactiveMs / 60000)} min → logout`);
        await signOut({ callbackUrl: `${window.location.origin}/login` });
        return;
      }

      // ── Case 2: Token about to expire + user is active → proactive refresh ──
      const expiry = (session as { accessTokenExpiry?: number }).accessTokenExpiry;
      if (expiry) {
        const timeLeft = expiry - Date.now();
        if (timeLeft < PROACTIVE_REFRESH_MS) {
          console.log(`[activity] token expires in ${Math.round(timeLeft / 1000)}s → refreshing`);
          try { await update(); } catch { /* axios interceptor handles 401 if this fails */ }
        }
      }
    };

    // Also run check immediately when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") check();
    };

    check(); // immediate check on mount
    const timer = setInterval(check, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [session, update]);
}

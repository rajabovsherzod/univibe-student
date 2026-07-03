'use client';

import { signOut } from 'next-auth/react';
import { getLogoutUrl } from './get-app-url';

/**
 * Sign the student out and land on the app's own /login.
 *
 * We pass `redirect: false` and do the redirect ourselves because NextAuth's
 * built-in `callbackUrl` is restricted to the `NEXTAUTH_URL` origin — when the
 * app actually runs on a different origin (e.g. the dev server fell back to
 * :3002 while NEXTAUTH_URL still says :3001) NextAuth drops the user on a dead
 * localhost port and the page just spins. `getLogoutUrl()` returns the current
 * browser origin, so the hard `window.location.href` always lands somewhere alive.
 */
export async function performLogout(): Promise<void> {
  try {
    await signOut({ redirect: false });
  } catch {
    // Even if the sign-out request hiccups, still leave the app.
  } finally {
    if (typeof window !== 'undefined') {
      window.location.href = getLogoutUrl();
    }
  }
}

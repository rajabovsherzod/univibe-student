/**
 * POST /api/auth/refresh
 *
 * Direct server-side token refresh endpoint.
 *
 * Why this exists:
 *   NextAuth's `update({ forceRefresh: true })` relies on a CSRF token round-trip
 *   and can silently return null on validation failures or network hiccups.
 *   This endpoint bypasses that chain entirely:
 *     1. Reads the refresh token from the JWT cookie via getToken()
 *     2. Calls the backend refresh endpoint (server-side → no CORS)
 *     3. Encodes the new token and sets the updated JWT cookie directly
 *     4. Returns the new access token to the caller
 */

import { NextResponse, type NextRequest } from "next/server";
import { getToken, encode } from "next-auth/jwt";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz").replace(/\/$/, "");
const ACCESS_TOKEN_LIFETIME_MS = 14 * 60 * 1000; // 14 min (backend gives 15 min)
const SECRET = process.env.NEXTAUTH_SECRET!;

// NextAuth uses __Secure- prefix when served over HTTPS
const USE_SECURE_COOKIES = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const COOKIE_NAME = USE_SECURE_COOKIES
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

export async function POST(req: NextRequest) {
  console.log("[refresh/route.ts] POST /api/auth/refresh triggered");
  try {
    // 1. Read current JWT from cookie
    const token = await getToken({ req, secret: SECRET });
    if (!token?.refreshToken) {
      console.warn("[refresh/route.ts] No refreshToken found in the session cookie!");
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }

    console.log(`[refresh/route.ts] Found refresh token: ${token.refreshToken.substring(0, 10)}... Calling backend.`);
    // 2. Call backend refresh endpoint (server-side → no CORS)
    const res = await fetch(`${BASE_URL}/api/v1/user/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });

    if (!res.ok) {
      console.error(`[refresh/route.ts] Backend returned status ${res.status}. Token refresh rejected.`);
      return NextResponse.json({ error: "refresh_failed" }, { status: 401 });
    }

    const data = (await res.json()) as Record<string, unknown>;
    const newAccessToken = data?.access as string | undefined;
    if (!newAccessToken) {
      console.error("[refresh/route.ts] Backend returned 200 OK but no 'access' field found in JSON payload.", data);
      return NextResponse.json({ error: "no_access_token" }, { status: 401 });
    }
    console.log("[refresh/route.ts] Successfully obtained new access token from backend.");

    // 3. Build updated token
    //    Handle refresh token rotation: if backend returns new refresh token, use it.
    //    Otherwise preserve the existing one.
    const newToken = {
      ...token,
      accessToken: newAccessToken,
      expiresAt: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
      error: undefined as string | undefined,
      ...(data.refresh ? { refreshToken: data.refresh as string } : {}),
    };

    // 4. Re-encode and set the cookie on the response
    const encoded = await encode({ token: newToken, secret: SECRET });

    const response = NextResponse.json({ accessToken: newAccessToken });
    response.cookies.set(COOKIE_NAME, encoded, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: USE_SECURE_COOKIES,
      maxAge: 10 * 24 * 60 * 60, // 10 days — matches session.maxAge
    });

    console.log("[refresh/route.ts] Successfully baked new JWT cookie. Sending response.");
    return response;
  } catch (error) {
    console.error("[refresh/route.ts] Internal server error during refresh:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

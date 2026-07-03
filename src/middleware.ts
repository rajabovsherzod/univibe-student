import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Must match the app-scoped cookie name/secret configured in
// [...nextauth]/route.ts. `withAuth` can't be told a custom cookie name, so we
// read the token manually with getToken({ cookieName }) — otherwise the
// middleware looks for the default `next-auth.session-token`, never finds our
// renamed cookie, thinks the user is logged out, and bounces to /login while
// the client (which reads the cookie fine) bounces back → ERR_TOO_MANY_REDIRECTS.
const SECRET = process.env.NEXTAUTH_SECRET;
const USE_SECURE_COOKIES = (process.env.NEXTAUTH_URL || "").startsWith("https://");
const COOKIE_NAME = `${USE_SECURE_COOKIES ? "__Secure-" : ""}univibe-student.session-token`;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: SECRET,
    cookieName: COOKIE_NAME,
    secureCookie: USE_SECURE_COOKIES,
  });

  // Not authenticated, or the refresh token is dead → send to login.
  if (!token || token.error === "RefreshAccessTokenError") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const studentStatus = token.studentStatus as string | undefined;
  const role = (token.role as string | undefined)?.toUpperCase();

  // Only students are gated by the onboarding flow.
  if (role !== "STUDENT") return NextResponse.next();

  const onSetupProfile = pathname.startsWith("/setup-profile");
  const onWaitingRoom = pathname.startsWith("/waiting-room");
  const onOnboarding = onSetupProfile || onWaitingRoom;

  // ── Status-driven routing ──────────────────────────────────────────────
  // approved / rejected → full app; never on the onboarding screens.
  if (studentStatus === "approved" || studentStatus === "rejected") {
    if (onOnboarding) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // waited → profile submitted, pending review → ONLY the waiting room.
  if (studentStatus === "waited") {
    if (!onWaitingRoom) return NextResponse.redirect(new URL("/waiting-room", req.url));
    return NextResponse.next();
  }

  // not_found / empty / anything else → profile not created yet → setup.
  if (!onSetupProfile) return NextResponse.redirect(new URL("/setup-profile", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    // All routes except auth pages, API, Next.js internals, and static assets
    "/((?!login|signup|forgot-password|api|_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt)$).*)",
  ],
};

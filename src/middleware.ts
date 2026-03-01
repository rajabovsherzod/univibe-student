import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (!token) return NextResponse.next();

    const studentStatus = token.studentStatus as string | undefined;
    const role = (token.role as string | undefined)?.toUpperCase();

    // Only gate student accounts
    if (role !== "STUDENT") return NextResponse.next();

    const onSetupProfile = pathname.startsWith("/setup-profile");
    const onWaitingRoom = pathname.startsWith("/waiting-room");

    // not_found → must stay ONLY on /setup-profile
    if (studentStatus === "not_found") {
      if (!onSetupProfile) {
        return NextResponse.redirect(new URL("/setup-profile", req.url));
      }
    }

    // waited → must stay ONLY on /waiting-room
    if (studentStatus === "waited") {
      if (!onWaitingRoom) {
        return NextResponse.redirect(new URL("/waiting-room", req.url));
      }
    }

    // approved or rejected → must NOT be on onboarding screens
    if (studentStatus === "approved" || studentStatus === "rejected") {
      if (onSetupProfile || onWaitingRoom) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run middleware on authenticated requests; unauthenticated → signIn page
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // All routes except auth pages, API, Next.js internals, and static assets
    "/((?!login|signup|forgot-password|api|_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt)$).*)",
  ],
};

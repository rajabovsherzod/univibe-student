import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ── Type augmentation ─────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      universityId?: string;
      role?: string;
      studentStatus?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    fullName?: string;
    role?: string;
    universityId?: string;
    studentStatus?: string;
    expiresAt?: number;       // ms timestamp when access token expires
    error?: string;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz";
const ACCESS_TOKEN_LIFETIME_MS = 23 * 60 * 60 * 1000; // 23 h (buffer before 24 h expiry)

async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number } | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/user/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.access) return null;
    return {
      accessToken: data.access as string,
      expiresAt: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
    };
  } catch {
    return null;
  }
}

// ── Auth options ───────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        access_token: { label: "Access Token", type: "text" },
        refresh_token: { label: "Refresh Token", type: "text" },
        full_name: { label: "Name", type: "text" },
        role: { label: "Role", type: "text" },
        university_id: { label: "University ID", type: "text" },
        student_status: { label: "Student Status", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Direct token insertion (OTP registration flow)
        if (credentials.access_token && credentials.refresh_token) {
          return {
            id: credentials.email || Date.now().toString(),
            email: credentials.email,
            accessToken: credentials.access_token,
            refreshToken: credentials.refresh_token,
            fullName: (credentials.full_name || "").replace(/\bUser\b/gi, "").trim() || "Talaba",
            role: credentials.role || "STUDENT",
            universityId: credentials.university_id || "",
            studentStatus: credentials.student_status || "",
          };
        }

        // Standard email+password login
        try {
          const res = await fetch(`${BASE_URL}/api/v1/user/auth/login/`, {
            method: "POST",
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.detail || "Email yoki parol noto'g'ri");
          }

          const user = await res.json();

          if (user?.access_token) {
            return {
              id: user.email || Date.now().toString(),
              email: user.email,
              accessToken: user.access_token,
              refreshToken: user.refresh_token,
              fullName: (user.full_name || "").replace(/\bUser\b/gi, "").trim() || user.email,
              role: user.role,
              universityId: user.university_id || "",
              studentStatus: user.student_status || "",
            };
          }
          return null;
        } catch (error: unknown) {
          throw new Error((error as Error)?.message || "Tarmoq xatosi");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Handle session.update() calls from the client
      if (trigger === "update" && session?.studentStatus !== undefined) {
        token.studentStatus = session.studentStatus;
      }

      // Initial sign in — populate token from user object
      if (user) {
        const u = user as any;
        return {
          ...token,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          fullName: u.fullName,
          role: u.role,
          universityId: u.universityId,
          studentStatus: u.studentStatus,
          expiresAt: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
          error: undefined,
        };
      }

      // Token still valid — return as-is
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token;
      }

      // Access token expired — attempt server-side refresh
      if (token.refreshToken) {
        const refreshed = await refreshAccessToken(token.refreshToken);
        if (refreshed) {
          return { ...token, ...refreshed, error: undefined };
        }
      }

      // Refresh failed — mark session as expired; middleware will redirect to login
      return { ...token, error: "RefreshAccessTokenError" };
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      if (session.user) {
        session.user.name = token.fullName as string;
        session.user.universityId = token.universityId as string;
        session.user.role = token.role as string;
        session.user.studentStatus = token.studentStatus as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 days — matches refresh token lifetime
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

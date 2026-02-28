import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // Used to distinguish normal login vs otp login token insertion
        access_token: { label: "Access Token", type: "text" },
        refresh_token: { label: "Refresh Token", type: "text" },
        full_name: { label: "Name", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // If passing tokens directly (from OTP registration flow)
        if (credentials.access_token && credentials.refresh_token) {
          return {
            id: credentials.email || Date.now().toString(),
            email: credentials.email,
            accessToken: credentials.access_token,
            refreshToken: credentials.refresh_token,
            fullName: credentials.full_name || "Talaba",
            role: credentials.role || "STUDENT"
          };
        }

        // Standard Login
        try {
          // Since API url isn't fully absolute if NEXT_PUBLIC_API_URL handles it, we mock or fetch
          // But we must fetch server-side absolute
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.univibe.uz";
          const res = await fetch(`${baseUrl}/api/v1/user/auth/login/`, {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            throw new Error("Email yoki parol noto'g'ri");
          }

          const user = await res.json();

          if (user && user.access_token) {
            return {
              id: user.email || Date.now().toString(),
              email: user.email,
              accessToken: user.access_token,
              refreshToken: user.refresh_token,
              fullName: user.full_name,
              role: user.role,
              universityId: user.university_id
            };
          }
          return null;
        } catch (error) {
          throw new Error("Tarmoq xatosi yoki email noto'g'ri");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.fullName = (user as any).fullName;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      if (session.user) {
        session.user.name = token.fullName as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

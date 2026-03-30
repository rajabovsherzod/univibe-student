import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { AppProvider } from "@/providers/app-provider";
import { ThemeToaster } from "@/providers/theme-toaster";
import type { Locale } from "@/lib/i18n/i18n";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://student.univibe.uz";
const APP_NAME = "Univibe Student";
const APP_DESCRIPTION =
  "Univibe — universitetdagi voqealar, reyting, do'kon va boshqa imkoniyatlar bitta platformada. Ballaringizni yig'ing, tadbirlarda ishtirok eting va yutuqlarga erishing.";

// ── Metadata ───────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  // ── Title template ──────────────────────────────────────────────────────
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,

  // ── Application info ────────────────────────────────────────────────────
  applicationName: APP_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Univibe", url: "https://univibe.uz" }],
  creator: "Univibe",
  publisher: "Univibe",
  keywords: [
    "univibe",
    "student",
    "university",
    "events",
    "tadbirlar",
    "leaderboard",
    "reyting",
    "shop",
    "do'kon",
    "coins",
    "ball",
    "campus",
    "universitet",
  ],

  // ── Robots ──────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // ── Canonical & alternates ──────────────────────────────────────────────
  alternates: {
    canonical: APP_URL,
    languages: { "uz-UZ": `${APP_URL}/uz` },
  },

  // ── OpenGraph defaults ──────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — Talabalar Platformasi`,
        type: "image/png",
      },
    ],
  },

  // ── Twitter Card ────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@univibe_uz",
    creator: "@univibe_uz",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
  },

  // ── PWA / Icons ─────────────────────────────────────────────────────────
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
  },

  // ── Other ────────────────────────────────────────────────────────────────
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  category: "education",
};

// ── Viewport ───────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7f56d9" },
    { media: "(prefers-color-scheme: dark)", color: "#6941c6" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ── Layout ─────────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch session on the server to prevent client-side flickering
  const session = await getServerSession(authOptions);

  // Read cookies on the SERVER → correct SSR → zero flash
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  const localeCookie = (cookieStore.get('locale')?.value || 'uz') as Locale;

  // User data from cookie → sidebar shows correct name/email from SSR
  let initialUser: { name?: string; email?: string; photo?: string } | undefined;
  const userCookie = cookieStore.get('user_data')?.value;
  if (userCookie) {
    try { initialUser = JSON.parse(decodeURIComponent(userCookie)); } catch { }
  }

  // Server sets the correct class → browser paints correct theme immediately
  const themeClass = themeCookie === 'dark' ? 'dark-mode' : 'light-mode';

  return (
    <html lang={localeCookie} className={themeClass} suppressHydrationWarning>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for API */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL ?? "https://api.univibe.uz"} />
        {/* Blocking script — fallback for first visit when no cookie exists yet */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                var el = document.documentElement;
                if (t === 'dark') {
                  el.classList.remove('light-mode');
                  el.classList.add('dark-mode');
                } else if (t === 'light') {
                  el.classList.remove('dark-mode');
                  el.classList.add('light-mode');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AppProvider initialLocale={localeCookie} initialUser={initialUser} session={session}>
          {children}
          <ThemeToaster />
        </AppProvider>
      </body>
    </html>
  );
}

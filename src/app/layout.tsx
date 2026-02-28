import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/providers/app-provider";
import { ThemeToaster } from "@/providers/theme-toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Univibe Student - University Student Platform",
  description: "A comprehensive student platform for university events, leaderboard, shop, and more.",
  keywords: ["university", "student", "events", "leaderboard", "shop", "campus"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AppProvider>
          {children}
          <ThemeToaster />
        </AppProvider>
      </body>
    </html>
  );
}

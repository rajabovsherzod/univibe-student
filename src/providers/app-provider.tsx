"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import AppQueryClientProvider from "./query-client-provider";
import { RouteProvider } from "./router-provider";
import { I18nProvider, type Locale } from "@/lib/i18n/i18n";

import { SessionProvider } from "next-auth/react";

// ── Initial user data context (from server cookie) ─────────────────────
export interface InitialUserData {
  name?: string;
  email?: string;
  photo?: string;
}

const InitialUserContext = createContext<InitialUserData | undefined>(undefined);

export function useInitialUser() {
  return useContext(InitialUserContext);
}

// ── Telegram banner dismissed context ──────────────────────────────────
const TgBannerContext = createContext<boolean>(false);

export function useTgBannerDismissed() {
  return useContext(TgBannerContext);
}

// ── App Provider ───────────────────────────────────────────────────────
interface AppProviderProps extends PropsWithChildren {
  initialLocale?: Locale;
  initialUser?: InitialUserData;
  tgBannerDismissed?: boolean;
}

export const AppProvider = ({
  children,
  initialLocale,
  initialUser,
  tgBannerDismissed = false,
}: AppProviderProps) => {
  return (
    <SessionProvider>
      <AppQueryClientProvider>
        <I18nProvider initialLocale={initialLocale}>
          <InitialUserContext.Provider value={initialUser}>
            <TgBannerContext.Provider value={tgBannerDismissed}>
              <RouteProvider>{children}</RouteProvider>
            </TgBannerContext.Provider>
          </InitialUserContext.Provider>
        </I18nProvider>
      </AppQueryClientProvider>
    </SessionProvider>
  );
};

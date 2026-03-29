"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import AppQueryClientProvider from "./query-client-provider";
import { RouteProvider } from "./router-provider";
import { I18nProvider, type Locale } from "@/lib/i18n/i18n";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

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

// ── App Provider ───────────────────────────────────────────────────────
interface AppProviderProps extends PropsWithChildren {
  initialLocale?: Locale;
  initialUser?: InitialUserData;
  session?: Session | null;
}

export const AppProvider = ({
  children,
  initialLocale,
  initialUser,
  session,
}: AppProviderProps) => {
  return (
    <SessionProvider session={session}>
      <AppQueryClientProvider>
        <I18nProvider initialLocale={initialLocale}>
          <InitialUserContext.Provider value={initialUser}>
            <RouteProvider>{children}</RouteProvider>
          </InitialUserContext.Provider>
        </I18nProvider>
      </AppQueryClientProvider>
    </SessionProvider>
  );
};

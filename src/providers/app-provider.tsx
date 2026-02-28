"use client";

import type { PropsWithChildren } from "react";
import AppQueryClientProvider from "./query-client-provider";
import { RouteProvider } from "./router-provider";

import { SessionProvider } from "next-auth/react";

export const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider>
      <AppQueryClientProvider>
        <RouteProvider>{children}</RouteProvider>
      </AppQueryClientProvider>
    </SessionProvider>
  );
};

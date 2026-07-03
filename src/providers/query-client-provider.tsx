'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function AppQueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't re-fetch just because the window/tab regained focus — that
            // was re-hitting the API (and re-flashing skeletons) every time the
            // user Alt+Tabbed back. Data stays put until a real navigation/refresh.
            refetchOnWindowFocus: false,
            // Keep data fresh enough without hammering the API on every remount.
            staleTime: 1000 * 60, // 1 min
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

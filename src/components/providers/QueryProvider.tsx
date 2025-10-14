'use client';

import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query';
import { ReactNode, useState, Suspense } from 'react';

// Dynamically import React Query Devtools only in development mode
// Using dynamic import instead of require so Next.js can optimize the bundle
const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? (await import('@tanstack/react-query-devtools')).ReactQueryDevtools
    : () => null;

export function QueryClientProvider({ children }: { children: ReactNode }) {
  // Initialize QueryClient only once
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // Configure default query options
          queries: {
            // When the user refocuses the browser/tab, queries will refetch
            refetchOnWindowFocus: true,

            // If a query fails, React Query will retry up to 2 times
            retry: 2,
          },
          mutations: {
            // Mutations (POST/PUT/DELETE) will not retry by default
            // This avoids duplicate requests causing inconsistent data
            retry: 0,
          },
        },
      }),
  );

  return (
    // Provider makes queryClient available throughout the app
    <TanstackQueryClientProvider client={queryClient}>
      {children}

      {/* Only render Devtools in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </TanstackQueryClientProvider>
  );
}

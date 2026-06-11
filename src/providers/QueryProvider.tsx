"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't retry on 4xx errors (auth failures, not found, etc.)
        retry: (failureCount, error) => {
          if (error instanceof Error && 'status' in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
        // Default: data is fresh for 30 seconds
        staleTime: 30 * 1000,
        // Keep unused data for 10 minutes before GC
        gcTime: 10 * 60 * 1000,
        // Refetch when user returns to tab
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient once per component lifecycle (not on every render)
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

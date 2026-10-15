import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // api.ts already handles retries with backoff
      staleTime: 30 * 60 * 1000, // 30 minutes in memory per Task 4
      gcTime: 60 * 60 * 1000, // 60 minutes
      refetchOnWindowFocus: false, // No refetch on window focus per Task 4
      refetchOnReconnect: true, // Refetch on reconnect once per Task 4
      refetchInterval: false, // No polling per Task 4
    },
  },
});

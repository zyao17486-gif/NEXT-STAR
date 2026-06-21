import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 min before refetch
      gcTime: 30 * 60 * 1000,          // Keep in cache 30 min (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

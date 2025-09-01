import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';

export function useGetCustomer(lineUserId) {
  return useQuery({
    queryKey: ['customer', lineUserId],
    enabled: !!lineUserId, // don't fetch without an id
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        // Don't retry for client-side errors
        if (status && status < 500) return false;
      }
      return failureCount < 2; // retry up to 2 times for 5xx/network
    },
    queryFn: async () => {
      if (!lineUserId) return null;
      try {
        const { data } = await axios.get(`/customers/${encodeURIComponent(lineUserId)}`);
        return data ?? null;
      } catch (error) {
        // Treat 404 as "no customer yet"
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        // Other errors should surface via React Query's isError
        throw error;
      }
    },
  });
}

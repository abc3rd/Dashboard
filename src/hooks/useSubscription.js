import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Must match FREE_DAILY_LIMIT in base44/functions/ucpRouter/entry.ts
export const FREE_DAILY_LIMIT = 10;

/**
 * Returns the current user's subscription tier ('pro' | 'free') and plan.
 * Reads the user's own Subscription records (RLS-scoped by owner email).
 */
export function useSubscription() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: async () => {
      try {
        return await base44.entities.Subscription.list('-created_date', 20);
      } catch (e) {
        return [];
      }
    },
    staleTime: 15000,
  });

  const activeSub = subscriptions.find((s) => s.status === 'active');
  const tier = activeSub ? 'pro' : 'free';
  const plan = activeSub?.plan || null;

  return { tier, plan, subscription: activeSub, isLoading };
}

/**
 * Returns the count of queries the current user has made today (UTC day boundary
 * via server-stored created_date). Used to show remaining free-tier quota.
 */
export function useDailyQueryCount() {
  const { data = 0 } = useQuery({
    queryKey: ['dailyQueryCount'],
    queryFn: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      try {
        const logs = await base44.entities.QueryLog.filter(
          { created_date: { $gte: startOfDay.toISOString() } },
          '-created_date',
          200
        );
        return logs.length;
      } catch (e) {
        return 0;
      }
    },
    staleTime: 10000,
  });
  return data;
}
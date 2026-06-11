import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function usePayments(tenantId: string | null) {
  return useQuery({
    queryKey: ['payments', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', parseInt(tenantId))
        .order('id', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
    // Payments MUST be fresh — never serve stale payment data
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

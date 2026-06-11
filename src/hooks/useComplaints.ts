import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function useComplaints(tenantId: string | null) {
  return useQuery({
    queryKey: ['complaints', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('tenant_id', parseInt(tenantId))
        .order('id', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
    // Complaints — moderate freshness needed (status changes matter but not critical)
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function useParcels(tenantId: string | null) {
  return useQuery({
    queryKey: ['parcels', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('tenant_id', parseInt(tenantId))
        .order('id', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
    // Parcels — need reasonably fresh data for OTP collection
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

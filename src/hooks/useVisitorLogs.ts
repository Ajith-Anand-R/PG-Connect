import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function useVisitorLogs(tenantId: string | null) {
  return useQuery({
    queryKey: ['visitor-logs', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('visitor_logs')
        .select('*')
        .eq('tenant_id', parseInt(tenantId))
        .order('id', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
    // Visitor logs — must be fresh for gate approvals
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useStaffLogs(pgId: number | null) {
  return useQuery({
    queryKey: ['staff-logs', pgId],
    queryFn: async () => {
      if (!pgId) return [];
      const { data, error } = await supabase
        .from('visitor_logs')
        .select('*')
        .eq('pg_id', pgId)
        .eq('visitor_type', 'daily_help')
        .order('id', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!pgId,
    // Staff logs — moderate freshness
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

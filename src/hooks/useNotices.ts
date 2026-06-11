import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export interface NoticeRaw {
  id: number;
  title: string;
  message: string;
  created_at: string;
  pg_id: number;
}

export function useNotices(pgId: number | null) {
  return useQuery({
    queryKey: ['notices', pgId],
    queryFn: async () => {
      if (!pgId) return [];
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('pg_id', pgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as NoticeRaw[];
    },
    enabled: !!pgId,
    // Notices change infrequently — safe to serve stale for 10 minutes
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

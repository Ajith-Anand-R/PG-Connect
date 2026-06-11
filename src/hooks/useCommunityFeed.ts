import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function useCommunityFeed(pgId: number | null, userId: string | null) {
  return useQuery({
    queryKey: ['community-feed', pgId],
    queryFn: async () => {
      if (!pgId) return { posts: [], comments: [], likes: [], tenantRoomMap: {} };

      const [postsRes, commentsRes, likesRes, tenantsRes] = await Promise.all([
        supabase
          .from('community_posts')
          .select(`id, created_at, title, content, category, type, image_url, user_id, users (name, photo)`)
          .eq('pg_id', pgId)
          .order('created_at', { ascending: false }),
        supabase
          .from('community_comments')
          .select(`id, created_at, post_id, text, users (name, photo)`),
        supabase
          .from('community_likes')
          .select('*'),
        supabase
          .from('tenants')
          .select('user_id, rooms(room_number)'),
      ]);

      // Build tenant room map
      const tenantRoomMap: Record<string, string> = {};
      if (tenantsRes.data) {
        tenantsRes.data.forEach((t: any) => {
          if (t.user_id && t.rooms) {
            const roomData = t.rooms as unknown as { room_number: string | number }[] | { room_number: string | number } | null;
            const roomNumber = Array.isArray(roomData) ? roomData[0]?.room_number : roomData?.room_number;
            tenantRoomMap[t.user_id] = roomNumber ? `Room ${roomNumber}` : 'Room N/A';
          }
        });
      }

      return {
        posts: postsRes.data ?? [],
        comments: commentsRes.data ?? [],
        likes: likesRes.data ?? [],
        tenantRoomMap,
      };
    },
    enabled: !!pgId,
    // Community feed — social data, slightly stale is OK
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

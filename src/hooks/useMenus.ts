import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface MenuProcessed {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
}

function getCurrentWeekDates(): string[] {
  const current = new Date();
  const week: string[] = [];
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay.toISOString().split('T')[0]);
  }
  return week;
}

function processMenuData(dbMenuDays: any[]): MenuProcessed[] {
  const menuMap: Record<string, MenuProcessed> = {};
  DAYS_OF_WEEK.forEach((day) => {
    menuMap[day] = {
      day,
      breakfast: "Not Scheduled",
      lunch: "Not Scheduled",
      dinner: "Not Scheduled",
      breakfastTime: "08:00 AM - 10:00 AM",
      lunchTime: "01:00 PM - 03:00 PM",
      dinnerTime: "08:00 PM - 10:00 PM"
    };
  });

  dbMenuDays.forEach((dayRecord: { date: string; menu_items: Array<{ meal_type: string; item_name: string; serve_time?: string }> }) => {
    const dateObj = new Date(dayRecord.date);
    let dayIndex = dateObj.getDay() - 1;
    if (dayIndex < 0) dayIndex = 6;
    const dayName = DAYS_OF_WEEK[dayIndex];
    
    if (menuMap[dayName]) {
      (dayRecord.menu_items || []).forEach((item) => {
        if (item.meal_type === 'breakfast') {
          menuMap[dayName].breakfast = item.item_name;
          if (item.serve_time) menuMap[dayName].breakfastTime = item.serve_time;
        } else if (item.meal_type === 'lunch') {
          menuMap[dayName].lunch = item.item_name;
          if (item.serve_time) menuMap[dayName].lunchTime = item.serve_time;
        } else if (item.meal_type === 'dinner') {
          menuMap[dayName].dinner = item.item_name;
          if (item.serve_time) menuMap[dayName].dinnerTime = item.serve_time;
        }
      });
    }
  });

  return Object.values(menuMap);
}

export function useMenus(pgId: number | null) {
  return useQuery({
    queryKey: ['menus', pgId],
    queryFn: async () => {
      if (!pgId) return [];
      const dates = getCurrentWeekDates();
      const { data, error } = await supabase
        .from('menu_days')
        .select('*, menu_items(*)')
        .eq('pg_id', pgId)
        .in('date', dates);
      if (error) throw error;
      return processMenuData(data ?? []);
    },
    enabled: !!pgId,
    // Menus are set weekly — very safe to cache for 10 minutes
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

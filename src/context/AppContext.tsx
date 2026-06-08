"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Types
export interface TenantInfo {
  id: string; // Tenant ID (bigint as string) or User ID (uuid)
  name: string;
  room: string;
  pgName: string;
  bed: string;
  joiningDate: string;
  gateId: string;
  email: string;
  phone: string;
  leaseEndDate?: string;
  emergencyContact?: string;
  cardLastFour?: string;
  deposit?: string;
}

export interface Menu {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  category: string;
}

export interface ServiceRequest {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  raisedDate: string;
}

export interface GuestPass {
  id: string;
  visitorName: string;
  relationship: string;
  phone: string;
  date: string;
  entryTime: string;
  exitTime: string;
  qrCodeToken: string;
}

export interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  messages: Message[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Event' | 'Maintenance' | 'Notice';
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface OwnerTenant {
  id: string | number;
  status: string;
  join_date?: string;
  deposit?: string | number;
  users: {
    name: string;
    phone?: string;
    meal_dietary?: 'Veg' | 'Non-Veg' | 'Egg';
    meal_breakfast?: boolean;
    meal_lunch?: boolean;
    meal_dinner?: boolean;
  } | null;
  rooms: {
    room_number: string;
  } | null;
  beds?: {
    bed_number: string;
  } | null;
}

export interface OwnerPayment {
  id: string | number;
  amount: string;
  month: string;
  status: string;
  payment_method: string | null;
  payment_date?: string | null;
  tenants: {
    users: {
      name: string;
    } | null;
    rooms: {
      room_number: string;
    } | null;
  } | null;
}

export interface OwnerComplaint {
  id: string | number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  tenants: {
    users: {
      name: string;
    } | null;
    rooms: {
      room_number: string;
    } | null;
  } | null;
}

interface AppContextType {
  tenant: TenantInfo;
  bills: Bill[];
  requests: ServiceRequest[];
  guestPasses: GuestPass[];
  chats: ChatThread[];
  notices: Notice[];
  notifications: AppNotification[];
  menuList: Menu[];
  payBill: (id: string) => void;
  addRequest: (category: string, title: string, description: string, priority: 'Low' | 'Medium' | 'High') => void;
  addGuestPass: (name: string, relation: string, phone: string, date: string, entryTime: string, exitTime: string) => void;
  sendChatMessage: (threadId: string, text: string) => void;
  markNotificationsAsRead: () => void;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    dietary: 'Veg' | 'Non-Veg' | 'Egg';
  };
  updateMeals: (breakfast: boolean, lunch: boolean, dinner: boolean) => void;
  updateDietary: (dietary: 'Veg' | 'Non-Veg' | 'Egg') => void;
  isLoggedIn: boolean;
  userRole: 'Owner' | 'Tenant' | null;
  login: (emailOrPhone: string, password?: string) => Promise<{ error: string | null }>;
  logout: () => void;
  register: (name: string, email: string, phone: string, password?: string, role?: string) => Promise<{ error: string | null }>;
  
  // Owner States & Actions
  allTenants: OwnerTenant[];
  allComplaints: OwnerComplaint[];
  allPayments: OwnerPayment[];
  allMeals: {
    breakfastCount: number;
    lunchCount: number;
    dinnerCount: number;
    dietaryCounts: { Veg: number; 'Non-Veg': number; Egg: number };
  };
  updateComplaintStatus: (id: string, status: 'pending' | 'in-progress' | 'resolved') => void;
  addNotice: (title: string, message: string) => void;
  markPaymentAsPaid: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("AppProvider render called, window:", typeof window !== 'undefined');
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'Owner' | 'Tenant' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);


  // 1. Tenant Info
  const [tenant, setTenant] = useState<TenantInfo>({
    id: "",
    name: "Loading...",
    room: "...",
    pgName: "Loading PG...",
    bed: "...",
    joiningDate: "...",
    gateId: "...",
    email: "",
    phone: ""
  });

  // Data States
  const [bills, setBills] = useState<Bill[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [guestPasses, setGuestPasses] = useState<GuestPass[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [meals, setMeals] = useState<{
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    dietary: 'Veg' | 'Non-Veg' | 'Egg';
  }>({
    breakfast: true,
    lunch: false,
    dinner: true,
    dietary: 'Veg'
  });

  // Owner Specific States
  const [allTenants, setAllTenants] = useState<OwnerTenant[]>([]);
  const [allComplaints, setAllComplaints] = useState<OwnerComplaint[]>([]);
  const [allPayments, setAllPayments] = useState<OwnerPayment[]>([]);
  const [allMeals, setAllMeals] = useState<{
    breakfastCount: number;
    lunchCount: number;
    dinnerCount: number;
    dietaryCounts: { Veg: number; 'Non-Veg': number; Egg: number };
  }>({
    breakfastCount: 0,
    lunchCount: 0,
    dinnerCount: 0,
    dietaryCounts: { Veg: 0, 'Non-Veg': 0, Egg: 0 }
  });

  // Chat Local Mock State
  const [chats, setChats] = useState<ChatThread[]>([]);

  // Main Data Syncing Function
  const fetchData = useCallback(async (uid: string, email: string) => {
    try {
      // 1. Fetch user profile
      const { data: userProfile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (profileErr || !userProfile) {
        console.error('Error fetching user profile:', profileErr);
        return;
      }

      const role = userProfile.role as 'Owner' | 'Tenant';
      setUserRole(role);


      // Set Meals state
      setMeals({
        breakfast: userProfile.meal_breakfast ?? true,
        lunch: userProfile.meal_lunch ?? false,
        dinner: userProfile.meal_dinner ?? true,
        dietary: (userProfile.meal_dietary as 'Veg' | 'Non-Veg' | 'Egg') ?? 'Veg'
      });

      // 2. Fetch notices (common to both)
      const { data: dbNotices } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbNotices) {
        setNotices(dbNotices.map((n: { id: number; title: string; message: string; created_at: string }) => ({
          id: n.id.toString(),
          title: n.title,
          content: n.message,
          date: new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          category: n.title.toLowerCase().includes('wifi') || n.title.toLowerCase().includes('maintenance') ? 'Maintenance' : 'Notice'
        })));
      }

      // 3. Fetch menus (common to both)
      const { data: dbMenus } = await supabase
        .from('menus')
        .select('*')
        .order('id', { ascending: true });

      if (dbMenus) {
        setMenuList(dbMenus.map((m: { day: string; breakfast: string; lunch: string; dinner: string; breakfast_time: string; lunch_time: string; dinner_time: string }) => ({
          day: m.day,
          breakfast: m.breakfast,
          lunch: m.lunch,
          dinner: m.dinner,
          breakfastTime: m.breakfast_time,
          lunchTime: m.lunch_time,
          dinnerTime: m.dinner_time
        })));
      }

      if (role === 'Tenant') {
        // Fetch Tenant specific data
        const { data: tenantDetails } = await supabase
          .from('tenants')
          .select('*, pgs(*), rooms(*), beds(*)')
          .eq('user_id', uid)
          .single();

        if (tenantDetails) {
          const tInfo: TenantInfo = {
            id: tenantDetails.id.toString(),
            name: userProfile.name,
            room: tenantDetails.rooms ? `Room ${tenantDetails.rooms.room_number}` : 'Not Assigned',
            pgName: tenantDetails.pgs ? tenantDetails.pgs.name : 'Not Assigned',
            bed: tenantDetails.beds ? tenantDetails.beds.bed_number : 'Not Assigned',
            joiningDate: tenantDetails.join_date 
              ? new Date(tenantDetails.join_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) 
              : 'Not Set',
            gateId: tenantDetails.rooms 
              ? `NH-${tenantDetails.rooms.room_number}-${userProfile.name.split(' ')[0].toUpperCase()}` 
              : 'Not Configured',
            email: email,
            phone: userProfile.phone || 'Not Configured',
            leaseEndDate: tenantDetails.lease_end_date 
              ? new Date(tenantDetails.lease_end_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) 
              : 'Not Configured',
            emergencyContact: tenantDetails.emergency_contact || 'Not Configured',
            cardLastFour: tenantDetails.card_last_four || '',
            deposit: tenantDetails.deposit 
              ? `$${parseFloat(tenantDetails.deposit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
              : 'Not Configured'
          };
          setTenant(tInfo);

          // Seed dynamic chats
          setChats([
            {
              id: "thread-1",
              title: "Roommates Chat",
              subtitle: `Active members in ${tenantDetails.rooms ? `Room ${tenantDetails.rooms.room_number}` : 'Room 302'}`,
              avatar: "",
              messages: [
                {
                  id: "msg-1",
                  senderName: "Kabir",
                  senderAvatar: "",
                  text: "Hey, who's cleaning the common area today?",
                  timestamp: "10:15 AM",
                  isSelf: false
                },
                {
                  id: "msg-2",
                  senderName: userProfile.name,
                  senderAvatar: "",
                  text: "I'll do it in the evening after work.",
                  timestamp: "10:20 AM",
                  isSelf: true
                }
              ]
            },
            {
              id: "thread-2",
              title: `${tenantDetails.pgs ? tenantDetails.pgs.name : 'NestHaven PG'} Helpdesk`,
              subtitle: "Property management and support staff",
              avatar: "",
              messages: [
                {
                  id: "msg-3",
                  senderName: "Manager (Rajesh)",
                  senderAvatar: "",
                  text: "Hi residents, wifi router in Wing B has been restarted. Please check if connectivity is restored.",
                  timestamp: "Yesterday",
                  isSelf: false
                }
              ]
            }
          ]);

          // Fetch Bills
          const { data: dbPayments } = await supabase
            .from('payments')
            .select('*')
            .eq('tenant_id', tenantDetails.id)
            .order('id', { ascending: false });

          if (dbPayments) {
            setBills(dbPayments.map((p: { id: number; month: string; amount: string | number; status: string; due_date: string }) => {
              const amt = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount);
              const formattedDueDate = p.due_date 
                ? new Date(p.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) 
                : 'Not Set';
              return {
                id: p.id.toString(),
                title: `${p.month} ${amt > 1000 ? 'Rent' : 'Electricity Bill'}`,
                amount: amt,
                dueDate: p.status === 'paid' ? 'Paid' : `Due by ${formattedDueDate}`,
                status: p.status === 'paid' ? 'Paid' : p.status === 'overdue' ? 'Overdue' : 'Unpaid',
                category: amt > 1000 ? 'Rent' : 'Utility'
              };
            }));
          }

          // Fetch Complaints
          const { data: dbComplaints } = await supabase
            .from('complaints')
            .select('*')
            .eq('tenant_id', tenantDetails.id)
            .order('id', { ascending: false });

          if (dbComplaints) {
            setRequests(dbComplaints.map((c: { id: number; title: string; description: string | null; status: string; created_at: string }) => ({
              id: c.id.toString(),
              category: c.title.toLowerCase().includes('water') || c.title.toLowerCase().includes('leak') || c.title.toLowerCase().includes('faucet') ? 'Plumbing' : 'Maintenance',
              title: c.title,
              description: c.description || '',
              priority: 'Medium',
              status: c.status === 'resolved' ? 'Resolved' : c.status === 'in-progress' ? 'In Progress' : 'Open',
              raisedDate: new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
            })));
          }
        }
      } else if (role === 'Owner') {
        // Fetch Owner specific data
        
        // 1. Fetch Tenants list
        const { data: dbTenants } = await supabase
          .from('tenants')
          .select('*, users(*), rooms(*), beds(*)');
        if (dbTenants) setAllTenants(dbTenants);

        // 2. Fetch Payments list
        const { data: dbPayments } = await supabase
          .from('payments')
          .select('*, tenants(*, users(*), rooms(*))')
          .order('id', { ascending: false });
        if (dbPayments) setAllPayments(dbPayments);

        // 3. Fetch Complaints list
        const { data: dbComplaints } = await supabase
          .from('complaints')
          .select('*, tenants(*, users(*), rooms(*))')
          .order('id', { ascending: false });
        if (dbComplaints) setAllComplaints(dbComplaints);

        // 4. Aggregate Meals
        const { data: dbUsersMeals } = await supabase
          .from('users')
          .select('meal_breakfast, meal_lunch, meal_dinner, meal_dietary')
          .eq('role', 'Tenant');

        if (dbUsersMeals) {
          let bCount = 0, lCount = 0, dCount = 0;
          const diet = { Veg: 0, 'Non-Veg': 0, Egg: 0 };
          dbUsersMeals.forEach(u => {
            if (u.meal_breakfast) bCount++;
            if (u.meal_lunch) lCount++;
            if (u.meal_dinner) dCount++;
            if (u.meal_dietary === 'Veg') diet.Veg++;
            else if (u.meal_dietary === 'Non-Veg') diet['Non-Veg']++;
            else if (u.meal_dietary === 'Egg') diet.Egg++;
          });
          setAllMeals({
            breakfastCount: bCount,
            lunchCount: lCount,
            dinnerCount: dCount,
            dietaryCounts: diet
          });
        }
      }
    } catch (err) {
      console.error('Error synchronizing data:', err);
    }
  }, []);

  // Monitor Supabase Auth state changes
  useEffect(() => {
    let sub: ReturnType<typeof supabase.channel> | null = null;

    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
        fetchData(session.user.id, session.user.email || '');

        // Setup real-time subscription for instant syncing
        sub = supabase
          .channel('schema-db-changes')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            fetchData(session.user.id, session.user.email || '');
          })
          .subscribe();
      } else {
        setIsLoggedIn(false);
        setUserId(null);
        setUserRole(null);
      }

      // Listen to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          fetchData(session.user.id, session.user.email || '');
        } else {
          setIsLoggedIn(false);
          setUserId(null);
          setUserRole(null);
          if (sub) {
            supabase.removeChannel(sub);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
        if (sub) {
          supabase.removeChannel(sub);
        }
      };
    };

    setupAuth();
  }, [fetchData]);

  // Sign-in
  const login = async (emailOrPhone: string, password?: string) => {
    console.log("AppContext login function called for:", emailOrPhone);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password: password || 'password123',
      });
      console.log("Supabase signInWithPassword result error:", error);
      return { error: error ? error.message : null };
    } catch (err) {
      console.log("Supabase signInWithPassword threw exception:", err);
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during login.';
      return { error: errorMsg };
    }
  };

  // Sign-out
  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(null);
    setUserRole(null);
  };

  // Register
  const register = async (name: string, email: string, phone: string, password?: string, role?: string) => {
    try {
      const selectedRole = role || 'Tenant';
      const { error } = await supabase.auth.signUp({
        email,
        password: password || 'password123',
        options: {
          data: {
            name,
            phone,
            role: selectedRole // triggers copy into public.users with the chosen role
          }
        }
      });
      return { error: error ? error.message : null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during registration.';
      return { error: errorMsg };
    }
  };

  // Pay Bill (Tenant side)
  const payBill = async (id: string) => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'Card'
        })
        .eq('id', parseInt(id));

      if (error) throw error;
      
      // Update local notifications immediately for feedback
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: "Payment Success",
          description: "Your payment was processed successfully.",
          timestamp: "Just now",
          read: false
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Error paying bill:', err);
    }
  };

  // Add Service Request (Tenant side)
  const addRequest = async (category: string, title: string, description: string, _priority: 'Low' | 'Medium' | 'High') => {
    if (!userId) return;
    try {
      console.log(`Adding service request category: ${category}, priority: ${_priority}`);
      // Find tenant ID
      const { data: tenantDetails } = await supabase
        .from('tenants')
        .select('id, pg_id')
        .eq('user_id', userId)
        .single();

      if (tenantDetails) {
        const { error } = await supabase
          .from('complaints')
          .insert({
            tenant_id: tenantDetails.id,
            pg_id: tenantDetails.pg_id,
            title: title,
            description: description,
            status: 'pending'
          });

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error raising service request:', err);
    }
  };

  // Add Guest Pass (Local state only, or can persist in session storage)
  const addGuestPass = (name: string, relation: string, phone: string, date: string, entryTime: string, exitTime: string) => {
    const newPass: GuestPass = {
      id: `pass-${Date.now()}`,
      visitorName: name,
      relationship: relation,
      phone,
      date,
      entryTime,
      exitTime,
      qrCodeToken: `PASS-${name.slice(0,3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setGuestPasses(prev => [newPass, ...prev]);
  };

  // Send Chat message (Local state only)
  const sendChatMessage = (threadId: string, text: string) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderName: tenant.name || 'User',
      senderAvatar: "",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };

    setChats(prev => prev.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          messages: [...thread.messages, newMsg]
        };
      }
      return thread;
    }));

    if (threadId === "thread-1") {
      setTimeout(() => {
        setChats(prev => prev.map(thread => {
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: [
                ...thread.messages,
                {
                  id: `msg-reply-${Date.now()}`,
                  senderName: "Kabir",
                  senderAvatar: "",
                  text: "Got it! Adding it now.",
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isSelf: false
                }
              ]
            };
          }
          return thread;
        }));
      }, 2000);
    }
  };

  // Mark Notifications Read
  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Update meals selections (Tenant)
  const updateMeals = async (breakfast: boolean, lunch: boolean, dinner: boolean) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({
          meal_breakfast: breakfast,
          meal_lunch: lunch,
          meal_dinner: dinner
        })
        .eq('id', userId);

      if (error) throw error;
      setMeals(prev => ({ ...prev, breakfast, lunch, dinner }));
    } catch (err) {
      console.error('Error updating meals preferences:', err);
    }
  };

  // Update dietary preference (Tenant)
  const updateDietary = async (dietary: 'Veg' | 'Non-Veg' | 'Egg') => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({
          meal_dietary: dietary
        })
        .eq('id', userId);

      if (error) throw error;
      setMeals(prev => ({ ...prev, dietary }));
    } catch (err) {
      console.error('Error updating dietary preferences:', err);
    }
  };

  // Owner Action: Update Complaint status
  const updateComplaintStatus = async (id: string, status: 'pending' | 'in-progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', parseInt(id));

      if (error) throw error;
    } catch (err) {
      console.error('Error updating complaint status:', err);
    }
  };

  // Owner Action: Add Notice
  const addNotice = async (title: string, message: string) => {
    try {
      const { error } = await supabase
        .from('notices')
        .insert({
          pg_id: 1, // Seeded NestHaven PG
          title,
          message
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error adding notice:', err);
    }
  };

  // Owner Action: Mark payment as paid
  const markPaymentAsPaid = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'Cash/Offline'
        })
        .eq('id', parseInt(id));

      if (error) throw error;
    } catch (err) {
      console.error('Error marking payment as paid:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      tenant,
      bills,
      requests,
      guestPasses,
      chats,
      notices,
      notifications,
      menuList,
      payBill,
      addRequest,
      addGuestPass,
      sendChatMessage,
      markNotificationsAsRead,
      meals,
      updateMeals,
      updateDietary,
      isLoggedIn,
      userRole,
      login,
      logout,
      register,
      
      // Owner states and actions
      allTenants,
      allComplaints,
      allPayments,
      allMeals,
      updateComplaintStatus,
      addNotice,
      markPaymentAsPaid
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

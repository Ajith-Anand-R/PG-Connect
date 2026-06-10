"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  pgUpiId?: string;
  pgUpiNumber?: string;
  pgUpiName?: string;
  pgUpiRegisteredName?: string;
  noticeDate?: string;
  vacateDate?: string;
  refundEligible?: boolean;
  status?: string;
  photo?: string;
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
  checkInTime?: string | null;
  checkOutTime?: string | null;
  approvalStatus?: string | null;
  visitorType?: string | null;
  photoUrl?: string | null;
  vehicleNumber?: string | null;
  purpose?: string | null;
  deliveryCompany?: string | null;
}

export interface Parcel {
  id: string;
  pgId: string;
  tenantId: string;
  deliveryCompany: string;
  parcelPhotoUrl: string | null;
  status: 'at_gate' | 'collected' | 'returned';
  verificationOtp: string;
  receivedAt: string;
  collectedAt: string | null;
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

export interface CommunityComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface CommunityFeedPost {
  id: string;
  author: string;
  room: string;
  avatar: string;
  time: string;
  category: 'Marketplace' | 'Discussion';
  type: 'Selling' | 'Discussion';
  title: string;
  content: string;
  image?: string;
  likes: number;
  comments: CommunityComment[];
  likedByMe?: boolean;
}

interface AppContextType {
  tenant: TenantInfo;
  bills: Bill[];
  requests: ServiceRequest[];
  guestPasses: GuestPass[];
  parcels: Parcel[];
  staffLogs: any[];
  incomingRequest: any | null;
  setIncomingRequest: (req: any | null) => void;
  updateVisitorApproval: (logId: string, status: 'approved' | 'rejected' | 'leave_at_gate') => Promise<void>;
  chats: ChatThread[];
  notices: Notice[];
  notifications: AppNotification[];
  menuList: Menu[];
  payBill: (id: string, paymentMethod?: string) => void;
  addRequest: (category: string, title: string, description: string, priority: 'Low' | 'Medium' | 'High') => void;
  addGuestPass: (name: string, relation: string, phone: string, date: string, entryTime: string, exitTime: string) => Promise<void> | void;
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
  updateProfile: (email: string, phone: string, emergencyContact: string) => Promise<{ error: string | null }>;
  submitNotice: (vacateDate: string) => Promise<{ error: string | null }>;
  cancelNotice: () => Promise<{ error: string | null }>;
  isLoggedIn: boolean;
  userRole: 'Tenant' | null;
  login: (emailOrPhone: string, password?: string) => Promise<{ error: string | null }>;
  logout: () => void;
  register: (name: string, email: string, phone: string, password?: string, role?: string, pgId?: string, additionalDetails?: Record<string, unknown>) => Promise<{ error: string | null }>;
  communityFeed: CommunityFeedPost[];
  addCommunityPost: (title: string, content: string, category: 'Marketplace' | 'Discussion', imageUrl?: string) => Promise<void>;
  likeCommunityPost: (postId: string) => Promise<void>;
  addCommunityComment: (postId: string, text: string) => Promise<void>;
  authLoading: boolean;
  activateStay: () => Promise<{ error: string | null }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("AppProvider render called, window:", typeof window !== 'undefined');
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<'Tenant' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pgId, setPgId] = useState<number | null>(null);
  const [communityFeed, setCommunityFeed] = useState<CommunityFeedPost[]>([]);


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
    phone: "",
    pgUpiId: "",
    pgUpiNumber: "",
    pgUpiName: "",
    pgUpiRegisteredName: ""
  });

  // Data States
  const [bills, setBills] = useState<Bill[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [guestPasses, setGuestPasses] = useState<GuestPass[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [staffLogs, setStaffLogs] = useState<any[]>([]);
  const [incomingRequest, setIncomingRequest] = useState<any | null>(null);
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

      const role = userProfile.role;
      if (role !== 'Tenant') {
        console.warn('Access denied: Owner role not allowed in PG Connect.');
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setUserId(null);
        setUserRole(null);
        return;
      }
      setUserRole('Tenant');


      if (userProfile.pg_id) {
        setPgId(Number(userProfile.pg_id));
      }

      // Set Meals state
      setMeals({
        breakfast: userProfile.meal_breakfast ?? true,
        lunch: userProfile.meal_lunch ?? false,
        dinner: userProfile.meal_dinner ?? true,
        dietary: (userProfile.meal_dietary as 'Veg' | 'Non-Veg' | 'Egg') ?? 'Veg'
      });

      // 2. Fetch notices (filtered by pg_id)
      const { data: dbNotices } = await supabase
        .from('notices')
        .select('*')
        .eq('pg_id', userProfile.pg_id)
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

      // 3. Fetch menus (filtered by pg_id and current week's dates)
      const getCurrentWeekDates = () => {
        const current = new Date();
        const week = [];
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(current.setDate(diff));
        for (let i = 0; i < 7; i++) {
          const nextDay = new Date(monday);
          nextDay.setDate(monday.getDate() + i);
          week.push(nextDay.toISOString().split('T')[0]);
        }
        return week;
      };

      const dates = getCurrentWeekDates();
      const { data: dbMenuDays } = await supabase
        .from('menu_days')
        .select('*, menu_items(*)')
        .eq('pg_id', userProfile.pg_id)
        .in('date', dates);

      const menuMap: Record<string, Menu> = {};
      DAYS_OF_WEEK.forEach((day: string) => {
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

      if (dbMenuDays) {
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
      }
      setMenuList(Object.values(menuMap));

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
              ? `₹${parseFloat(tenantDetails.deposit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
              : 'Not Configured',
            pgUpiId: tenantDetails.pgs?.upi_id || '',
            pgUpiNumber: tenantDetails.pgs?.upi_number || '',
            pgUpiName: tenantDetails.pgs?.upi_name || '',
            pgUpiRegisteredName: tenantDetails.pgs?.upi_registered_name || '',
            noticeDate: tenantDetails.notice_date || undefined,
            vacateDate: tenantDetails.vacate_date || undefined,
            refundEligible: tenantDetails.refund_eligible ?? false,
            status: tenantDetails.status || 'active',
            photo: userProfile.photo || ''
          };
          setTenant(tInfo);

          // Fetch Guest Passes from visitor_logs database table
          const { data: dbVisitors } = await supabase
            .from('visitor_logs')
            .select('*')
            .eq('tenant_id', tenantDetails.id)
            .order('id', { ascending: false });

          if (dbVisitors) {
            setGuestPasses(dbVisitors.map((v: any) => ({
              id: v.id.toString(),
              visitorName: v.visitor_name,
              relationship: v.relationship,
              phone: v.phone,
              date: v.date,
              entryTime: v.entry_time,
              exitTime: v.exit_time,
              qrCodeToken: v.qr_code_token,
              checkInTime: v.check_in_time,
              checkOutTime: v.check_out_time,
              approvalStatus: v.approval_status,
              visitorType: v.visitor_type,
              photoUrl: v.photo_url,
              vehicleNumber: v.vehicle_number,
              purpose: v.purpose,
              deliveryCompany: v.delivery_company
            })));
            
            const pendingLog = dbVisitors.find((v: any) => v.approval_status === 'pending');
            if (pendingLog) {
              setIncomingRequest(pendingLog);
            } else {
              setIncomingRequest(null);
            }
          } else {
            setIncomingRequest(null);
          }

          // Fetch Parcels from parcels database table
          const { data: dbParcels } = await supabase
            .from('parcels')
            .select('*')
            .eq('tenant_id', tenantDetails.id)
            .order('id', { ascending: false });

          if (dbParcels) {
            setParcels(dbParcels.map((p: any) => ({
              id: p.id.toString(),
              pgId: p.pg_id.toString(),
              tenantId: p.tenant_id.toString(),
              deliveryCompany: p.delivery_company,
              parcelPhotoUrl: p.parcel_photo_url,
              status: p.status as 'at_gate' | 'collected' | 'returned',
              verificationOtp: p.verification_otp,
              receivedAt: p.received_at,
              collectedAt: p.collected_at
            })));
          }

          // Fetch property-wide daily help logs
          const { data: dbStaffLogs } = await supabase
            .from('visitor_logs')
            .select('*')
            .eq('pg_id', userProfile.pg_id)
            .eq('visitor_type', 'daily_help')
            .order('id', { ascending: false });

          if (dbStaffLogs) {
            setStaffLogs(dbStaffLogs);
          }

          // Seed dynamic chats from database
          const fetchChatMessages = async (pgIdVal: number, tenantNameVal: string, tenantRoomVal: string) => {
            const { data: dbMsgs } = await supabase
              .from('messages')
              .select('*')
              .eq('pg_id', pgIdVal)
              .order('created_at', { ascending: true });

            const defaultThreads: ChatThread[] = [
              {
                id: 'property-group',
                title: `${tenantDetails.pgs?.name || 'NestHaven'} Wing B Chat`,
                subtitle: 'Group discussion with all residents',
                avatar: '',
                messages: []
              },
              {
                id: 'room-group',
                title: `${tenantRoomVal} Room Chat`,
                subtitle: 'Roommates only',
                avatar: '',
                messages: []
              },
              {
                id: 'owner-dm',
                title: 'Kabir (Property Owner)',
                subtitle: 'Direct support & landlord DM',
                avatar: '',
                messages: []
              }
            ];

            if (dbMsgs) {
              dbMsgs.forEach((m: { id: number | string; sender_name: string; text: string; created_at: string; sender_id: string; thread_id: string }) => {
                const msgObj: Message = {
                  id: m.id.toString(),
                  senderName: m.sender_name,
                  senderAvatar: '',
                  text: m.text,
                  timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isSelf: m.sender_id === uid
                };

                const thread = defaultThreads.find(t => t.id === m.thread_id);
                if (thread) {
                  thread.messages.push(msgObj);
                }
              });
            }
            setChats(defaultThreads);
          };

          await fetchChatMessages(tenantDetails.pg_id, userProfile.name, tInfo.room);

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
                title: p.month === 'Security Deposit' ? 'Security Deposit' : `${p.month} ${amt > 1000 ? 'Rent' : 'Electricity Bill'}`,
                amount: amt,
                dueDate: p.status === 'paid' ? 'Paid' : `Due by ${formattedDueDate}`,
                status: p.status === 'paid' ? 'Paid' : p.status === 'overdue' ? 'Overdue' : 'Unpaid',
                category: p.month === 'Security Deposit' ? 'Deposit' : (amt > 1000 ? 'Rent' : 'Utility')
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

          // 6. Fetch Community Posts
          const { data: dbPosts } = await supabase
            .from('community_posts')
            .select(`
              id,
              created_at,
              title,
              content,
              category,
              type,
              image_url,
              user_id,
              users (
                name,
                photo
              )
            `)
            .eq('pg_id', userProfile.pg_id)
            .order('created_at', { ascending: false });

          const { data: dbComments } = await supabase
            .from('community_comments')
            .select(`
              id,
              created_at,
              post_id,
              text,
              users (
                name,
                photo
              )
            `);

          const { data: dbLikes } = await supabase
            .from('community_likes')
            .select('*');

          // Fetch rooms & tenants mappings for post authors
          const { data: dbTenantsRoom } = await supabase
            .from('tenants')
            .select('user_id, rooms(room_number)');

          const tenantRoomMap: Record<string, string> = {};
          if (dbTenantsRoom) {
            dbTenantsRoom.forEach(t => {
              if (t.user_id && t.rooms) {
                const roomData = t.rooms as unknown as { room_number: string | number }[] | { room_number: string | number } | null;
                const roomNumber = Array.isArray(roomData) ? roomData[0]?.room_number : roomData?.room_number;
                tenantRoomMap[t.user_id] = roomNumber ? `Room ${roomNumber}` : 'Room N/A';
              }
            });
          }

            const postsMapped = dbPosts ? dbPosts.map((p: {
              id: number | string;
              created_at: string;
              title: string;
              content: string;
              category: string;
              type: string;
              image_url: string | null;
              user_id: string;
              users: { name: string; photo: string | null }[] | { name: string; photo: string | null } | null;
            }) => {
              const authorUser = Array.isArray(p.users) ? p.users[0] : p.users;
              const authorName = authorUser ? authorUser.name : 'Unknown';
              const authorRoom = p.user_id ? (tenantRoomMap[p.user_id] || 'Room N/A') : 'Room N/A';
              const authorAvatar = authorUser ? (authorUser.photo || '') : '';
              
              const postLikes = dbLikes ? dbLikes.filter(l => l.post_id === p.id) : [];
              const likesCount = postLikes.length;
              const likedByMe = dbLikes ? dbLikes.some(l => l.post_id === p.id && l.user_id === uid) : false;

              const postComments = dbComments 
                ? dbComments
                    .filter(c => c.post_id === p.id)
                    .map((c: {
                    id: number | string;
                    created_at: string;
                    post_id: number;
                    text: string;
                    users: { name: string; photo: string | null }[] | { name: string; photo: string | null } | null;
                  }) => {
                    const commentUser = Array.isArray(c.users) ? c.users[0] : c.users;
                    return {
                      id: c.id.toString(),
                      author: commentUser ? commentUser.name : 'Unknown',
                      avatar: commentUser ? (commentUser.photo || '') : '',
                      text: c.text,
                      time: new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                    };
                  })
                : [];

              return {
                id: p.id.toString(),
                author: authorName,
                room: authorRoom,
                avatar: authorAvatar,
                time: new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                category: p.category as 'Marketplace' | 'Discussion',
                type: p.type as 'Selling' | 'Discussion',
                title: p.title,
                content: p.content,
                image: p.image_url || undefined,
                likes: likesCount,
                comments: postComments,
                likedByMe: likedByMe
              };
            }) : [];
            setCommunityFeed(postsMapped);
          }
        }
    } catch (err) {
      console.error('Error synchronizing data:', err);
    }
  }, []);

  // Monitor Supabase Auth state changes
  useEffect(() => {
    let sub: ReturnType<typeof supabase.channel> | null = null;
    let msgSub: ReturnType<typeof supabase.channel> | null = null;
    let subscription: { unsubscribe: () => void } | null = null;

    const setupAuth = async () => {
      let isInitial = true;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Supabase session recovery warning:", error.message);
        }

        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          await fetchData(session.user.id, session.user.email || '');

          // Setup real-time subscription for instant syncing
          sub = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public' }, async (payload) => {
              if (payload.table === 'messages') return;

              // Check if unexpected visitor is pending approval
              if (payload.table === 'visitor_logs' && (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')) {
                const newLog = payload.new;
                if (newLog && newLog.approval_status === 'pending') {
                  // Verify this tenant is the host
                  const { data: tenantDetails } = await supabase
                    .from('tenants')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .single();
                  if (tenantDetails && Number(newLog.tenant_id) === Number(tenantDetails.id)) {
                    setIncomingRequest(newLog);
                  }
                }
              }

              fetchData(session.user.id, session.user.email || '');
            })
            .subscribe();

          // Setup real-time subscription for messages only
          msgSub = supabase
            .channel('realtime-messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
              const newMsg = payload.new;
              setChats(prev => prev.map(thread => {
                if (thread.id === newMsg.thread_id) {
                  if (thread.messages.some(m => m.id === newMsg.id.toString())) {
                    return thread;
                  }
                  return {
                    ...thread,
                    messages: [
                      ...thread.messages,
                      {
                        id: newMsg.id.toString(),
                        senderName: newMsg.sender_name,
                        senderAvatar: '',
                        text: newMsg.text,
                        timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isSelf: newMsg.sender_id === session.user.id
                      }
                    ]
                  };
                }
                return thread;
              }));
            })
            .subscribe();
        } else {
          setIsLoggedIn(false);
          setUserId(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Error setting up auth session:", err);
      } finally {
        setAuthLoading(false);
      }

      // Listen to auth changes
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Supabase Auth State Event:", event);
        if (isInitial) {
          return;
        }
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          await fetchData(session.user.id, session.user.email || '');
          setAuthLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserId(null);
          setUserRole(null);
          setAuthLoading(false);
          if (sub) {
            supabase.removeChannel(sub);
          }
          if (msgSub) {
            supabase.removeChannel(msgSub);
          }
        }
      });
      subscription = data.subscription;
      isInitial = false;
    };

    setupAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (sub) {
        supabase.removeChannel(sub);
      }
      if (msgSub) {
        supabase.removeChannel(msgSub);
      }
    };
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
  const register = async (
    name: string, 
    email: string, 
    phone: string, 
    password?: string, 
    _role?: string, 
    pgIdOrToken?: string,
    additionalDetails?: Record<string, unknown>
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: password || 'password123',
        options: {
          data: {
            name,
            phone,
            role: 'Tenant',
            invite_token: pgIdOrToken,
            ...additionalDetails
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
  const payBill = async (id: string, paymentMethod: string = 'Card') => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod
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

  // Add Guest Pass (Database backed)
  const addGuestPass = async (name: string, relation: string, phone: string, date: string, entryTime: string, exitTime: string) => {
    if (!userId) return;
    try {
      const { data: tenantDetails } = await supabase
        .from('tenants')
        .select('id, pg_id')
        .eq('user_id', userId)
        .single();

      if (tenantDetails) {
        const qrCodeToken = `PASS-${name.slice(0,3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const { error } = await supabase
          .from('visitor_logs')
          .insert({
            pg_id: tenantDetails.pg_id,
            tenant_id: tenantDetails.id,
            visitor_name: name,
            relationship: relation,
            phone,
            date,
            entry_time: entryTime,
            exit_time: exitTime,
            status: 'approved',
            qr_code_token: qrCodeToken
          });

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error adding guest pass:', err);
    }
  };

  // Send Chat message (Database backed)
  const sendChatMessage = async (threadId: string, text: string) => {
    if (!userId || !pgId) return;
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_name: tenant.name || 'Tenant',
          sender_id: userId,
          text,
          pg_id: pgId,
          thread_id: threadId
        });

      if (error) throw error;
      
      const newMsg: Message = {
        id: `msg-local-${Date.now()}`,
        senderName: tenant.name || 'Tenant',
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
    } catch (err) {
      console.error('Error sending message:', err);
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

  const updateProfile = async (email: string, phone: string, emergencyContact: string) => {
    if (!userId || !tenant.id) return { error: "Not logged in" };
    try {
      // 1. Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({ email, phone })
        .eq('id', userId);

      if (userError) throw userError;

      // 2. Update tenants table
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({ emergency_contact: emergencyContact })
        .eq('id', parseInt(tenant.id));

      if (tenantError) throw tenantError;

      // 3. Update local state
      setTenant(prev => ({
        ...prev,
        email,
        phone,
        emergencyContact
      }));

      return { error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred.';
      return { error: msg };
    }
  };

  const submitNotice = async (vacateDate: string) => {
    if (!userId || !tenant.id) return { error: "Not logged in" };
    try {
      const noticeDateStr = new Date().toISOString().split('T')[0];
      const targetVacateDate = new Date(vacateDate);
      const today = new Date();
      const diffTime = Math.abs(targetVacateDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const eligible = diffDays >= 30;

      const { error } = await supabase
        .from('tenants')
        .update({
          status: 'notice',
          notice_date: noticeDateStr,
          vacate_date: vacateDate,
          refund_eligible: eligible
        })
        .eq('id', parseInt(tenant.id));

      if (error) throw error;

      setTenant(prev => ({
        ...prev,
        status: 'notice',
        noticeDate: noticeDateStr,
        vacateDate: vacateDate,
        refundEligible: eligible
      }));

      await fetchData(userId, tenant.email);
      return { error: null };
    } catch (err) {
      console.error('Error submitting notice:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred.';
      return { error: msg };
    }
  };

  const cancelNotice = async () => {
    if (!userId || !tenant.id) return { error: "Not logged in" };
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          status: 'active',
          notice_date: null,
          vacate_date: null,
          refund_eligible: false
        })
        .eq('id', parseInt(tenant.id));

      if (error) throw error;

      setTenant(prev => ({
        ...prev,
        status: 'active',
        noticeDate: undefined,
        vacateDate: undefined,
        refundEligible: false
      }));

      await fetchData(userId, tenant.email);
      return { error: null };
    } catch (err) {
      console.error('Error cancelling notice:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred.';
      return { error: msg };
    }
  };

  const activateStay = async () => {
    if (!userId || !tenant.id) return { error: "No user or tenant session found" };
    try {
      const { data: tenantData, error: tErr } = await supabase
        .from('tenants')
        .select('bed_id')
        .eq('id', parseInt(tenant.id))
        .single();
      
      if (tErr || !tenantData) throw new Error(tErr?.message || "Tenant record not found");

      const { error: tenantUpdateErr } = await supabase
        .from('tenants')
        .update({ status: 'active' })
        .eq('id', parseInt(tenant.id));

      if (tenantUpdateErr) throw tenantUpdateErr;

      if (tenantData.bed_id) {
        const { error: bedUpdateErr } = await supabase
          .from('beds')
          .update({ status: 'occupied' })
          .eq('id', tenantData.bed_id);

        if (bedUpdateErr) throw bedUpdateErr;
      }

      await fetchData(userId, tenant.email);
      return { error: null };
    } catch (err) {
      console.error('Error activating stay:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred during activation.';
      return { error: msg };
    }
  };

  const addCommunityPost = async (title: string, content: string, category: 'Marketplace' | 'Discussion', imageUrl?: string) => {
    if (!userId || !pgId) return;
    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: userId,
          pg_id: pgId,
          title,
          content,
          category,
          type: category === 'Marketplace' ? 'Selling' : 'Discussion',
          image_url: imageUrl || null
        });
      if (error) throw error;
      await fetchData(userId, tenant.email);
    } catch (err) {
      console.error('Error adding community post:', err);
    }
  };

  const likeCommunityPost = async (postId: string) => {
    if (!userId) return;
    const numericPostId = parseInt(postId);
    try {
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('*')
        .eq('post_id', numericPostId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingLike) {
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('id', existingLike.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_likes')
          .insert({
            post_id: numericPostId,
            user_id: userId
          });
        if (error) throw error;
      }
      await fetchData(userId, tenant.email);
    } catch (err) {
      console.error('Error liking community post:', err);
    }
  };

  const addCommunityComment = async (postId: string, text: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('community_comments')
        .insert({
          post_id: parseInt(postId),
          user_id: userId,
          text
        });
      if (error) throw error;
      await fetchData(userId, tenant.email);
    } catch (err) {
      console.error('Error adding community comment:', err);
    }
  };

  const updateVisitorApproval = async (logId: string, status: 'approved' | 'rejected' | 'leave_at_gate') => {
    try {
      const { error } = await supabase
        .from('visitor_logs')
        .update({ approval_status: status })
        .eq('id', parseInt(logId));

      if (error) throw error;
      setIncomingRequest((prev: any) => prev && prev.id.toString() === logId ? null : prev);
      if (userId) {
        await fetchData(userId, tenant.email);
      }
    } catch (err) {
      console.error('Error updating visitor approval:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      tenant,
      bills,
      requests,
      guestPasses,
      parcels,
      staffLogs,
      incomingRequest,
      setIncomingRequest,
      updateVisitorApproval,
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
      updateProfile,
      submitNotice,
      cancelNotice,
      isLoggedIn,
      userRole,
      login,
      logout,
      register,
      communityFeed,
      addCommunityPost,
      likeCommunityPost,
      addCommunityComment,
      authLoading,
      activateStay
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

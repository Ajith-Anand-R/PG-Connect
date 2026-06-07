"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface TenantInfo {
  name: string;
  room: string;
  pgName: string;
  bed: string;
  joiningDate: string;
  gateId: string;
  email: string;
  phone: string;
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

interface AppContextType {
  tenant: TenantInfo;
  bills: Bill[];
  requests: ServiceRequest[];
  guestPasses: GuestPass[];
  chats: ChatThread[];
  notices: Notice[];
  notifications: AppNotification[];
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
  login: (emailOrPhone: string) => void;
  logout: () => void;
  register: (name: string, email: string, phone: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 1. Tenant Info
  const [tenant, setTenant] = useState<TenantInfo>({
    name: "Alex Mercer",
    room: "Room 302",
    pgName: "NestHaven PG",
    bed: "Bed A",
    joiningDate: "Dec 15, 2025",
    gateId: "NH-302A-ALEX",
    email: "alex.mercer@gmail.com",
    phone: "+1 (312) 847-1928"
  });

  // check if user was logged in previously on client side
  useEffect(() => {
    const checkAuth = () => {
      const stored = localStorage.getItem('pg_connect_logged_in');
      if (stored === 'true') {
        setIsLoggedIn(true);
      }
      const storedTenant = localStorage.getItem('pg_connect_tenant');
      if (storedTenant) {
        try {
          setTenant(JSON.parse(storedTenant));
        } catch {}
      }
    };
    setTimeout(checkAuth, 0);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = (emailOrPhone: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('pg_connect_logged_in', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('pg_connect_logged_in');
  };

  const register = (name: string, email: string, phone: string) => {
    const updatedTenant = {
      name,
      room: "Room 302",
      pgName: "NestHaven PG",
      bed: "Bed A",
      joiningDate: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      gateId: `NH-302A-${name.split(' ')[0].toUpperCase()}`,
      email,
      phone
    };
    setTenant(updatedTenant);
    localStorage.setItem('pg_connect_tenant', JSON.stringify(updatedTenant));
    setIsLoggedIn(true);
    localStorage.setItem('pg_connect_logged_in', 'true');
  };

  // 2. Bills State
  const [bills, setBills] = useState<Bill[]>([
    { id: "bill-1", title: "Electricity Bill - Nov", amount: 45.50, dueDate: "In 3 days", status: "Unpaid", category: "Utility" },
    { id: "bill-2", title: "Monthly Rent - Nov", amount: 1250.00, dueDate: "Paid", status: "Paid", category: "Rent" },
    { id: "bill-3", title: "Water Bill - Oct", amount: 15.00, dueDate: "Paid", status: "Paid", category: "Utility" },
    { id: "bill-4", title: "Monthly Rent - Oct", amount: 1250.00, dueDate: "Paid", status: "Paid", category: "Rent" }
  ]);

  // 3. Service Requests State
  const [requests, setRequests] = useState<ServiceRequest[]>([
    { id: "req-1", category: "Plumbing", title: "Leaking Faucet in Bathroom", description: "The hot water tap in the bathroom sink is dripping constantly, wasting water and making noise.", priority: "Medium", status: "In Progress", raisedDate: "Yesterday" },
    { id: "req-2", category: "Wi-Fi", title: "Wi-Fi connection dropouts", description: "The connection drops every 10 minutes from Room 302.", priority: "High", status: "Resolved", raisedDate: "2 weeks ago" }
  ]);

  // 4. Guest Passes State
  const [guestPasses, setGuestPasses] = useState<GuestPass[]>([
    { id: "pass-1", visitorName: "Siddharth Mercer", relationship: "Brother", phone: "+1 (312) 555-8912", date: "2026-06-08", entryTime: "14:00", exitTime: "20:00", qrCodeToken: "PASS-SID-991823" }
  ]);

  // 5. Chats State
  const [chats, setChats] = useState<ChatThread[]>([
    {
      id: "thread-1",
      title: "Room 302 Chat",
      subtitle: "Kabir, Alex",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      messages: [
        { id: "m1", senderName: "Kabir", senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", text: "Hey, are we ordering groceries today?", timestamp: "10:30 AM", isSelf: false },
        { id: "m2", senderName: "Alex", senderAvatar: "", text: "Yes, I'm adding milk and apples to the list.", timestamp: "10:32 AM", isSelf: true },
        { id: "m3", senderName: "Kabir", senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", text: "Awesome, I'll add bread.", timestamp: "10:33 AM", isSelf: false }
      ]
    },
    {
      id: "thread-2",
      title: "Wing B Community",
      subtitle: "General discussion",
      avatar: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=100&q=80",
      messages: [
        { id: "gm1", senderName: "Rohan", senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", text: "Has anyone seen my red water bottle in the common room?", timestamp: "Yesterday", isSelf: false },
        { id: "gm2", senderName: "Elena", senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", text: "I think I saw it on the middle shelf in the fridge.", timestamp: "Yesterday", isSelf: false }
      ]
    }
  ]);

  // 6. Notices State
  const [notices] = useState<Notice[]>([
    { id: "notice-1", title: "Wi-Fi Upgrade Session", content: "High-speed fiber route migration scheduled for Wednesday 2:00 AM - 4:00 AM. Expect brief downtime.", date: "Today", category: "Maintenance" },
    { id: "notice-2", title: "Lobby Painting Scheduled", content: "The entrance lobby is being repainted this week. Please use the secondary gate for entering and exiting.", date: "Yesterday", category: "Notice" },
    { id: "notice-3", title: "Weekend Rooftop BBQ Meet", content: "Join us on Saturday at 7:00 PM for roommate networking, food, and music on the terrace roof.", date: "3 days ago", category: "Event" }
  ]);

  // 7. Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: "notif-1", title: "Rent Receipt Ready", description: "Rent receipt for November is ready to download.", timestamp: "2 hours ago", read: false },
    { id: "notif-2", title: "Electricity Bill Generated", description: "Electricity bill of $45.50 generated for Room 302.", timestamp: "Yesterday", read: false }
  ]);

  // 8. Meals State
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

  // Action: Pay Bill
  const payBill = (id: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === id ? { ...bill, status: 'Paid', dueDate: 'Paid' } : bill
    ));
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
  };

  // Action: Add Service Request
  const addRequest = (category: string, title: string, description: string, priority: 'Low' | 'Medium' | 'High') => {
    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      category,
      title,
      description,
      priority,
      status: 'Open',
      raisedDate: "Just now"
    };
    setRequests(prev => [newReq, ...prev]);
  };

  // Action: Add Guest Pass
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

  // Action: Send Message
  const sendChatMessage = (threadId: string, text: string) => {
    setChats(prev => prev.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          messages: [
            ...thread.messages,
            {
              id: `msg-${Date.now()}`,
              senderName: "Alex",
              senderAvatar: "",
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSelf: true
            }
          ]
        };
      }
      return thread;
    }));

    // Simulate roommate auto-response after 2 seconds
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
                  senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
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

  // Action: Mark Notifications Read
  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Action: Toggle Meals
  const updateMeals = (breakfast: boolean, lunch: boolean, dinner: boolean) => {
    setMeals(prev => ({ ...prev, breakfast, lunch, dinner }));
  };

  // Action: Update Dietary preference
  const updateDietary = (dietary: 'Veg' | 'Non-Veg' | 'Egg') => {
    setMeals(prev => ({ ...prev, dietary }));
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
      payBill,
      addRequest,
      addGuestPass,
      sendChatMessage,
      markNotificationsAsRead,
      meals,
      updateMeals,
      updateDietary,
      isLoggedIn,
      login,
      logout,
      register
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

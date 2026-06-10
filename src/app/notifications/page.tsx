"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Wrench, 
  CreditCard, 
  Volume2,
  Droplet,
  Package,
  Check,
  BellRing,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 320, damping: 25 } 
  }
};

export default function NotificationsPage() {
  const { notifications, markNotificationsAsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAllRead = () => {
    markNotificationsAsRead();
  };

  const getNotificationConfig = (title: string) => {
    const lowercaseTitle = title.toLowerCase();
    
    if (lowercaseTitle.includes('technician') || lowercaseTitle.includes('request') || lowercaseTitle.includes('repair') || lowercaseTitle.includes('maintenance')) {
      return {
        icon: <Wrench className="size-5" />,
        gradient: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        shadow: "shadow-blue-500/5",
        category: "Maintenance"
      };
    }
    if (lowercaseTitle.includes('rent') || lowercaseTitle.includes('bill') || lowercaseTitle.includes('payment') || lowercaseTitle.includes('due')) {
      return {
        icon: <CreditCard className="size-5" />,
        gradient: "from-emerald-500 to-teal-600",
        bgLight: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        shadow: "shadow-emerald-500/5",
        category: "Payment"
      };
    }
    if (lowercaseTitle.includes('water') || lowercaseTitle.includes('electricity') || lowercaseTitle.includes('outage')) {
      return {
        icon: <Droplet className="size-5" />,
        gradient: "from-sky-400 to-blue-500",
        bgLight: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        shadow: "shadow-sky-500/5",
        category: "Utility"
      };
    }
    if (lowercaseTitle.includes('package') || lowercaseTitle.includes('amazon') || lowercaseTitle.includes('delivery')) {
      return {
        icon: <Package className="size-5" />,
        gradient: "from-violet-500 to-purple-600",
        bgLight: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
        shadow: "shadow-violet-500/5",
        category: "Delivery"
      };
    }
    if (lowercaseTitle.includes('security') || lowercaseTitle.includes('emergency') || lowercaseTitle.includes('urgent')) {
      return {
        icon: <AlertTriangle className="size-5" />,
        gradient: "from-rose-500 to-red-600",
        bgLight: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        shadow: "shadow-rose-500/5",
        category: "Security"
      };
    }
    return {
      icon: <Volume2 className="size-5" />,
      gradient: "from-pink-500 to-rose-500",
      bgLight: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
      shadow: "shadow-pink-500/5",
      category: "Announcement"
    };
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const allList = notifications;
  
  const filteredNotifications = allList.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">
              <Bell className="size-6" />
            </div>
            Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            View security alerts, community announcements, and maintenance request updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllRead}
              className="border-primary/20 hover:border-primary/40 text-primary bg-primary/[0.02] hover:bg-primary/[0.06] font-bold text-xs h-9 flex items-center gap-1.5 rounded-xl transition-all"
            >
              <Check className="size-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </motion.div>

      {/* Tabs Filter Bar */}
      <motion.div variants={itemVariants} className="flex justify-between items-center gap-2">
        <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 w-max">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              filter === 'all' 
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            All Notifications
            <Badge className="bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-300 font-extrabold border-transparent py-0 px-1.5 text-[10px]">
              {allList.length}
            </Badge>
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              filter === 'unread' 
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground font-extrabold border-transparent py-0 px-1.5 text-[10px] animate-pulse">
                {unreadCount}
              </Badge>
            )}
          </button>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-gradient-primary">
            <Sparkles className="size-3.5 text-accent shrink-0" />
            <span>{unreadCount} unread updates today</span>
          </div>
        )}
      </motion.div>

      {filteredNotifications.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-dashed border-slate-250 dark:border-slate-800/60 bg-transparent py-14 rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary glow-primary">
                <BellRing className="size-7" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">All Caught Up</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] leading-relaxed">
                  No new notifications match your filter. We&apos;ll alert you when something updates!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          layout 
          className="flex flex-col gap-3.5"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notif) => {
              const config = getNotificationConfig(notif.title);
              return (
                <motion.div
                  key={notif.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card glass-card-hover group relative overflow-hidden rounded-3xl border-transparent ${
                    !notif.read ? 'bg-primary/[0.02] border-l-2 border-l-primary glow-primary' : 'opacity-85'
                  }`}
                >
                  <CardContent className="p-4 flex gap-4 items-start relative z-10">
                    {/* Unread marker dot */}
                    {!notif.read && (
                      <span className="absolute right-4 top-4 w-2 h-2 bg-primary rounded-full animate-ping" />
                    )}

                    {/* Left Icon with Premium Gradient */}
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${config.gradient} text-white flex items-center justify-center shrink-0 shadow-md ${config.shadow} transition-transform group-hover:scale-105`}>
                      {config.icon}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {notif.title}
                          </h4>
                          <Badge className={`${config.bgLight} border border-transparent font-bold text-[9px] py-0 px-2 rounded-md`}>
                            {config.category}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[95%]">
                        {notif.description}
                      </p>
                    </div>
                  </CardContent>

                  {/* Decorative background ambient glow */}
                  <div className={`absolute -left-10 -top-10 w-24 h-24 rounded-full bg-gradient-to-tr ${config.gradient} opacity-[0.02] blur-xl pointer-events-none`} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}

"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Wrench, 
  CreditCard, 
  Volume2,
  Droplet,
  Package,
  Check,
  BellRing
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NotificationsPage() {
  const { notifications, markNotificationsAsRead } = useApp();

  const handleMarkAllRead = () => {
    markNotificationsAsRead();
  };

  const getNotificationIcon = (title: string) => {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('technician') || lowercaseTitle.includes('request') || lowercaseTitle.includes('repair')) {
      return <Wrench className="size-5" />;
    }
    if (lowercaseTitle.includes('rent') || lowercaseTitle.includes('bill') || lowercaseTitle.includes('payment')) {
      return <CreditCard className="size-5" />;
    }
    if (lowercaseTitle.includes('water')) {
      return <Droplet className="size-5" />;
    }
    if (lowercaseTitle.includes('package') || lowercaseTitle.includes('amazon')) {
      return <Package className="size-5" />;
    }
    return <Volume2 className="size-5" />;
  };

  const getNotificationIconBg = (title: string, read: boolean) => {
    if (!read) {
      return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary';
    }
    return 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400';
  };

  // Group notifications. For simplicity in our mock state, we can display them all under 'Recent' or mock group them.
  // In AppContext, we have 2 notifications. Let's list them nicely. We can also add some static mock ones for "Earlier" to match the full page feel!
  const unreadCount = notifications.filter(n => !n.read).length;

  const earlierNotifications: { id: string; title: string; description: string; timestamp: string; read: boolean }[] = [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header section */}
      <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="size-6 text-primary" />
            Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View security alerts, community announcements and ticket updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            onClick={handleMarkAllRead}
            className="text-primary hover:text-primary-container font-semibold text-xs h-9 flex items-center gap-1"
          >
            <Check className="size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <Card className="border-dashed border-slate-200 dark:border-slate-800 bg-transparent py-12">
          <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
              <BellRing className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">All Caught Up</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                No new notifications for you right now.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        {/* Today Group */}
        {notifications.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today</h2>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary dark:text-primary border-transparent font-bold text-[10px] py-0.5 px-2">
                  {unreadCount} New
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {notifications.map((notif) => (
                <Card 
                  key={notif.id}
                  className={`border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] transition-all relative overflow-hidden ${
                    !notif.read ? 'bg-primary/[0.01] border-l-2 border-l-primary' : 'opacity-80'
                  }`}
                >
                  <CardContent className="p-4 flex gap-4 items-start">
                    {/* Unread dot */}
                    {!notif.read && (
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      getNotificationIconBg(notif.title, notif.read)
                    }`}>
                      {getNotificationIcon(notif.title)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                        {notif.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Earlier Group */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white px-1">Earlier</h2>

          <div className="flex flex-col gap-3">
            {earlierNotifications.map((notif) => (
              <Card 
                key={notif.id}
                className="border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] opacity-80"
              >
                <CardContent className="p-4 flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    getNotificationIconBg(notif.title, notif.read)
                  }`}>
                    {getNotificationIcon(notif.title)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      {notif.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

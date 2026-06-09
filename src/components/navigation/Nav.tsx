"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wrench, 
  Users, 
  User, 
  Bell, 
  LogOut,
  Coffee,
  Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Nav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant, notifications, logout } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Services', href: '/services', icon: Wrench },
    { label: 'Notices', href: '/notices', icon: Megaphone },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Top App Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center px-6 h-16 transition-colors">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* Mini Logo */}
            <img src="/logo.png" alt="PG Connect Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
            <span className="font-bold text-xl tracking-tight text-primary dark:text-primary">
              PG Connect
            </span>
          </Link>
        </div>

        {/* Desktop Navigation (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-primary dark:hover:text-primary transition-colors relative py-5 ${
                  isActive 
                    ? 'text-primary dark:text-white font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                    : ''
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-600 dark:text-slate-300 hover:text-primary"
            onClick={() => router.push('/notifications')}
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-white dark:ring-slate-950" />
            )}
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 focus:outline-none transition-transform active:scale-95 flex items-center justify-center shrink-0 cursor-pointer bg-primary/10 text-primary font-bold text-xs uppercase select-none">
              {tenant.name.split(' ').map(n => n[0]).join('') || 'U'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{tenant.name}</span>
                    <span className="text-xs text-slate-500">{tenant.room} • {tenant.bed}</span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="size-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/payments')}>
                <CreditCard className="size-4 mr-2" />
                Billing Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={logout}>
                <LogOut className="size-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Bottom Nav Bar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-safe flex justify-around items-center py-2.5 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-2xl px-5 py-2'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2'
              }`}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-semibold tracking-wide mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

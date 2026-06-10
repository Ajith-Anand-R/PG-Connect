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
import { motion } from 'framer-motion';

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

  const mobileNavItems = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Services', href: '/services', icon: Wrench },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Top App Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex justify-between items-center px-6 h-16 transition-all">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* Mini Logo */}
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md border border-white/40 dark:border-white/10 shrink-0">
              <img src="/logo.png" alt="PG Connect Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gradient-primary">
              PG Connect
            </span>
          </Link>
        </div>

        {/* Desktop Navigation (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-350">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-primary dark:hover:text-primary transition-colors relative py-5 ${
                  isActive 
                    ? 'text-primary dark:text-white font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' 
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
            className="relative rounded-full text-slate-600 dark:text-slate-300 hover:text-primary active:scale-95 transition-transform"
            onClick={() => router.push('/notifications')}
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-white dark:ring-slate-950 animate-pulse" />
            )}
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 focus:outline-none transition-transform active:scale-95 flex items-center justify-center shrink-0 cursor-pointer bg-primary/10 text-primary font-bold text-xs uppercase select-none hover:ring-2 hover:ring-primary/20">
              {tenant.name.split(' ').map(n => n[0]).join('') || 'U'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card mt-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">{tenant.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{tenant.room} • {tenant.bed}</span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                <User className="size-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/payments')} className="cursor-pointer">
                <CreditCard className="size-4 mr-2" />
                Billing Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer hover:bg-destructive/10 dark:hover:bg-destructive/20" onClick={logout}>
                <LogOut className="size-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Bottom Nav Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 z-50 max-w-[416px] mx-auto">
        <nav className="bg-white/60 dark:bg-slate-950/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_16px_40px_rgba(31,38,135,0.06)] rounded-[24px] py-1.5 px-2.5 flex justify-between items-center relative">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 transition-all duration-200 active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 flex-1 min-h-[48px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/25 rounded-[16px] border border-primary/20 dark:border-primary/30 -z-10 shadow-[0_2px_8px_rgba(88,67,233,0.04)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`size-4.5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className={`text-[9.5px] font-bold tracking-wide mt-1 transition-colors duration-200 ${isActive ? 'text-primary font-black' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

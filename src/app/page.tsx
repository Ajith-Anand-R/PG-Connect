"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Wallet, 
  Bolt, 
  CheckCircle2, 
  Coffee, 
  Wrench, 
  UtensilsCrossed, 
  MessageSquare, 
  UserCheck,
  ChevronRight,
  Clock,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 320, damping: 24 } 
  }
};

export default function DashboardPage() {
  const { tenant, bills, requests, payBill, menuList, notices } = useApp();
  const [isPaying, setIsPaying] = useState(false);

  // Find electricity bill (category: Utility)
  const electricityBill = bills.find(b => b.category === 'Utility');
  // Find paid rent (category: Rent)
  const rentBill = bills.find(b => b.category === 'Rent');
  // Open tickets
  const activeRequests = requests.filter(r => r.status !== 'Resolved');

  // Calculate tomorrow's menu
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const tomorrowIndex = (new Date().getDay() + 1) % 7;
  const tomorrowDayName = daysOfWeek[tomorrowIndex];
  const tomorrowMenu = menuList.find(m => m.day === tomorrowDayName);

  const handlePay = () => {
    if (!electricityBill) return;
    setIsPaying(true);
    setTimeout(() => {
      payBill(electricityBill.id);
      setIsPaying(false);
    }, 1200);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Welcome Header */}
      <motion.header variants={itemVariants} className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Good Morning, <span className="text-gradient-primary">{tenant.name.split(' ')[0]}</span>
          </h1>
          <span className="text-2xl animate-pulse">👋</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold py-0.5 px-2 flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            Verified Resident
          </Badge>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Room {tenant.room}</span>
        </div>
      </motion.header>

      {/* Latest Announcement Notice */}
      {notices && notices.length > 0 && (
        <motion.div 
          variants={itemVariants}
          className="glass-card glow-accent p-4.5 flex gap-4 items-start relative overflow-hidden group rounded-3xl border-transparent"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-accent/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:scale-125 transition-transform duration-700" />
          <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(236,72,153,0.1)]">
            <Megaphone className="size-4.5" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex justify-between items-center">
              <span className="text-[9.5px] font-black text-accent uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="size-2.5 animate-spin" />
                Latest Notice • {notices[0].date}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5 truncate">
              {notices[0].title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {notices[0].content}
            </p>
          </div>
          <Link href="/notices" className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-all active:scale-90 hover:scale-105">
            <ChevronRight className="size-4" />
          </Link>
        </motion.div>
      )}

      {/* Bento Grid Elements */}
      {/* 1. Financial Overview */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-transparent shadow-none rounded-3xl overflow-hidden">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100/40 dark:border-slate-800/40 pb-3">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="size-5 text-primary" />
                Financial Overview
              </h2>
              <Link href="/payments" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                History <ChevronRight className="size-3" />
              </Link>
            </div>

            {bills.length === 0 ? (
              <div className="bg-slate-50/20 dark:bg-slate-950/20 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-100/20 dark:border-slate-800/20">
                <p className="text-sm font-bold">No pending payments</p>
                <p className="text-[11px] mt-1 text-slate-400 dark:text-slate-500">You are all caught up! There are no outstanding rents or utility bills.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Rent Paid Card */}
                {rentBill && (
                  <div className="bg-white/40 dark:bg-slate-950/25 rounded-2xl p-4 border border-white/20 dark:border-white/5 flex flex-col justify-between min-h-[114px]">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{rentBill.title}</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">₹{rentBill.amount.toLocaleString()}</p>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full w-max border border-emerald-500/10">
                      <CheckCircle2 className="size-3.5" />
                      Paid Successfully
                    </div>
                  </div>
                )}

                {/* Utility Bill Card */}
                {electricityBill && (
                  <div className={`rounded-2xl p-4 flex flex-col justify-between min-h-[114px] border transition-all ${
                    electricityBill.status === 'Paid' 
                      ? 'bg-white/40 dark:bg-slate-950/25 border-white/20 dark:border-white/5' 
                      : 'bg-destructive/5 dark:bg-destructive/10 border-destructive/20'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{electricityBill.title}</p>
                        {electricityBill.status !== 'Paid' && <Bolt className="size-4 text-destructive animate-pulse" />}
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">₹{electricityBill.amount}</p>
                      <p className={`text-[10px] mt-1 font-semibold ${
                        electricityBill.status === 'Paid' ? 'text-slate-500' : 'text-destructive'
                      }`}>
                        {electricityBill.status === 'Paid' ? 'No outstanding dues' : `Due by ${electricityBill.dueDate}`}
                      </p>
                    </div>

                    {electricityBill.status !== 'Paid' ? (
                      <Button 
                        size="sm" 
                        className="mt-3 w-full bg-primary hover:bg-primary/90 glow-primary font-bold text-xs transition-all active:scale-[0.97] rounded-xl" 
                        onClick={handlePay}
                        disabled={isPaying}
                      >
                        {isPaying ? 'Processing...' : 'Pay Now'}
                      </Button>
                    ) : (
                      <div className="mt-3 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full w-max border border-emerald-500/10">
                        <CheckCircle2 className="size-3.5" />
                        Paid Successfully
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. Meal Status Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-transparent shadow-none rounded-3xl overflow-hidden">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100/40 dark:border-slate-800/40 pb-3">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Coffee className="size-5 text-secondary" />
                Tomorrow&apos;s Breakfast
              </h2>
              <Link href="/meals" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                Preferences <ChevronRight className="size-3" />
              </Link>
            </div>

            {!tomorrowMenu ? (
              <div className="bg-slate-50/20 dark:bg-slate-950/20 rounded-2xl p-4 text-center text-slate-500 dark:text-slate-400 border border-slate-100/20 dark:border-slate-800/20">
                <p className="text-xs font-semibold">No breakfast service scheduled for tomorrow</p>
              </div>
            ) : (
              <div className="bg-secondary/5 dark:bg-secondary/15 rounded-2xl p-4 flex items-center gap-4 border border-secondary/10">
                <div className="w-11 h-11 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(14,165,233,0.1)]">
                  <UtensilsCrossed className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {tomorrowMenu.breakfast}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                    Served {tomorrowMenu.breakfastTime} • Vegetarian
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* 3. Quick Actions Menu */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {/* Action 1: Raise Request */}
        <Link 
          href="/services" 
          className="glass-card glass-card-hover rounded-2xl p-4.5 flex flex-col items-center justify-center gap-3 border-transparent text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary shadow-[0_4px_12px_rgba(14,165,233,0.08)] group-hover:bg-secondary/25 transition-all">
            <Wrench className="size-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Raise Request
          </span>
        </Link>

        {/* Action 2: Meal Management */}
        <Link 
          href="/meals" 
          className="glass-card glass-card-hover rounded-2xl p-4.5 flex flex-col items-center justify-center gap-3 border-transparent text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_4px_12px_rgba(88,67,233,0.08)] group-hover:bg-primary/20 transition-all">
            <Coffee className="size-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Meals Portal
          </span>
        </Link>

        {/* Action 3: Community Board */}
        <Link 
          href="/community" 
          className="glass-card glass-card-hover rounded-2xl p-4.5 flex flex-col items-center justify-center gap-3 border-transparent text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-[0_4px_12px_rgba(236,72,153,0.08)] group-hover:bg-accent/20 transition-all">
            <MessageSquare className="size-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Community Board
          </span>
        </Link>

        {/* Action 4: Guest Pass */}
        <Link 
          href="/guest-pass" 
          className="glass-card glass-card-hover rounded-2xl p-4.5 flex flex-col items-center justify-center gap-3 border-transparent text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.08)] group-hover:bg-emerald-500/20 transition-all">
            <UserCheck className="size-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Guest Pass
          </span>
        </Link>
      </motion.div>

      {/* 4. Active Service Tickets */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-transparent shadow-none rounded-3xl">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Active Requests</h2>
              <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350 border-transparent text-[10px] font-bold py-0.5 px-2.5">
                {activeRequests.length} Open
              </Badge>
            </div>

            <div className="flex flex-col gap-3">
              {activeRequests.length === 0 ? (
                <div className="bg-slate-50/20 dark:bg-slate-950/20 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-100/20 dark:border-slate-800/20">
                  <p className="text-xs font-bold">No active service requests</p>
                  <p className="text-[10px] mt-0.5 text-slate-450 dark:text-slate-500 font-semibold">Everything is in top shape!</p>
                </div>
              ) : (
                activeRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-950/25 border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-950/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-650 dark:text-slate-300">
                        <Wrench className="size-4.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {req.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          Ticket #{req.id.toUpperCase().slice(0, 8)} • Raised {req.raisedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border-transparent text-[10px] font-bold flex items-center gap-1 py-0.5 px-2.5 rounded-full">
                        <Clock className="size-3" />
                        In Progress
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

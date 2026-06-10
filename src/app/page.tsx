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
  Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    // Simulate slight lag for visual feedback (Tactile feedback rule)
    setTimeout(() => {
      payBill(electricityBill.id);
      setIsPaying(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Good Morning, {tenant.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Welcome to your portal. Here is your stay status today.
        </p>
      </header>

      {/* Latest Announcement Notice */}
      {notices && notices.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500/10 via-primary/5 to-primary/10 dark:from-primary/15 dark:to-primary/5 border border-primary/15 rounded-3xl p-4.5 flex gap-4 items-start relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500" />
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Megaphone className="size-4.5" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-primary uppercase tracking-wider">Latest Notice • {notices[0].date}</span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">
              {notices[0].title}
            </h3>
            <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {notices[0].content}
            </p>
          </div>
          <Link href="/notices" className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors active:scale-90">
            <ChevronRight className="size-4" />
          </Link>
        </div>
      )}

      {/* Bento Grid Elements */}
      {/* 1. Financial Overview */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              Financial Overview
            </h2>
            <Link href="/payments" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              History <ChevronRight className="size-3" />
            </Link>
          </div>

          {bills.length === 0 ? (
            <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/60">
              <p className="text-sm font-semibold">No pending payments</p>
              <p className="text-[11px] mt-1 text-slate-400 dark:text-slate-500">You are all caught up! There are no outstanding rents or utility bills.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rent Paid Card */}
              {rentBill && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 flex flex-col justify-between min-h-[110px]">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{rentBill.title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{rentBill.amount.toLocaleString()}</p>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full w-max">
                    <CheckCircle2 className="size-3.5" />
                    Paid Successfully
                  </div>
                </div>
              )}

              {/* Utility Bill Card */}
              {electricityBill && (
                <div className={`rounded-xl p-4 flex flex-col justify-between min-h-[110px] border transition-colors ${
                  electricityBill.status === 'Paid' 
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-transparent' 
                    : 'bg-destructive/5 dark:bg-destructive/10 border-destructive/10'
                }`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{electricityBill.title}</p>
                      {electricityBill.status !== 'Paid' && <Bolt className="size-4 text-destructive animate-pulse" />}
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{electricityBill.amount}</p>
                    <p className={`text-[10px] mt-1 ${
                      electricityBill.status === 'Paid' ? 'text-slate-500' : 'text-destructive font-semibold'
                    }`}>
                      {electricityBill.status === 'Paid' ? 'No outstanding dues' : electricityBill.dueDate}
                    </p>
                  </div>

                  {electricityBill.status !== 'Paid' ? (
                    <Button 
                      size="sm" 
                      className="mt-3 w-full bg-primary font-semibold text-xs transition-transform active:scale-[0.98]" 
                      onClick={handlePay}
                      disabled={isPaying}
                    >
                      {isPaying ? 'Processing...' : 'Pay Now'}
                    </Button>
                  ) : (
                    <div className="mt-3 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full w-max">
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

      {/* 2. Meal Status Card */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Coffee className="size-5 text-secondary" />
              Tomorrow&apos;s Breakfast
            </h2>
            <Link href="/meals" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Preferences <ChevronRight className="size-3" />
            </Link>
          </div>

          {!tomorrowMenu ? (
            <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-4 text-center text-slate-500 dark:text-slate-400 border border-slate-100/60 dark:border-slate-800/40">
              <p className="text-xs font-semibold">No breakfast service scheduled for tomorrow</p>
            </div>
          ) : (
            <div className="bg-secondary/10 dark:bg-secondary/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
                <UtensilsCrossed className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {tomorrowMenu.breakfast}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Served {tomorrowMenu.breakfastTime} • Vegetarian
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Quick Actions Menu */}
      <div className="grid grid-cols-2 gap-3">
        {/* Action 1: Raise Request */}
        <Link 
          href="/services" 
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center text-secondary group-hover:bg-secondary/25 transition-colors">
            <Wrench className="size-5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Raise Request
          </span>
        </Link>

        {/* Action 2: Meal Management */}
        <Link 
          href="/meals" 
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
            <Coffee className="size-5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Meals Portal
          </span>
        </Link>

        {/* Action 3: Community Board */}
        <Link 
          href="/community" 
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-orange-700 dark:text-orange-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
            <MessageSquare className="size-5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Community Board
          </span>
        </Link>

        {/* Action 4: Guest Pass */}
        <Link 
          href="/guest-pass" 
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <UserCheck className="size-5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Guest Pass
          </span>
        </Link>
      </div>

      {/* 4. Active Service Tickets */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Active Requests</h2>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {activeRequests.length} Open
            </Badge>
          </div>

          <div className="flex flex-col gap-3">
            {activeRequests.length === 0 ? (
              <div className="bg-slate-50/40 dark:bg-slate-900/20 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-100/60 dark:border-slate-800/40">
                <p className="text-xs font-semibold">No active service requests</p>
                <p className="text-[10px] mt-0.5 text-slate-400 dark:text-slate-500">Everything is in top shape!</p>
              </div>
            ) : (
              activeRequests.map((req) => (
                <div 
                  key={req.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200/50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                      <Wrench className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {req.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ticket #{req.id.toUpperCase().slice(0, 8)} • Raised {req.raisedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/10 border-transparent text-[10px] font-semibold flex items-center gap-1 py-0.5 px-2">
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
    </div>
  );
}

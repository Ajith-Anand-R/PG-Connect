"use client";

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  DollarSign, 
  Wrench, 
  Utensils, 
  PlusCircle, 
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const OwnerDashboard: React.FC = () => {
  const { 
    allTenants, 
    allComplaints, 
    allPayments, 
    allMeals, 
    notices 
  } = useApp();

  // 1. Calculate Revenue
  const totalPaid = allPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  
  const totalPending = allPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  // 2. Occupancy Rate
  // Let's assume total beds is 10 for demo purposes, or count active tenants
  const activeTenantsCount = allTenants.filter(t => t.status === 'active').length;
  const totalCapacity = 10; // Demo total beds
  const occupancyPercentage = Math.round((activeTenantsCount / totalCapacity) * 100) || 0;

  // 3. Open Complaints
  const openComplaintsCount = allComplaints.filter(c => c.status !== 'resolved').length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Welcome Header */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Owner Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Real-time operations for NestHaven PG.
        </p>
      </header>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Stat 1: Revenue */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardContent className="p-4 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue</span>
              <DollarSign className="size-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">${totalPaid.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                ${totalPending.toLocaleString()} pending
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stat 2: Occupancy */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-4 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Occupancy</span>
              <Users className="size-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{occupancyPercentage}%</p>
              <p className="text-[10px] text-slate-500 mt-1">
                {activeTenantsCount} of {totalCapacity} beds filled
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stat 3: Complaints */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardContent className="p-4 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open Tickets</span>
              <Wrench className="size-4 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{openComplaintsCount}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Needs attention
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stat 4: Meals */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardContent className="p-4 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tomorrow&apos;s Breakfast</span>
              <Utensils className="size-4 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{allMeals.breakfastCount}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Residents opted in
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Grid Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link 
          href="/payments" 
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 transition-colors">
            <DollarSign className="size-5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Payments Ledger
          </span>
        </Link>

        <Link 
          href="/services" 
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500/20 transition-colors">
            <Wrench className="size-5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Manage Tickets
          </span>
        </Link>
      </div>

      {/* Meals Summary Card */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="size-5 text-purple-500" />
              Meal Orders Summary (Tomorrow)
            </h2>
            <Link href="/meals" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Breakdown <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
              <p className="text-slate-500">Breakfast</p>
              <p className="text-lg font-bold text-slate-950 dark:text-white mt-0.5">{allMeals.breakfastCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
              <p className="text-slate-500">Lunch</p>
              <p className="text-lg font-bold text-slate-950 dark:text-white mt-0.5">{allMeals.lunchCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
              <p className="text-slate-500">Dinner</p>
              <p className="text-lg font-bold text-slate-950 dark:text-white mt-0.5">{allMeals.dinnerCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices Overview */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="size-5 text-primary" />
              Recent Announcements
            </h2>
            <Link href="/notices" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Manage Notices <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {notices.slice(0, 2).map((notice) => (
              <div 
                key={notice.id} 
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {notice.title}
                  </h3>
                  <span className="text-[9px] text-slate-400 font-bold">{notice.date}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Nav } from '@/components/navigation/Nav';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { UpcomingStayView } from '@/components/prebooked/UpcomingStayView';

export const AppContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, authLoading, tenant } = useApp();

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-primary/20 animate-pulse bg-white p-1">
            <img src="/logo.png" alt="PG Connect Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase animate-pulse">
              Authenticating session...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthScreen />;
  }

  if (tenant && tenant.status === 'prebooked') {
    return (
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
        <UpcomingStayView />
      </main>
    );
  }

  return (
    <>
      <Nav />
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
        {children}
      </main>
    </>
  );
};

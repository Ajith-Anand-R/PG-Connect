"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Nav } from '@/components/navigation/Nav';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { OwnerDashboard } from '@/components/owner/OwnerDashboard';
import { OwnerPayments } from '@/components/owner/OwnerPayments';
import { OwnerServices } from '@/components/owner/OwnerServices';
import { OwnerMeals } from '@/components/owner/OwnerMeals';
import { OwnerNotices } from '@/components/owner/OwnerNotices';

export const AppContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, userRole } = useApp();
  const pathname = usePathname();

  if (!isLoggedIn) {
    return <AuthScreen />;
  }

  // Render Owner Views if Owner is logged in
  const renderContent = () => {
    if (userRole === 'Owner') {
      switch (pathname) {
        case '/':
          return <OwnerDashboard />;
        case '/payments':
          return <OwnerPayments />;
        case '/services':
          return <OwnerServices />;
        case '/meals':
          return <OwnerMeals />;
        case '/notices':
          return <OwnerNotices />;
        default:
          return children; // For chats, notifications, profile, etc.
      }
    }
    return children; // Tenant views (default routes)
  };

  return (
    <>
      <Nav />
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
        {renderContent()}
      </main>
    </>
  );
};

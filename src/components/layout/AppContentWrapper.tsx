"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Nav } from '@/components/navigation/Nav';
import { AuthScreen } from '@/components/auth/AuthScreen';

export const AppContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return <AuthScreen />;
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

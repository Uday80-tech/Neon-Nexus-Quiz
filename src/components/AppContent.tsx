
'use client';

import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import React from 'react';

// A new component to conditionally render children based on initialization
export default function AppContent({ children }: { children: React.ReactNode }) {
  const { isInitializing, isUserLoading } = useFirebase();

  // Show a global loader while firebase is initializing or user is loading
  // (isUserLoading also depends on isInitializing)
  if (isInitializing || isUserLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

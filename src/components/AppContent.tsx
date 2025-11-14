
'use client';

import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import React from 'react';

// A new component to conditionally render children based on initialization
export default function AppContent({ children }: { children: React.ReactNode }) {
  const { isUserLoading } = useFirebase();

  // Show a global loader only while the user's auth state is being resolved.
  // This avoids blocking the UI for the initial Firebase app initialization.
  if (isUserLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

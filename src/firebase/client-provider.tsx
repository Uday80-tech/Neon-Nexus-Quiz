
'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { getRedirectResult, getAdditionalUserInfo, User } from 'firebase/auth';
import { doc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const router = useRouter();

  // Tracks only the redirect processing state
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  // Memoize firebase services to ensure they're initialized only once.
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const processRedirect = async () => {
      // Check if both auth and firestore are available before proceeding.
      if (firebaseServices.auth && firebaseServices.firestore) {
        try {
          const result = await getRedirectResult(firebaseServices.auth);
          if (result) {
            const user = result.user;
            const additionalUserInfo = getAdditionalUserInfo(result);
            
            // Check if it's a new user and create a profile document if so.
            if (additionalUserInfo?.isNewUser) {
              const userRef = doc(firebaseServices.firestore, `users/${user.uid}`);
              await setDoc(userRef, {
                username: user.displayName || user.email || 'Anonymous',
                email: user.email,
                createdAt: serverTimestamp(),
              }, { merge: true });
            }
            // After processing, redirect to the home page to clean the URL.
            router.push("/");
          }
        } catch (error) {
          console.error("Error processing redirect result:", error);
          // Optionally, show a toast notification for specific errors
        } finally {
          // Mark redirect processing as complete, regardless of the outcome.
          setIsProcessingRedirect(false);
        }
      } else {
        // If services aren't ready, we are also done for this check.
        setIsProcessingRedirect(false);
      }
    };
    
    processRedirect();
  }, [firebaseServices, router]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      // The overall initialization depends on the redirect being processed.
      isInitializing={isProcessingRedirect}
    >
      {children}
    </FirebaseProvider>
  );
}

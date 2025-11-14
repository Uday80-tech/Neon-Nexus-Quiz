'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { getRedirectResult, getAdditionalUserInfo } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const router = useRouter();

  const [isInitializing, setIsInitializing] = useState(true);

  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const processRedirectResult = async () => {
      if (firebaseServices.auth && firebaseServices.firestore) {
        try {
          const result = await getRedirectResult(firebaseServices.auth);
          if (result) {
            const user = result.user;
            const additionalUserInfo = getAdditionalUserInfo(result);
            
            if (additionalUserInfo?.isNewUser) {
                const userRef = doc(firebaseServices.firestore, `users/${user.uid}`);
                setDocumentNonBlocking(userRef, {
                    username: user.displayName || user.email,
                    email: user.email,
                    createdAt: serverTimestamp(),
                }, { merge: true });
            }
            // Redirect to home after sign-in is processed
            router.push("/");
          }
        } catch (error) {
          // Handle potential errors, e.g., 'auth/account-exists-with-different-credential'
          console.error("Error processing redirect result:", error);
          // You might want to show a toast message here
        } finally {
          // Regardless of outcome, initialization is complete
          setIsInitializing(false);
        }
      } else {
        // If services aren't ready, we're not done initializing
        setIsInitializing(false);
      }
    };
    
    processRedirectResult();
  }, [firebaseServices, router]);


  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      isInitializing={isInitializing}
    >
      {children}
    </FirebaseProvider>
  );
}

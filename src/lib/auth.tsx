"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';


type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  signup: (name: string, email: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firebaseAuth = useFirebaseAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isUserLoading) {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || firebaseUser.email || 'Anonymous',
          email: firebaseUser.email || '',
        });
      } else {
        setUser(null);
      }
    }
  }, [firebaseUser, isUserLoading]);

  const login = (name: string, email: string) => {
    // This will be handled by Firebase now
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    router.push('/');
  };

  const signup = (name: string, email: string) => {
    // This will be handled by Firebase now
  };

  const value = {
    user,
    login,
    logout,
    signup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

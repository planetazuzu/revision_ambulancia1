
"use client";

import type { User } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';
import type { LoginRequest } from '@/lib/services';


interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  assignAmbulanceToCurrentUser: (ambulanceId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, login: loginHook, logout: logoutHook, error } = useAuthHook();
  const router = useRouter();
  const currentPathname = usePathname();

  useEffect(() => {
    // Redirect logic based on user state
    if (!loading && user) {
      if (user.role === 'usuario' && !user.assignedAmbulanceId && currentPathname !== '/validate-ambulance' && currentPathname !== '/') {
        router.replace('/validate-ambulance');
      }
    }
  }, [user, loading, currentPathname, router]);

  const login = async (credentials: LoginRequest) => {
    try {
      await loginHook(credentials);
    } catch (err) {
      // Error is handled by the hook
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutHook();
    } catch (err) {
      // Error is handled by the hook
      console.error('Logout error:', err);
    }
  };

  const assignAmbulanceToCurrentUser = (ambulanceId: string) => {
    if (user && user.role === 'usuario') {
      // This would need to be implemented in the backend
      // For now, we'll just update the local state
      const updatedUser = { ...user, assignedAmbulanceId: ambulanceId };
      // Note: This should be updated via API call to the backend
      console.log('Assign ambulance to user:', ambulanceId);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, assignAmbulanceToCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

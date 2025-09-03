import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';
import type { User } from '@/types';
import type { LoginRequest, RegisterRequest } from '@/lib/services';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setUser(null);
      // Don't set error here as it might be expected (user not logged in)
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      setUser(response.user);
      
      // Redirect based on user role
      if (response.user.role === 'usuario' && !response.user.assignedAmbulanceId) {
        router.push('/validate-ambulance');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const newUser = await authService.register(userData);
      setUser(newUser);
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.logout();
      setUser(null);
      
      router.push('/');
    } catch (err: any) {
      console.error('Logout error:', err);
      // Even if logout fails on backend, clear local state
      setUser(null);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    error,
  };
}

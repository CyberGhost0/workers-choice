'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  accountStatus?: string;
  createdAt?: string;
  profile?: {
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    backgroundUrl?: string;
    bio?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    lastProfileUpdate?: string | null;
  };
  businessProfile?: {
    id: string;
    businessName: string;
    category: string;
    description?: string;
    logoUrl?: string;
    isVerified?: boolean;
    averageRating?: number;
    totalReviews?: number;
    yearsExperience?: number;
    hourlyRate?: number;
  };
}

interface TwoFactorData {
  requiresTwoFactor: boolean;
  tempToken?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<TwoFactorData | void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  verify2FALogin: (tempToken: string, code: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true, tempToken: data.tempToken, email: data.email } as TwoFactorData;
    }
    const { token, user } = data;
    localStorage.setItem('token', token);
    setUser(user);
  };

  const verify2FALogin = async (tempToken: string, code: string) => {
    const response = await api.post('/auth/2fa/verify-login', { tempToken, token: code });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
  };

  const register = async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        verify2FALogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

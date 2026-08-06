import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultUser: User = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'investigator@crimelens.ai',
    full_name: 'Chief Insp. Marcus Vance',
    badge_number: 'INV-9042',
    department: 'Special Homicide & Cyber Crime Division',
    role: 'Lead Investigator'
  };
  const defaultToken = 'demo_jwt_token_crimelens_2026';

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('crimelens_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('crimelens_token');
    return saved ? saved : defaultToken;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => !!token);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('crimelens_user', JSON.stringify(res.user));
          }
        } catch (e) {
          console.warn('[AuthContext] Token validation failed:', e);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('crimelens_token', newToken);
    localStorage.setItem('crimelens_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('crimelens_token');
    localStorage.removeItem('crimelens_user');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('crimelens_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshProfile = async () => {
    if (token) {
      try {
        const res = await authService.getProfile();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('crimelens_user', JSON.stringify(res.user));
        }
      } catch (e) {
        console.warn('Profile refresh error:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

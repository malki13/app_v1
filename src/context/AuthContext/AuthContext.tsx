import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService from '../../api/services/authService';
import type { User, LoginResponse } from '../../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const hasSession = await authService.checkSession();
        if (hasSession && isMounted) {
          const userData = await authService.getUserData();
          if (isMounted) setUser(userData);
        }
      } catch (error) {
        console.error('[AuthContext] Error checking auth:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const result = await authService.login(email, password);
    if (result.success && result.user) { setUser(result.user); }
    return result;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: user !== null }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

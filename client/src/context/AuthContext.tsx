

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
        } catch {
          api.clearToken();
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password);
    api.setToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string, role?: string) => {
    const data = await api.register(username, email, password, role);
    api.setToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    api.clearToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

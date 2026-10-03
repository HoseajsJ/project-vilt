import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { RoleType, User } from '../types';

interface AuthContextType {
  user: User | null;
  role: RoleType | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: RoleType) => void;
  backendUrl: string;
  updateBackendUrl: (url: string) => Promise<void>;
  isRtOrPengurus: boolean;
  isWarga: boolean;
}

const STORAGE_KEY_USER = '@desa_pintar_user';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendUrl, setBackendUrlState] = useState<string>(api.getBaseUrl());

  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      await api.init();
      setBackendUrlState(api.getBaseUrl());
      const savedToken = api.getToken();
      const savedUserStr = await AsyncStorage.getItem(STORAGE_KEY_USER);

      if (savedToken && savedUserStr) {
        const savedUser: User = JSON.parse(savedUserStr);
        setUser(savedUser);
        setRole(savedUser.role);
        setToken(savedToken);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      if (res && res.status && res.data) {
        const loggedUser: User = {
          id: res.data.user.id,
          name: res.data.user.name,
          role: res.data.role,
        };
        await api.setToken(res.data.token);
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(loggedUser));

        setUser(loggedUser);
        setRole(res.data.role);
        setToken(res.data.token);
        return { success: true, message: res.message || 'Login berhasil' };
      }
      return { success: false, message: res?.message || 'Login gagal' };
    } catch {
      // Offline fallback: check demo credentials
      if (username.toLowerCase() === 'budi' || username.toLowerCase() === 'pengurus') {
        const demoUser: User = { id: 1, name: 'Budi Santoso', role: 'pengurus_karta' };
        setUser(demoUser);
        setRole('pengurus_karta');
        setToken('demo-token-pengurus');
        return { success: true, message: 'Masuk mode demo (Pengurus Karang Taruna)' };
      }
      if (username.toLowerCase() === 'pakrt' || username.toLowerCase() === 'rt') {
        const demoUser: User = { id: 3, name: 'H. Bambang Irawan (Ketua RT 03)', role: 'pengurus_rt' };
        setUser(demoUser);
        setRole('pengurus_rt');
        setToken('demo-token-rt');
        return { success: true, message: 'Masuk mode demo (Pengurus RT 03)' };
      }
      if (username.toLowerCase() === 'siti' || username.toLowerCase() === 'warga') {
        const demoUser: User = { id: 2, name: 'Siti Aminah', role: 'warga' };
        setUser(demoUser);
        setRole('warga');
        setToken('demo-token-warga');
        return { success: true, message: 'Masuk mode demo (Warga RW 05)' };
      }
      return { success: false, message: 'Username atau password salah' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      await AsyncStorage.removeItem(STORAGE_KEY_USER);
    } catch {
      // ignore
    } finally {
      setUser(null);
      setRole(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const switchDemoRole = (newRole: RoleType) => {
    if (newRole === 'pengurus' || newRole === 'pengurus_karta') {
      const u: User = { id: 1, name: 'Budi Santoso', role: 'pengurus_karta' };
      setUser(u);
      setRole('pengurus_karta');
    } else if (newRole === 'pengurus_rt') {
      const u: User = { id: 3, name: 'H. Bambang Irawan (Ketua RT 03)', role: 'pengurus_rt' };
      setUser(u);
      setRole('pengurus_rt');
    } else {
      const u: User = { id: 2, name: 'Siti Aminah', role: 'warga' };
      setUser(u);
      setRole('warga');
    }
  };

  const updateBackendUrl = async (url: string) => {
    await api.setBaseUrl(url);
    setBackendUrlState(api.getBaseUrl());
  };

  const isRtOrPengurus = role === 'pengurus' || role === 'pengurus_karta' || role === 'pengurus_rt';
  const isWarga = role === 'warga';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        login,
        logout,
        switchDemoRole,
        backendUrl,
        updateBackendUrl,
        isRtOrPengurus,
        isWarga,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

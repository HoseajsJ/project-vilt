import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, ApiRequestError } from '../services/api';
import { RoleType, User } from '../types';

interface AuthContextType {
  user: User | null;
  role: RoleType | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
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
    const splashStartedAt = Date.now();
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
      const remainingSplashTime = 1200 - (Date.now() - splashStartedAt);
      if (remainingSplashTime > 0) await new Promise((resolve) => setTimeout(resolve, remainingSplashTime));
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
    } catch (error) {
      if (error instanceof ApiRequestError) {
        return { success: false, message: error.message };
      }
      return {
        success: false,
        message: `Tidak dapat terhubung ke server (${api.getBaseUrl()}). Periksa koneksi dan alamat API staging.`,
      };
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

  const updateBackendUrl = async (url: string) => {
    await api.setBaseUrl(url);
    setBackendUrlState(api.getBaseUrl());
  };

  const isRtOrPengurus = role === 'pengurus' || role === 'pengurus_karta' || role === 'ketua_karta' || role === 'pengurus_rt';
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

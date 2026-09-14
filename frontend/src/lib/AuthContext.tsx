import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getTokens, setTokens } from "./api";

interface Me { id: string; email: string; displayName: string }

interface AuthState {
  ready: boolean;
  me: Me | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  const loadMe = useCallback(async () => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      setMe(null);
      setReady(true);
      return;
    }
    try {
      const profile = await api.me();
      setMe(profile);
    } catch {
      setTokens(null);
      setMe(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.login(email, password);
    setTokens(tokens);
    await loadMe();
  }, [loadMe]);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const tokens = await api.register(email, password, displayName);
    setTokens(tokens);
    await loadMe();
  }, [loadMe]);

  const logout = useCallback(() => {
    setTokens(null);
    setMe(null);
  }, []);

  return (
    <AuthContext.Provider value={{ ready, me, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

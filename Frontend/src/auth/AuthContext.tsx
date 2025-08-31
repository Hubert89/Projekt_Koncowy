import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, apiNoAuth, setAuthToken } from '../lib/axios';

type Role = 'CLIENT' | 'EMPLOYEE' | 'ADMIN';
type UserSession = { username: string; role: Role; token: string };

type AuthCtx = {
  user: UserSession | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null!);

function normalizeRole(input: unknown): Role {
  if (!input) return 'CLIENT';
  const raw = String(Array.isArray(input) ? input[0] : input)
    .toUpperCase()
    .replace(/^ROLE_/, '');
  if (raw.includes('ADMIN')) return 'ADMIN';
  if (raw.includes('EMPLOYEE') || raw.includes('PRACOWNIK') || raw.includes('STAFF') || raw.includes('WORKER'))
    return 'EMPLOYEE';
  return 'CLIENT';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  // przy starcie aplikacji odtwórz sesję + ustaw Bearera
  useEffect(() => {
    const raw = localStorage.getItem('session');
    if (raw) {
      try {
        const session: UserSession = JSON.parse(raw);
        setUser(session);
        setAuthToken(session.token);
      } catch {}
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await apiNoAuth.post('/api/auth/login', { username, password });

    // akceptuj różne kształty odpowiedzi
    const token: string = res.data?.token || res.data?.accessToken || res.data?.jwt;
    const roleRaw = res.data?.role ?? res.data?.roles ?? res.data?.authorities;
    const role = normalizeRole(roleRaw);
    const uname: string = res.data?.username || username;

    if (!token) {
      throw new Error('Brak tokena w odpowiedzi logowania');
    }

    // zapisz sesję i ustaw Bearera na axios
    const session: UserSession = { token, username: uname, role };
    localStorage.setItem('session', JSON.stringify(session));
    setAuthToken(token);
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem('session');
    setAuthToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

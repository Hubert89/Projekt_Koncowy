import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/axios";
import type { AuthUser, Role } from "./types";

type AuthCtx = {
  user: AuthUser | null;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as Role | null;
    const username = localStorage.getItem("username");
    if (token && role && username) setUser({ token, role, username });
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await api.post("/api/auth/login", { username, password });
    const auth: AuthUser = { token: data.token, role: data.role, username: data.username ?? username };
    localStorage.setItem("token", auth.token);
    localStorage.setItem("role", auth.role);
    localStorage.setItem("username", auth.username);
    setUser(auth);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login/client";
  };

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  const value = useMemo(() => ({ user, login, logout, hasRole }), [user]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
};

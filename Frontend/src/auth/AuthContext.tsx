import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api, { apiNoAuth, setAuthToken, setUserContext } from "../lib/axios";
import type { Role, User } from "./types";

/** DTO z backendu (LoginController): */
type LoginDto = { token: string; username: string; role: string };
/** DTO z WhoAmIController: { username, authorities: string[] } */
type MeDto = { username?: string | null; authorities?: string[] | null };

/** Mapowanie ról z backendu (PL lub ROLE_*) -> Role (EN używane w froncie) */
function normalizeRole(input?: string | string[] | null): Role {
  const pickFromArray = (arr: string[]): string => {
    const up = arr.map(s => s.toUpperCase());
    if (up.includes("ROLE_ADMINISTRATOR") || up.includes("ADMINISTRATOR")) return "ADMIN";
    if (up.includes("ROLE_PRACOWNIK") || up.includes("PRACOWNIK")) return "EMPLOYEE";
    if (up.includes("ROLE_KLIENT") || up.includes("KLIENT")) return "CLIENT";
    if (up.includes("ROLE_ADMIN")) return "ADMIN";
    if (up.includes("ROLE_EMPLOYEE")) return "EMPLOYEE";
    if (up.includes("ROLE_CLIENT")) return "CLIENT";
    return "CLIENT";
  };

  if (Array.isArray(input)) return pickFromArray(input);
  const v = (input ?? "").toString().toUpperCase().replace(/^ROLE_/, "");
  if (v === "ADMINISTRATOR" || v === "ADMIN") return "ADMIN";
  if (v === "PRACOWNIK" || v === "EMPLOYEE") return "EMPLOYEE";
  if (v === "KLIENT" || v === "CLIENT") return "CLIENT";
  return "CLIENT";
}

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<Role>;
  logout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // jeśli mamy token w localStorage, spróbuj odtworzyć użytkownika
        const token = localStorage.getItem("token");
        const cachedRole = localStorage.getItem("role");
        const cachedUsername = localStorage.getItem("username");

        if (!token) {
          setUser(null);
          return;
        }
        // zapytaj backend o aktualne informacje
        const { data } = await api.get<MeDto>("/api/auth/me");
        const role = normalizeRole(data?.authorities ?? cachedRole ?? null);
        const username = data?.username ?? cachedUsername ?? "";
        setUser({ username, role });
        setUserContext({ username, role });
      } catch {
        // token nieważny
        setAuthToken(null);
        setUserContext({ username: null, role: null });
        setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const login: Ctx["login"] = async (username, password) => {
    const { data } = await apiNoAuth.post<LoginDto>("/api/auth/login", { username, password });
    setAuthToken(data.token);
    const role = normalizeRole(data.role);
    setUser({ username: data.username, role });
    setUserContext({ username: data.username, role });
    return role;
  };

  const logout: Ctx["logout"] = () => {
    setAuthToken(null);
    setUserContext({ username: null, role: null });
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

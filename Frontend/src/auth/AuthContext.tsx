import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/axios";
import type { Role, User } from "./types";

type LoginResponse = { token: string; role: string; username: string };

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<Role>;
  logout: () => void;
};

// --- Normalizacja ról ---
// 1) Usuwa prefix ROLE_
// 2) Zamienia polskie nazwy na angielskie (KLIENT->CLIENT, PRACOWNIK->EMPLOYEE)
const normalizeRole = (raw: string): Role => {
  const r = raw.trim().toUpperCase().replace(/^ROLE_/, "");
  const map: Record<string, Role> = {
    ADMIN: "ADMIN",
    CLIENT: "CLIENT",
    EMPLOYEE: "EMPLOYEE",
    KLIENT: "CLIENT",
    PRACOWNIK: "EMPLOYEE",
  };
  return map[r] ?? "CLIENT"; // bezpieczny domyślny fallback
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Odczyt sesji z localStorage po odświeżeniu strony
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (token && storedRole && username) {
      setUser({
        username,
        role: normalizeRole(storedRole), // zawsze CLIENT/ADMIN/EMPLOYEE
      });
    }
    setLoading(false);
  }, []);

  // Logowanie
  const login = async (username: string, password: string): Promise<Role> => {
    const { data } = await api.post<LoginResponse>("/api/auth/login", {
      username,
      password,
    });

    const role = normalizeRole(data.role);

    // zapisujemy już znormalizowaną rolę
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", role);
    localStorage.setItem("username", data.username);

    setUser({ username: data.username, role });

    return role; // "CLIENT" | "ADMIN" | "EMPLOYEE"
  };

  // Wylogowanie
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
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

import { type ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const norm = (r?: string) => (r ? r.toUpperCase().replace(/^ROLE_/, "") : "");

type Props = { children: ReactElement };

export default function PublicOnlyRoute({ children }: Props) {
  const { user, loading } = useAuth();
  if (loading) return null;          // opcjonalnie spinner

  // Niezalogowany — pokazujemy stronę logowania
  if (!user) return children;

  // Zalogowany — wywal z /login/*
  const role = norm(user.role);
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "EMPLOYEE") return <Navigate to="/employee" replace />;
  return <Navigate to="/client/cart" replace />;
}

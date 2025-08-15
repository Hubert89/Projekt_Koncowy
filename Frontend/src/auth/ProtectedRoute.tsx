// auth/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "./types";

// pomocniczo: "ROLE_CLIENT" -> "CLIENT"
const norm = (r?: string): Role | null =>
  r ? (r.toUpperCase().replace(/^ROLE_/, "") as Role) : null;

type Props = {
  roles?: Role[];                 // np. ["CLIENT","ADMIN"]
  children: React.ReactElement;
};

export default function ProtectedRoute({ roles, children }: Props) {
  const { user, loading } = useAuth();

  if (loading) return null;       // tu można wstawić spinner/szkielet
  if (!user) return <Navigate to="/login/client" replace />;

  const userRole = norm(user.role);
  const allowed = roles?.map(norm);

  if (allowed && userRole && !allowed.includes(userRole)) {
    return <Navigate to="/login/client" replace />;
  }

  return children;
}

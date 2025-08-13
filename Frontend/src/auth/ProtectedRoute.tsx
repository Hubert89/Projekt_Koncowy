import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "./types";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: JSX.Element;
  roles?: Role[];
}) {
  const { user, hasRole } = useAuth();

  if (!user) return <Navigate to="/login/client" replace />;

  if (roles && !hasRole(...roles)) return <Navigate to="/login/client" replace />;

  return children;
}

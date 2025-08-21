// auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Role } from '../types/auth';

// pomocniczo: "ROLE_CLIENT" -> "CLIENT"
const norm = (r?: string): Role | null =>
  r ? (r.toUpperCase().replace(/^ROLE_/, '') as Role) : null;

type Props = {
  roles?: Role[]; // np. ['CLIENT','ADMIN']
  children: React.ReactElement;
};

export default function ProtectedRoute({ roles, children }: Props) {
  const { user, loading } = useAuth();

  if (loading) return null; // opcjonalnie spinner
  if (!user) return <Navigate to="/login" replace />;

  const userRole = norm(user.role);
  const allowed = roles?.map(norm);

  if (allowed && userRole && !allowed.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

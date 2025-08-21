// auth/PublicOnlyRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

type Props = { children: React.ReactElement };

export default function PublicOnlyRoute({ children }: Props) {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return children;

  const role = user.role.toUpperCase().replace(/^ROLE_/, '');
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'EMPLOYEE') return <Navigate to="/employee" replace />;
  return <Navigate to="/client" replace />;
}

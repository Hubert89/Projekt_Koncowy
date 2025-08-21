import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicOnlyRoute from './auth/PublicOnlyRoute';

import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import ClientDashboard from './pages/ClientDashboard';
import ClientOrdersPage from './pages/ClientOrdersPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductsPage from './pages/AdminProductsPage';
import EmployeeDashboard from './pages/EmployeeDashboard';

import { CartProvider } from './cart/CartContext';
import PanelCenter from "./layouts/PanelCenter";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminProductsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee/*"
              element={
                <ProtectedRoute roles={['EMPLOYEE','ADMIN']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/orders"
              element={
                <ProtectedRoute>
                  <ClientOrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/client" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";

import Navbar from "./components/Navbar";

import LoginPage from "./pages/LoginPage";
import ClientDashboard from "./pages/ClientDashboard";
import ClientOrdersPage from "./pages/ClientOrdersPage";
import CartPage from "./pages/CartPage";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

import { CartProvider } from "./cart/CartContext";
import "./App.css";

function HomeRedirect() {
  return <Navigate to="/client" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            {/* Landing */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Logowanie – dostępne tylko dla niezalogowanych */}
            <Route
              path="/login/:role"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            {/* Panele z rolami */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedRoute roles={["EMPLOYEE", "ADMIN"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            {/* Strefa klienta */}
            <Route
              path="/client"
              element={
                <ProtectedRoute roles={["CLIENT", "ADMIN"]}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/cart"
              element={
                <ProtectedRoute roles={["CLIENT", "ADMIN"]}>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/orders"
              element={
                <ProtectedRoute roles={["CLIENT", "ADMIN"]}>
                  <ClientOrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

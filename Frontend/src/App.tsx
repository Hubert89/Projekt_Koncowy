import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import CartPage from "./pages/CartPage";
import Navbar from "./components/Navbar";
import { CartProvider } from "./cart/CartContext";
import "./App.css";


// mały komponent przekierowujący z "/" w zależności od stanu
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login/client" replace />;
  const r = (user.role || "").toUpperCase().replace(/^ROLE_/, "");
  if (r === "ADMIN") return <Navigate to="/admin" replace />;
  if (r === "EMPLOYEE") return <Navigate to="/employee" replace />;
  return <Navigate to="/client/cart" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route
            path="/login/:role"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    
  );
}

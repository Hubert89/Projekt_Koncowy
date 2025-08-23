import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  // od razu przenosi na listę produktów
  return <Navigate to="/admin/products" replace />;
}
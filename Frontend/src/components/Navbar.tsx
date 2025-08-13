// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ display: "flex", gap: 16, padding: 12, borderBottom: "1px solid #333" }}>
      <Link to="/">Home</Link>
      {user?.role === "ADMIN" && <Link to="/admin">Panel admina</Link>}
      {user?.role === "EMPLOYEE" && <Link to="/employee">Panel pracownika</Link>}
      {user?.role === "CLIENT" && <Link to="/client">Panel klienta</Link>}
      <div style={{ marginLeft: "auto" }}>
        {user ? (
          <>
            <span style={{ marginRight: 8 }}>{user.username} ({user.role})</span>
            <button onClick={logout}>Wyloguj</button>
          </>
        ) : (
          <Link to="/login/client">Zaloguj</Link>
        )}
      </div>
    </nav>
  );
}

import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom mb-4">
      <div className="container">
        <Link to="/" className="navbar-brand fw-semibold">E‑Commerce Demo</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user?.role === "ADMIN" && (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link">Panel admina</NavLink>
              </li>
            )}
            {user?.role === "EMPLOYEE" && (
              <li className="nav-item">
                <NavLink to="/employee" className="nav-link">Panel pracownika</NavLink>
              </li>
            )}
            {user?.role === "CLIENT" && (
              <li className="nav-item">
                <NavLink to="/client" className="nav-link">Panel klienta</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="text-body-secondary small">
                  {user.username} <span className="badge text-bg-secondary ms-1">{user.role}</span>
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={logout}>
                  Wyloguj
                </button>
              </>
            ) : (
              <Link to="/login/client" className="btn btn-primary btn-sm">Zaloguj</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

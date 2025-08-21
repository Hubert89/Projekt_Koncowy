import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom mb-4">
      <div className="container">
        <Link to="/" className="navbar-brand fw-semibold">Mój sklep internetowy</Link>  

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div id="nav" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
           {user && (
            <li className="nav-item"><NavLink to="/shop" className="nav-link">Sklep</NavLink></li>
           )} 
          {role == "CLIENT" && (
            <>
            <li className="nav-item"><NavLink to="/client/cart" className="nav-link">Koszyk</NavLink></li>
            <li className="nav-item"><NavLink to="/client/orders" className="nav-link">Moje zamówienia</NavLink></li>
            </>
          )}
            {role === "ADMIN" && (
              <>
                <li className="nav-item"><NavLink to="/admin/products" className="nav-link">Zarządzaj produktami</NavLink></li>
              </>
            )}
            {(role === "EMPLOYEE" || role === "ADMIN") && (
              <li className="nav-item"><NavLink to="/employee" className="nav-link">Panel pracownika</NavLink></li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {role && <span className="badge text-bg-secondary">{role}</span>}
            {user
              ? <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Wyloguj</button>
              : <NavLink to="/login" className="btn btn-primary btn-sm">Zaloguj</NavLink>}
          </div>
        </div>
      </div>
    </nav>
  );
}

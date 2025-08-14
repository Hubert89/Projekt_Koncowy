import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../auth/types";

const roles = [
  { key: "client",    label: "KLIENT" },
  { key: "admin",     label: "ADMIN" },
  { key: "employee",  label: "PRACOWNIK" },
] as const;

export default function LoginPage() {
  const { role = "client" } = useParams<{ role: "client" | "admin" | "employee" }>();
  const title = roles.find(r => r.key === role)?.label ?? "KLIENT";

  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      const savedRole = (localStorage.getItem("role") || "CLIENT") as Role;
      if (savedRole === "ADMIN") nav("/admin");
      else if (savedRole === "EMPLOYEE") nav("/employee");
      else nav("/client");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Błąd logowania");
    }
  };

return (
  <main
    style={{
      minHeight: "100vh",       // pełny ekran
      display: "grid",          // siatka
      placeItems: "center",     // idealny środek (pion + poziom)
      padding: "1rem",
      width: "100vw",           // pełna szerokość okna
      boxSizing: "border-box",
    }}
  >
    <div style={{ width: "100%", maxWidth: 520 }}>
      {/* zakładki ról */}
      <ul className="nav nav-pills justify-content-center mb-3">
        {roles.map((r) => (
          <li className="nav-item" key={r.key}>
            <NavLink
              to={`/login/${r.key}`}
              className={({ isActive }) =>
                "nav-link " + (isActive ? "active" : "text-secondary")
              }
            >
              {r.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* karta */}
      <div className="card shadow-lg border-0">
        <div className="card-body p-4 p-lg-5">
          <h1 className="h3 mb-4 text-center">
            Logowanie — <span className="fw-bold">{title}</span>
          </h1>

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              ❌ {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                id="username"
                placeholder="Użytkownik"
                value={username}
                onChange={(e) => setU(e.target.value)}
                required
              />
              <label htmlFor="username">Użytkownik</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setP(e.target.value)}
                required
              />
              <label htmlFor="password">Hasło</label>
            </div>

            <button className="btn btn-primary w-100 py-2" type="submit">
              Zaloguj
            </button>
          </form>

          <p className="text-center text-body-secondary small mt-3 mb-0">
            Podaj dane konta odpowiednie dla wybranej roli.
          </p>
        </div>
      </div>

      <div className="text-center mt-3">
        <NavLink to="/" className="link-secondary">← Wróć do strony głównej</NavLink>
      </div>
    </div>
  </main>
);}

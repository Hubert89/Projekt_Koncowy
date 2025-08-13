import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../auth/types";

const friendly = {
  client: "KLIENT",
  admin: "ADMINISTRATOR",
  employee: "PRACOWNIK",
} as const;

export default function LoginPage() {
  const { role = "client" } = useParams<{ role: "client" | "admin" | "employee" }>();
  const title = friendly[role];
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
      // przekieruj wg roli zwróconej przez backend
      const savedRole = (localStorage.getItem("role") || "CLIENT") as Role;
      if (savedRole === "ADMIN") nav("/admin");
      else if (savedRole === "EMPLOYEE") nav("/employee");
      else nav("/client");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Błąd logowania");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "4rem auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
        <Link to="/login/client">KLIENT</Link>
        <Link to="/login/admin">ADMIN</Link>
        <Link to="/login/employee">PRACOWNIK</Link>
      </div>
      <h1>Logowanie – {title}</h1>
      <form onSubmit={onSubmit}>
        <label>Użytkownik</label>
        <input value={username} onChange={(e) => setU(e.target.value)} required />
        <label>Hasło</label>
        <input type="password" value={password} onChange={(e) => setP(e.target.value)} required />
        <button type="submit" style={{ marginTop: 12 }}>Zaloguj</button>
      </form>
      {error && <p style={{ color: "tomato" }}>❌ {error}</p>}
    </div>
  );
}

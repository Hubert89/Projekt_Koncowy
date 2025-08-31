import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const [tab, setTab] = useState<'CLIENT'|'ADMIN'|'EMPLOYEE'>('CLIENT'); // tylko UI
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      // przekierowanie zostanie zrobione przez PublicOnlyRoute przy wejściu na /login,
      // ale na wszelki wypadek robię domyślne:
      navigate('/client', { replace: true });
    } catch (err: any) {
      console.error('Login error', err?.response || err);
      setError(err?.response?.data?.message || 'Błąd logowania');
    }
  };

  const Tab = ({value, label}:{value:'CLIENT'|'ADMIN'|'EMPLOYEE';label:string}) => (
    <button type="button"
      className={'btn ' + (tab===value ? 'btn-primary' : 'btn-outline-primary')}
      onClick={() => setTab(value)}>{label}</button>
  );

  return (
    <main 
     style={{
      minHeight: "100vh",       // pełny ekran
      display: "grid",          // siatka
      justifyContent: "center",  
      alignItems: "start",
      rowGap: "0.75rem", 
      padding: "1rem",
      width: "100vw",           // pełna szerokość okna
      boxSizing: "border-box",
     }}>
    <div className="container pt-2 pb-1" style={{maxWidth: 760}}>
      <h1 className="h3 text-center mb-2">Logowanie — {tab}</h1>
      <div className="d-flex justify-content-center gap-2 mb-2">
        <Tab value="CLIENT" label="KLIENT" />
        <Tab value="ADMIN" label="ADMIN" />
        <Tab value="EMPLOYEE" label="PRACOWNIK" />
      </div>
    </div>
      <form onSubmit={submit} className="card shadow-sm mt-2">
        <div className="card-body p-3">
          <div className="mb-2">
            <label className="form-label">Użytkownik</label>
            <input className="form-control" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div className="mb-2">
            <label className="form-label">Hasło</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Zaloguj</button>
          <p className="text-center text-body-secondary small mt-2 mb-0">
            Podaj dane konta odpowiednie dla wybranej roli.
          </p>
        </div>
      </form>

      <div className="text-center mt-2">
        <NavLink to="/" className="link-secondary">← Wróć do strony głównej</NavLink>
      </div>
    </main>
  );
}

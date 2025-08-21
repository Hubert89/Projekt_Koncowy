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
      // ale na wszelki wypadek zrobimy domyślne:
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
    <main className="container py-5" style={{maxWidth: 760}}>
      <h1 className="h3 text-center mb-4">Logowanie — {tab}</h1>
      <div className="d-flex justify-content-center gap-2 mb-3">
        <Tab value="CLIENT" label="KLIENT" />
        <Tab value="ADMIN" label="ADMIN" />
        <Tab value="EMPLOYEE" label="PRACOWNIK" />
      </div>

      <form onSubmit={submit} className="card shadow-sm">
        <div className="card-body p-4">
          <div className="mb-3">
            <label className="form-label">Użytkownik</label>
            <input className="form-control" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Hasło</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Zaloguj</button>
          <p className="text-center text-body-secondary small mt-3 mb-0">
            Podaj dane konta odpowiednie dla wybranej roli.
          </p>
        </div>
      </form>

      <div className="text-center mt-3">
        <NavLink to="/" className="link-secondary">← Wróć do strony głównej</NavLink>
      </div>
    </main>
  );
}

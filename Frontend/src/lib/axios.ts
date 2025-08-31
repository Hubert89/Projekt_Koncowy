import axios from "axios";

/**
 * Używam Vite proxy: '/api' -> http://localhost:8080
 * Dlatego baseURL zostawiam PUSTE, a w wywołaniach podaję pełną ścieżkę z prefiksem '/api/...'
 */
const api = axios.create({
  baseURL: "", // ważne: PUSTE
  withCredentials: false,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

const apiNoAuth = axios.create({
  baseURL: "", // ważne: PUSTE
  withCredentials: false,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Bearer z localStorage dla zapytań wymagających autoryzacji
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// „Atrapa” (jeżeli gdzieś importuję)
export function setUserContext(_user?: unknown) { /* noop */ }

export { api, apiNoAuth };
export default api;

// src/lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * Źródło URL backendu:
 * - najpierw .env: VITE_API_URL (np. http://localhost:8080)
 * - fallback: http://localhost:8080
 */
const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL?.toString() || "http://localhost:8080";

/** Skąd bierzemy token (localStorage klucze zgodne z Twoją aplikacją) */
function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

/** Ewentualne czyszczenie sesji po 401 */
function clearSessionAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  if (!location.pathname.startsWith("/login")) {
    window.location.assign("/login/client");
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  // JWT leci w nagłówku Authorization, więc cookies nie są potrzebne:
  withCredentials: false,
  // Delikatny timeout, żeby nie wisieć w nieskończoność:
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/** REQUEST: dołącz Bearer token, jeśli istnieje */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token) {
    // Ustaw tylko jeśli nie ma już ręcznie ustawionego nagłówka
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/** RESPONSE: wyloguj TYLKO przy 401; 403 i reszta — bez auto-logout */
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err?.response?.status;

    // Backend niedostępny / brak odpowiedzi — nie wylogowuj użytkownika
    if (typeof status === "undefined") {
      return Promise.reject(err);
    }

    if (status === 401) {
      // nieprawidłowy / wygasły token → wyczyść i przekieruj
      clearSessionAndRedirect();
    }

    // 403 i inne statusy obsługuj lokalnie w komponentach
    return Promise.reject(err);
  }
);
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status = err?.response?.status;

//     // ❗️TYMCZASOWO: nic nie czyść ani nie przekierowuj
//     if (status === 401) {
//       console.warn("401 from API:", err.response?.data);
//       return Promise.reject(err);
//     }
//     if (status === 403) {
//       console.warn("403 from API (brak uprawnień):", err.response?.data);
//       return Promise.reject(err);
//     }
//     return Promise.reject(err);
//   }
// );









/** Helpery (opcjonalnie) */
export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export function setUserContext(opts: { role?: string | null; username?: string | null } = {}) {
  if (typeof opts.role !== "undefined") {
    opts.role ? localStorage.setItem("role", opts.role) : localStorage.removeItem("role");
  }
  if (typeof opts.username !== "undefined") {
    opts.username ? localStorage.setItem("username", opts.username) : localStorage.removeItem("username");
  }
}

export default api;

// src/lib/axios.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

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

/** Wyczyść sesję po 401 i przekieruj na login */
function clearSessionAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  if (!location.pathname.startsWith("/login")) {
    window.location.assign("/login/client");
  }
}

/** Domyślne nagłówki */
const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/** Główna instancja API */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 15000,
  headers: defaultHeaders,
});

/** REQUEST: dołącz token jeśli istnieje */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** RESPONSE: auto-logout tylko przy 401 */
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err?.response?.status;

    // Backend niedostępny → nie wylogowuj
    if (typeof status === "undefined") {
      return Promise.reject(err);
    }

    if (status === 401) {
      clearSessionAndRedirect();
    }

    return Promise.reject(err);
  }
);

/** Instancja bez auth (np. /api/auth/login) */
export const apiNoAuth: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 15000,
  headers: defaultHeaders,
});

/** Helpery */
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
    opts.username
      ? localStorage.setItem("username", opts.username)
      : localStorage.removeItem("username");
  }
}

export default api;

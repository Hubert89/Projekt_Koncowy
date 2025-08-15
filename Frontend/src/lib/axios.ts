// src/lib/axios.ts
import axios from "axios";

export const api = axios.create({});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      // wygasła/niepoprawna sesja – czyścimy i wracamy na login
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      if (!location.pathname.startsWith("/login")) {
        window.location.assign("/login/client");
      }
    }

    // 403: brak uprawnień → pozwól obsłużyć to w komponencie (bez redirectu)
    return Promise.reject(err);
  }
);

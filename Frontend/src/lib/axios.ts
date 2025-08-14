import axios from "axios";

export const api = axios.create({});

// dołącz token z localStorage do każdego requestu
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// przekieruj na /login przy 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const s = err?.response?.status;
    if (s === 401 || s === 403) {
      window.location.href = "/login/client"; // domyślne wejście
    }
    return Promise.reject(err);
  }
);

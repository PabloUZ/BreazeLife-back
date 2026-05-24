import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { secureStoreService } from "@/src/services/storage/SecureStoreService";

const BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Token storage keys ──────────────────────────────────────────────────────

export const TOKEN_KEYS = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

// ─── Refresh queue ───────────────────────────────────────────────────────────
// Si múltiples peticiones fallan a la vez con 401, solo se hace UN refresh.
// Las demás esperan en cola y se reintentan con el nuevo token.

let isRefreshing = false;
let queue: QueueEntry[] = [];

function flushQueue(error: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  queue = [];
}

// ─── Axios instance ──────────────────────────────────────────────────────────

export const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ─── Request interceptor ─────────────────────────────────────────────────────
// Adjunta el access token a cada petición saliente.

httpClient.interceptors.request.use(async (config) => {
  const token = await secureStoreService.getItem(TOKEN_KEYS.ACCESS);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ────────────────────────────────────────────────────
// En 401: refresca tokens y reintenta la petición original.
// En doble 401 (refresh inválido): limpia tokens y propaga el error.

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig;

    // Solo actuar en 401 y solo una vez por petición
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, encolar esta petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(httpClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await secureStoreService.getItem(TOKEN_KEYS.REFRESH);

      if (!refreshToken) {
        throw new Error("NO_REFRESH_TOKEN");
      }

      // Llamada directa con axios base para evitar pasar por el interceptor
      const { data } = await axios.post(
        `${BASE_URL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const newAccessToken: string = data.data.access_token;
      const newRefreshToken: string = data.data.refresh_token;

      await secureStoreService.setItem(TOKEN_KEYS.ACCESS, newAccessToken);
      await secureStoreService.setItem(TOKEN_KEYS.REFRESH, newRefreshToken);

      httpClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      flushQueue(null, newAccessToken);

      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return httpClient(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);

      // Limpiar tokens — la app debe redirigir al login
      await secureStoreService.deleteItem(TOKEN_KEYS.ACCESS);
      await secureStoreService.deleteItem(TOKEN_KEYS.REFRESH);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

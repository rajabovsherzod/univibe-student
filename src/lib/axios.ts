import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import { getSession, signOut } from "next-auth/react";
import { forceTokenRefresh } from "@/lib/session-updater";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }
}

const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Mutex: prevents parallel refresh calls when multiple requests get 401 simultaneously
let refreshPromise: Promise<string | null> | null = null;

axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Mutex: if a refresh is already in progress, wait for it
      if (!refreshPromise) {
        refreshPromise = (async () => {
          // forceTokenRefresh() calls update({ forceRefresh: true }) via the singleton
          // registered in useActivityTracker. This triggers the NextAuth JWT callback
          // on the server (trigger="update"), which calls refreshAccessToken() and
          // stores the new token in the session cookie.
          //
          // Unlike getSession() (GET /api/auth/session), update() (POST) DOES trigger
          // the JWT callback — so the expired token is actually refreshed server-side.
          return forceTokenRefresh();
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }

      // Refresh returned null — session is unrecoverable, sign out
      if (typeof window !== "undefined") {
        document.cookie = "user_data=;path=/;max-age=0;SameSite=Lax";
        localStorage.removeItem("univibe-profile");
        localStorage.removeItem("user-storage");
        localStorage.removeItem("user-profile-storage");
        sessionStorage.clear();
        signOut({ callbackUrl: `${window.location.origin}/login` });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import { getSession, signOut } from "next-auth/react";

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

      try {
        // If a refresh is already in progress, wait for it instead of starting a new one
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const session = await getSession();
            if (!session?.refreshToken) return null;

            const response = await axios.post(
              `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`,
              { refresh: session.refreshToken }
            );
            return response.data.access as string | null;
          })().finally(() => {
            refreshPromise = null; // Clear mutex after completion
          });
        }

        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (err: any) {
        console.log("[Axios] Token refresh failed permanently:", err?.message || err);
        // Refresh failed — force logout
        if (typeof window !== "undefined") {
          console.log("[Axios] Forcing client-side signOut()...");
          document.cookie = "user_data=;path=/;max-age=0;SameSite=Lax";
          localStorage.removeItem("univibe-profile");
          localStorage.removeItem("user-storage");
          localStorage.removeItem("user-profile-storage");
          sessionStorage.clear();
          signOut({ callbackUrl: `${window.location.origin}/login` });
        }
      }
    } else if (error.response?.status === 401) {
      console.log("[Axios] Received 401 but _retry is already true!", originalRequest.url);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

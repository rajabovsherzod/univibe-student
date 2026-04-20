import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import { getSession, signOut } from "next-auth/react";
import { forceTokenRefresh } from "@/lib/session-updater";
import { getLogoutUrl } from "@/lib/get-app-url";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiry?: number;
  }
}

const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Single-flight mutex ────────────────────────────────────────────────────────
// Shared between request (proactive) and response (401 retry) interceptors so
// that parallel requests never trigger more than one refresh at a time.
let refreshPromise: Promise<string | null> | null = null;

// Refresh proactively when < 2 min remain on the access token.
const PROACTIVE_THRESHOLD_MS = 2 * 60 * 1000;

// ── Request interceptor ────────────────────────────────────────────────────────
// Attaches the Bearer token.
// If the token is about to expire (< 2 min), silently refreshes it first so the
// request goes out with a fresh token — no 401 round-trip needed.
axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window === "undefined") return config;

    const session = await getSession();
    if (!session?.accessToken) return config;

    const expiry = session.accessTokenExpiry;
    const timeLeft = expiry ? expiry - Date.now() : Infinity;

    console.log("[Axios] Request interceptor running for:", config.url);
    if (timeLeft < PROACTIVE_THRESHOLD_MS) {
      console.log(`[Axios] Token nearing expiry (${timeLeft}ms left). Triggering proactive refresh.`);
      if (!refreshPromise) {
        refreshPromise = forceTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        console.log("[Axios] Proactive refresh succeeded, attaching new token.");
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }
      console.warn("[Axios] Proactive refresh failed, continuing with old token.");
    } else {
      console.log(`[Axios] Token healthy (${timeLeft}ms left)`);
    }

    config.headers.Authorization = `Bearer ${session.accessToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ───────────────────────────────────────────────────────
// On 401: attempt one token refresh, then retry the original request.
// Logout only when the refresh itself fails (refresh token expired/invalid).
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("[Axios] 401 Unauthorized encountered on request:", originalRequest.url);
      originalRequest._retry = true;

      if (!refreshPromise) {
        console.log("[Axios] Initiating forceTokenRefresh() to recover from 401");
        refreshPromise = forceTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        console.log("[Axios] 401 Recovery successful. Retrying original request to:", originalRequest.url);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }

      console.error("[Axios] 401 Recovery failed (new token is null). Forcing logout.");
      // Refresh token is expired/invalid → clear local state and sign out.
      if (typeof window !== "undefined") {
        document.cookie = "user_data=;path=/;max-age=0;SameSite=Lax";
        localStorage.removeItem("univibe-profile");
        localStorage.removeItem("user-storage");
        localStorage.removeItem("user-profile-storage");
        sessionStorage.clear();
        signOut({ callbackUrl: getLogoutUrl() });
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

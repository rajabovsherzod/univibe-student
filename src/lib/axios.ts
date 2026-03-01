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
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // For client-side rendering
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
        const session = await getSession();

        if (session?.refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`,
            { refresh: session.refreshToken }
          );

          if (response.data.access) {
            // Re-fire original request attached with fresh token
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          document.cookie = 'user_data=;path=/;max-age=0;SameSite=Lax';
          if (typeof window !== 'undefined') {
            localStorage.removeItem('univibe-profile');
            localStorage.removeItem('user-storage');
            localStorage.removeItem('user-profile-storage');
            sessionStorage.clear();
          }
          signOut({ callbackUrl: `${window.location.origin}/login` });
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

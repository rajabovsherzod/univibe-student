import { useMutation } from "@tanstack/react-query";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";
import { signIn } from "next-auth/react";

/** 1. SEND OTP */
export const useSendOTP = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post(
        API_CONFIG.endpoints.auth.otpSend,
        data
      );
      return response.data; // { message, expires_in_minutes }
    },
  });
};

/** 2. VERIFY OTP & REGISTER */
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      code: string;
      name: string;
      surname: string;
      university: string;
    }) => {
      const response = await axiosInstance.post(
        API_CONFIG.endpoints.auth.otpVerify,
        data
      );
      // Expected: { access, refresh, full_name, email, etc. }

      // Since it returns access/refresh right away, we force a NextAuth signIn session seamlessly
      await signIn("credentials", {
        redirect: false,
        access_token: response.data.access,
        refresh_token: response.data.refresh,
        email: response.data.email,
        full_name: response.data.full_name,
        role: "STUDENT"
      });

      return response.data;
    },
  });
};

/** 3. SET PASSWORD */
export const useSetPassword = () => {
  return useMutation({
    mutationFn: async (data: { password: string }) => {
      const response = await axiosInstance.post(
        API_CONFIG.endpoints.auth.passwordSet,
        data
      );
      return response.data;
    },
  });
};

/** 4. RESUME INCOMPLETE SIGNUP */
export const useResumeSignup = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post(
        API_CONFIG.endpoints.auth.resumeSignup,
        data
      );
      return response.data; // { message, expires_in_minutes }
    },
  });
};

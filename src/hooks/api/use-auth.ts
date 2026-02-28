import { useMutation } from "@tanstack/react-query";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";
import { signIn } from "next-auth/react";

/** Send OTP to email */
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

/** Verify OTP + register user (sends name, surname, university, password) */
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      code: string;
      name: string;
      surname: string;
      university: string;
      password: string;
    }) => {
      const response = await axiosInstance.post(
        API_CONFIG.endpoints.auth.otpVerify,
        data
      );
      // Response: { access, refresh, full_name, email, user_id, is_password_set }
      const result = response.data;

      // Auto sign-in via NextAuth credentials provider (direct token insertion)
      await signIn("credentials", {
        redirect: false,
        access_token: result.access,
        refresh_token: result.refresh,
        email: result.email,
        full_name: result.full_name,
        role: "STUDENT",
      });

      return result;
    },
  });
};

import { useMutation } from "@tanstack/react-query";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

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
      return response.data;
    },
  });
};

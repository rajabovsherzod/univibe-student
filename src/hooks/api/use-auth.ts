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

/** Send OTP for Forgot Password */
export const useForgotPasswordSendOTP = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post(
        API_CONFIG.endpoints.auth.forgotPasswordSend,
        data
      );
      return response.data; // { message, expires_in_minutes }
    },
  });
};

/** Verify OTP for Forgot Password */
export const useForgotPasswordVerifyOTP = () => {
  return useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await axiosInstance.post(
        API_CONFIG.endpoints.auth.forgotPasswordVerify,
        data
      );
      // Response: { access: string }
      return response.data;
    },
  });
};

/** Set new password (authenticated) */
export const useSetPassword = () => {
  return useMutation({
    mutationFn: async (data: { password: string; token: string }) => {
      const response = await axiosInstance.post(
        API_CONFIG.endpoints.auth.passwordSet,
        { password: data.password },
        { headers: { Authorization: `Bearer ${data.token}` } }
      );
      return response.data;
    },
  });
};

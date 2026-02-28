export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz",
  endpoints: {
    auth: {
      login: "/api/v1/user/auth/login/",           // email, password
      otpSend: "/api/v1/user/auth/otp/send/",      // email
      otpVerify: "/api/v1/user/auth/otp/verify/",  // email, code, name, surname, university
      passwordSet: "/api/v1/user/auth/password/set/",// password
      resumeSignup: "/api/v1/user/auth/resume-signup/", // email
      refresh: "/api/v1/user/auth/refresh/",       // typically requires refresh token
    },
    student: {
      profile: "/api/v1/user/student/profile/",    // placeholder for future profile fetch
    },
    university: {
      list: "/api/v1/university/",
    }
  },
};

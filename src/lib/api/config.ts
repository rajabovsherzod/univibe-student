export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz",
  endpoints: {
    auth: {
      login: "/api/v1/user/auth/login/",
      otpSend: "/api/v1/user/auth/otp/send/",
      otpVerify: "/api/v1/user/auth/otp/verify/",
      passwordSet: "/api/v1/user/auth/password/set/",
      resumeSignup: "/api/v1/user/auth/resume-signup/",
      refresh: "/api/v1/user/auth/refresh/",
    },
    student: {
      me: "/api/v1/student/me/",
      profile: "/api/v1/student/profile/",
    },
    university: {
      list: "/api/v1/university/",
    },
    faculty: {
      list: "/api/v1/university/faculties/",
    },
    degreeLevel: {
      list: "/api/v1/university/degree-levels/",
    },
    yearLevel: {
      list: "/api/v1/university/year-levels/",
    },
    leaderboard: {
      list: "/api/v1/coins/leaderboard/",
      me: "/api/v1/coins/leaderboard/me/",
    },
    telegram: {
      account: "/api/v1/telegram/account/",
      connectLink: "/api/v1/telegram/connect-link/",
    },
    market: {
      products: "/api/v1/market/products/",
    },
  },
};

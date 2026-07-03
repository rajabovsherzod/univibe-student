export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz",
  endpoints: {
    auth: {
      login: "/api/v1/user/auth/login/",
      otpSend: "/api/v1/user/auth/otp/send/",
      otpVerify: "/api/v1/user/auth/otp/verify/",
      forgotPasswordSend: "/api/v1/user/auth/password/forgot/send/",
      forgotPasswordVerify: "/api/v1/user/auth/password/forgot/verify/",
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
    coins: {
      balance: "/api/v1/coins/student/balance/",
      transactions: "/api/v1/coins/student/transactions/",
    },
    market: {
      products: "/api/v1/market/products/",
      orders: "/api/v1/market/orders/",
      orderCreate: "/api/v1/market/orders/create/",
    },
    events: {
      list: "/api/v1/student/events/",
      detail: (id: string) => `/api/v1/student/events/${id}/`,
      register: (id: string) => `/api/v1/student/events/${id}/register/`,
      cancelRegistration: (id: string) => `/api/v1/student/events/${id}/cancel-registration/`,
      myQr: (id: string) => `/api/v1/student/events/${id}/my-qr/`,
      confirmAttendance: (id: string) => `/api/v1/student/events/${id}/confirm-attendance/`,
    },
    clubs: {
      list: "/api/v1/clubs/",
      detail: (id: string) => `/api/v1/clubs/${id}/`,
      follow: (id: string) => `/api/v1/clubs/${id}/follow/`,
      unfollow: (id: string) => `/api/v1/clubs/${id}/unfollow/`,
      myFollowed: "/api/v1/me/followed-clubs",
      managed: "/api/v1/me/managed-clubs",
      update: (id: string) => `/api/v1/clubs/${id}/`,
      members: (id: string) => `/api/v1/clubs/${id}/members/`,
      memberRemove: (id: string, studentId: string) => `/api/v1/clubs/${id}/members/${studentId}/`,
      memberRole: (id: string, studentId: string) => `/api/v1/clubs/${id}/members/${studentId}/role/`,
      roles: (id: string) => `/api/v1/clubs/${id}/roles/`,
      followers: (id: string) => `/api/v1/clubs/${id}/followers/`,
    },
  },
};

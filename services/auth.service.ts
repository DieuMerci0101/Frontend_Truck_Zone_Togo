import api from "./api";
import type {
  User,
  UserLogin,
  UserRegister,
  TokenResponse,
  UserUpdate,
  ChangePassword,
  ForgotPassword,
  VerifyOTP,
  ResetPassword,
} from "@/types";

export const authService = {
  register: (data: UserRegister) =>
    api.post<User>("/api/auth/register", data).then((r) => r.data),

  login: (data: UserLogin) =>
    api.post<TokenResponse>("/api/auth/login", data).then((r) => r.data),

  adminLogin: (data: UserLogin) =>
    api.post<TokenResponse>("/api/auth/admin/login", data).then((r) => r.data),

  getMe: () =>
    api.get<User>("/api/auth/me").then((r) => r.data),

  updateMe: (data: UserUpdate) =>
    api.put<User>("/api/auth/me", data).then((r) => r.data),

  changePassword: (data: ChangePassword) =>
    api.put<{ message: string }>("/api/auth/change-password", data).then((r) => r.data),

  forgotPassword: (data: ForgotPassword) =>
    api.post<{ message: string }>("/api/auth/forgot-password", data).then((r) => r.data),

  verifyOtp: (data: VerifyOTP) =>
    api.post<{ message: string; valid: boolean }>("/api/auth/verify-otp", data).then((r) => r.data),

  resetPassword: (data: ResetPassword) =>
    api.post<{ message: string }>("/api/auth/reset-password", data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<TokenResponse>("/api/auth/refresh", { refresh_token: refreshToken }).then((r) => r.data),

  logout: () =>
    api.post<{ message: string }>("/api/auth/logout").then((r) => r.data),
};

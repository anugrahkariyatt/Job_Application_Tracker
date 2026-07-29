import axiosInstance from "@/lib/axios";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CurrentUserResponse,
  LogoutResponse,
  User,
} from "@/types/auth.types";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/api/auth/login",
    data,
  );
  return response.data;
};

export const register = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>(
    "/api/auth/register",
    data,
  );
  return response.data;
};

export const logout = async (): Promise<LogoutResponse> => {
  const response = await axiosInstance.post<LogoutResponse>("/api/auth/logout");

  return response.data;
};

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response =
    await axiosInstance.get<CurrentUserResponse>("/api/auth/profile");
  return response.data;
};

export const refresh = async (): Promise<void> => {
  await axiosInstance.post<CurrentUserResponse>("/api/auth/refresh");
};

export const resendVerificationEmail = async (email: string) => {
  const { data } = await axiosInstance.post(
    "/api/auth/resend-verification-email",
    {
      email,
    },
  );

  return data;
};

export const verifyEmail = async (token: string) => {
  const { data } = await axiosInstance.get(
    `/api/auth/verify-email?token=${token}`,
  );

  return data;
};

// Google Auth

export interface GoogleAuthRequest {
  idToken?: string;
  accessToken?: string;
  role: "candidate" | "recruiter";
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  user: User;
}

export const googleAuth = async (
  data: GoogleAuthRequest,
): Promise<GoogleAuthResponse> => {
  const response = await axiosInstance.post<GoogleAuthResponse>(
    "/api/auth/google",
    data,
  );

  return response.data;
};
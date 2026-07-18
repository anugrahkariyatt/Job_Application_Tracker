export type UserRole = "candidate" | "recruiter" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  preferences?: {
    applicationReceived: boolean;
    candidateWithdrew: boolean;
    jobExpiring: boolean;
    companyUpdates: boolean;
    systemAlerts: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "candidate" | "recruiter";
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface CurrentUserResponse {
  success: boolean;
  user: User;
}
export interface LogoutResponse {
  success: boolean;
  message: string;
}

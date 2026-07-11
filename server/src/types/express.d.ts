declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: "candidate" | "recruiter" | "admin";
      isVerified: boolean;
      isActive: boolean;
    }

    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
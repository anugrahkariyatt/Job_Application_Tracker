import { z } from "zod";

// ========================================
//  Add password complexit before deploy
// ========================================
export const registerSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters").max(50),

  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),

  role: z.enum(["candidate", "recruiter"], {
    error: "Role must be either candidate or recruiter",
  }),
});
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});
export const verifyPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updatePasswordSchema = z.object({
  token: z.string().min(1, "Password verification token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResendVerificationEmailInput = z.infer<typeof forgotPasswordSchema>;
export const updatePreferencesSchema = z.object({
  preferences: z.object({
    applicationReceived: z.boolean().optional(),
    candidateWithdrew: z.boolean().optional(),
    jobExpiring: z.boolean().optional(),
    companyUpdates: z.boolean().optional(),
    systemAlerts: z.boolean().optional(),
  }),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

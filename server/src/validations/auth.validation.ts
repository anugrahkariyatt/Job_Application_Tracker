import { z } from "zod";

export const complexPasswordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const registerSchema = z.object({
  name: z.string().trim().min(3, "Full name must be at least 3 characters").max(50),
  email: z.string().trim().min(1, "Email address is required").email("Invalid email address"),
  password: complexPasswordSchema,
  role: z.enum(["candidate", "recruiter"], {
    message: "Role must be either candidate or recruiter",
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email address is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address cannot be empty or contain only spaces")
    .email("Invalid email address format")
    .refine((val) => !/\s/.test(val), "Email address cannot contain spaces"),
});

export const verifyPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const updatePasswordSchema = z.object({
  token: z.string().min(1, "Password verification token is required"),
  password: complexPasswordSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: complexPasswordSchema,
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

export const updateProfileSchema = z.object({
  name: z.string().trim().min(3, "Full name must be at least 3 characters").max(50),
  email: z.string().trim().min(1, "Email address is required").email("Invalid email address"),
});


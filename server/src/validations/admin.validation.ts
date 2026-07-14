import { z } from "zod";

export const getUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const getCompanySchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
});

export const updateCompanyVerificationSchema = z.object({
  verified: z.boolean(),
});

export const updateCompanyStatusSchema = z.object({
  isActive: z.boolean(),
});

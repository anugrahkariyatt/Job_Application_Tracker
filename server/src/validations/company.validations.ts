import { z } from "zod";

export const registerCompanySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(3, "Company name must be at least 3 characters")
    .max(50, "Company name must not exceed 50 characters"),

  industry: z
    .string()
    .trim()
    .min(2, "Industry is required")
    .max(50, "Industry must not exceed 50 characters"),
});

export const updateCompanySchema = z.object({
  companyName: z.string().min(3).max(100).optional(),
  industry: z.string().min(2).max(50).optional(),
  companySize: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  foundedYear: z.number().optional(),
  headquarters: z.string().optional(),
  address: z.string().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  facebook: z.string().url().optional(),
});

export type CreateCompanyInput = z.infer<typeof registerCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

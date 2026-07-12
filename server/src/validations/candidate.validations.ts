import { z } from "zod";

export const createCandidateSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),

  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(100, "Location cannot exceed 100 characters"),

  headline: z
    .string()
    .trim()
    .min(5, "Headline must be at least 5 characters")
    .max(100, "Headline cannot exceed 100 characters"),

  bio: z
    .string()
    .trim()
    .min(20, "Bio must be at least 20 characters")
    .max(1000, "Bio cannot exceed 1000 characters"),

  portfolio: z
    .string()
    .trim()
    .url("Invalid portfolio URL")
    .optional()
    .or(z.literal("")),

  github: z
    .string()
    .trim()
    .url("Invalid GitHub URL")
    .optional()
    .or(z.literal("")),

  linkedin: z
    .string()
    .trim()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
});
export const updateCandidateSchema = createCandidateSchema.partial();

export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;

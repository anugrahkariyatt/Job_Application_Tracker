import { z } from "zod";

export const createJobAlertSchema = z.object({
  keywords: z
    .array(z.string().min(1))
    .min(1, "At least one keyword is required"),

  location: z.string(),

  employmentType: z.enum([
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
  ]),

  remote: z.boolean(),
  frequency: z.enum(["Daily", "Weekly", "Monthly"]).optional(),
});

export const updateJobAlertSchema = z.object({
  keywords: z
    .array(z.string().min(1))
    .min(1, "At least one keyword is required")
    .optional(),

  location: z.string().optional(),

  employmentType: z.enum([
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
  ]).optional(),

  remote: z.boolean().optional(),
  frequency: z.enum(["Daily", "Weekly", "Monthly"]).optional(),
  isActive: z.boolean().optional(),
});

export const getJobAlertSchema = z.object({
  jobAlertId: z.string().min(1, "Job Alert ID is required"),
});

export type CreateJobAlertInput = z.infer<typeof createJobAlertSchema>;
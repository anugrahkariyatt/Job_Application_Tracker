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
});

export const updateJobAlertSchema = createJobAlertSchema;

export const getJobAlertSchema = z.object({
  jobAlertId: z.string().min(1, "Job Alert ID is required"),
});

export type CreateJobAlertInput = z.infer<typeof createJobAlertSchema>;
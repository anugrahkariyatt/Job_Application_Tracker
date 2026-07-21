import { z } from "zod";

export const createInterviewSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  date: z.coerce.date(),
  type: z.enum(["Video Call", "Onsite", "Phone"]),
  link: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const updateInterviewStatusSchema = z.object({
  status: z.enum(["Scheduled", "Completed", "Cancelled"]),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewStatusInput = z.infer<typeof updateInterviewStatusSchema>;

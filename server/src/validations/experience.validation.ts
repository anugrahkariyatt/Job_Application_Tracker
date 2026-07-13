import { z } from "zod";

const experienceBaseSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters"),

  jobTitle: z
    .string()
    .trim()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title cannot exceed 100 characters"),

  employmentType: z.enum([
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
    "Freelance",
  ]),

  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(100, "Location cannot exceed 100 characters"),

  startDate: z.coerce.date(),

  endDate: z.coerce.date().optional(),

  currentlyWorking: z.boolean(),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

export const createExperienceSchema = experienceBaseSchema
  .refine(
    (data) => {
      if (data.currentlyWorking) {
        return true;
      }

      return data.endDate !== undefined;
    },
    {
      message: "End date is required unless currently working",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.endDate) {
        return true;
      }

      return data.endDate >= data.startDate;
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    },
  );

export const updateExperienceSchema = experienceBaseSchema
  .partial()
  .refine(
    (data) => {
      if (data.currentlyWorking === true) {
        return true;
      }

      if (data.currentlyWorking === false && data.startDate) {
        return data.endDate !== undefined;
      }

      return true;
    },
    {
      message: "End date is required unless currently working",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return data.endDate >= data.startDate;
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    },
  );

export const getExperienceSchema = z.object({
  experienceId: z.string().min(1, "Experience ID is required"),
});

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;

export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;

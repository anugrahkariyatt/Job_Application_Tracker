import { z } from "zod";

const educationBaseSchema = z.object({
  institution: z
    .string()
    .trim()
    .min(2, "Institution name must be at least 2 characters")
    .max(100, "Institution name cannot exceed 100 characters"),

  degree: z
    .string()
    .trim()
    .min(2, "Degree is required")
    .max(100, "Degree cannot exceed 100 characters"),

  fieldOfStudy: z
    .string()
    .trim()
    .min(2, "Field of study is required")
    .max(100, "Field of study cannot exceed 100 characters"),

  startDate: z.coerce.date(),

  endDate: z.coerce.date().optional(),

  currentlyStudying: z.boolean(),

  grade: z
    .string()
    .trim()
    .max(50, "Grade cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

export const createEducationSchema = educationBaseSchema
  .refine(
    (data) => {
      if (data.currentlyStudying) {
        return true;
      }

      return data.endDate !== undefined;
    },
    {
      message: "End date is required unless currently studying",
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

export const updateEducationSchema = educationBaseSchema
  .partial()
  .refine(
    (data) => {
      if (data.currentlyStudying === true) {
        return true;
      }

      if (data.currentlyStudying === false && data.startDate) {
        return data.endDate !== undefined;
      }

      return true;
    },
    {
      message: "End date is required unless currently studying",
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

export const getEducationSchema = z.object({
  educationId: z.string().min(1, "Education ID is required"),
});

export type CreateEducationInput = z.infer<typeof createEducationSchema>;

export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;

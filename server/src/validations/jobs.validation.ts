import { z } from "zod";

export const createJobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Job title must be at least 3 characters")
      .max(50, "Job title cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters"),

    requirements: z
      .string()
      .trim()
      .min(10, "Requirements must be at least 10 characters"),

    responsibilities: z
      .string()
      .trim()
      .min(10, "Responsibilities must be at least 10 characters"),

    skills: z.array(z.string().trim()).min(1, "At least one skill is required"),

    employmentType: z.enum([
      "Full-time",
      "Part-time",
      "Internship",
      "Contract",
      "Freelance",
    ]),

    experienceLevel: z.enum([
      "Fresher",
      "Junior",
      "Mid-Level",
      "Senior",
      "Lead",
    ]),

    salaryMin: z.number().nonnegative("Minimum salary cannot be negative"),

    salaryMax: z.number().nonnegative("Maximum salary cannot be negative"),

    location: z.string().trim().min(2, "Location is required"),

    remote: z.boolean(),

    vacancies: z.number().int().positive("Vacancies must be greater than 0"),

    applicationDeadline: z.coerce.date(),

    status: z.enum(["Open", "Closed", "Draft"]).optional(),
  })
  .refine((data) => data.salaryMax >= data.salaryMin, {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salaryMax"],
  });

export const getJobSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

export const updateJobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Job title must be at least 3 characters")
      .max(100, "Job title cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters"),

    requirements: z
      .string()
      .trim()
      .min(10, "Requirements must be at least 10 characters"),

    responsibilities: z
      .string()
      .trim()
      .min(10, "Responsibilities must be at least 10 characters"),

    skills: z.array(z.string().trim()),

    employmentType: z.enum([
      "Full-time",
      "Part-time",
      "Internship",
      "Contract",
      "Freelance",
    ]),

    experienceLevel: z.enum([
      "Fresher",
      "Junior",
      "Mid-Level",
      "Senior",
      "Lead",
    ]),

    salaryMin: z.number().nonnegative(),

    salaryMax: z.number().nonnegative(),

    location: z.string().trim(),

    remote: z.boolean(),

    vacancies: z.number().int().positive(),

    applicationDeadline: z.coerce.date(),

    status: z.enum(["Open", "Closed", "Draft"]),
  })
  .partial()
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMax >= data.salaryMin,
    {
      message: "Maximum salary must be greater than or equal to minimum salary",
      path: ["salaryMax"],
    },
  );

export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;

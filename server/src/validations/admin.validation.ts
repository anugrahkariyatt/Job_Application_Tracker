import { z } from "zod";

// Helper regex to ensure valid MongoDB ObjectId hex string
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = (fieldName: string) =>
  z.string()
    .trim()
    .min(1, `${fieldName} is required`)
    .regex(objectIdRegex, `Invalid ${fieldName} format`);

export const getUserSchema = z.object({
  userId: objectIdSchema("User ID"),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    message: "isActive status must be a boolean",
  }),
});

export const getCompanySchema = z.object({
  companyId: objectIdSchema("Company ID"),
});

export const updateCompanyVerificationSchema = z.object({
  verified: z.boolean({
    message: "verified status must be a boolean",
  }),
});

export const updateCompanyStatusSchema = z.object({
  isActive: z.boolean({
    message: "isActive status must be a boolean",
  }),
});

export const getJobSchema = z.object({
  jobId: objectIdSchema("Job ID"),
});

export const getApplicationSchema = z.object({
  applicationId: objectIdSchema("Application ID"),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["Applied", "Under Review", "Shortlisted", "Interview", "Rejected", "Hired"], {
    message: "Invalid application status value",
  }),
});


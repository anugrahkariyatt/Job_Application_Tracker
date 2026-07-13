import { z } from "zod";

export const applyJobSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

export const getApplicationSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "Applied",
    "Under Review",
    "Shortlisted",
    "Rejected",
    "Hired",
  ]),
});
export const getJobApplicationsSchema = applyJobSchema;

export type ApplyJobInput = z.infer<typeof applyJobSchema>;

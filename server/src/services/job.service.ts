import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateJobInput,
  UpdateJobInput,
} from "../validations/jobs.validation.js";

export const createJob = async (ownerId: string, data: CreateJobInput) => {
  const company = await Company.findOne({ ownerId });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const job = await Job.create({
    companyId: company._id,
    ...data,
  });

  return job;
};

export const getMyJobs = async (ownerId: string) => {
  const company = await Company.findOne({ ownerId });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const jobs = await Job.find({
    companyId: company._id,
  }).sort({
    createdAt: -1,
  });

  return jobs;
};

export const getJobById = async (jobId: string) => {
  const job = await Job.findById(jobId).populate(
    "companyId",
    "companyName logo headquarters",
  );

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

export const updateJob = async (
  ownerId: string,
  jobId: string,
  data: UpdateJobInput,
) => {
  const company = await Company.findOne({
    ownerId,
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.companyId.toString() !== company._id.toString()) {
    throw new AppError("You are not authorized to update this job", 403);
  }

  Object.assign(job, data);

  await job.save();

  return job;
};

export const deleteJob = async (ownerId: string, jobId: string) => {
  const company = await Company.findOne({
    ownerId,
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.companyId.toString() !== company._id.toString()) {
    throw new AppError("You are not authorized to delete this job", 403);
  }
  await job.deleteOne();

  return;
};

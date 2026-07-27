import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { processJobAlertsForNewJob } from "./jobAlert.service.js";
import { notifyCompanySubscribers } from "./subscription.service.js";
import {
  CreateJobInput,
  UpdateJobInput,
  UpdateJobStatusInput,
} from "../validations/jobs.validation.js";

const FREE_RECRUITER_MAX_JOBS = 3;

export const createJob = async (ownerId: string, data: CreateJobInput) => {
  const user = await User.findById(ownerId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const company = await Company.findOne({ ownerId });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  if (user.subscriptionPlan === "free") {
    const activeJobsCount = await Job.countDocuments({
      companyId: company._id,
      status: "Open",
    });

    if (activeJobsCount >= FREE_RECRUITER_MAX_JOBS) {
      throw new AppError(
        `Free accounts can have a maximum of ${FREE_RECRUITER_MAX_JOBS} active job posts. Upgrade to Recruiter Pro for unlimited job listings!`,
        400,
      );
    }
  }

  const job = await Job.create({
    companyId: company._id,
    ...data,
  });

  // Asynchronously match job alerts + notify company subscribers (with de-duplication)
  (async () => {
    try {
      const notifiedViaJobAlert = await processJobAlertsForNewJob(job);
      await notifyCompanySubscribers(job, notifiedViaJobAlert);
    } catch (err) {
      console.error("[JOB SERVICE] Error triggering notifications:", err);
    }
  })();

  return job;
};


export const getMyJobs = async (
  ownerId: string,
  filters: { search?: string; status?: string; page?: number; limit?: number } = {}
) => {
  const company = await Company.findOne({ ownerId });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const query: any = { companyId: company._id };

  if (filters.status && filters.status !== "All") {
    query.status = filters.status;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { title: searchRegex },
      { location: searchRegex },
      { skills: { $in: [searchRegex] } },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 9;
  const skip = (page - 1) * limit;

  const totalCount = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { jobs, totalCount };
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

export const updateJobStatus = async (
  ownerId: string,
  jobId: string,
  status: UpdateJobStatusInput["status"],
) => {
  const company = await Company.findOne({ ownerId });

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

  if (job.status === status) {
    throw new AppError(`Job is already ${status.toLowerCase()}`, 400);
  }

  job.status = status;

  await job.save();

  return job;
};

import Candidate from "../models/candidate.model.js";
import Skill from "../models/skill.model.js";
import Experience from "../models/experience.model.js";
import Education from "../models/education.model.js";
import { getCandidateAIMatch } from "./gemini.service.js";

export const getCandidateJobAIMatch = async (userId: string, jobId: string) => {
  const candidate = await Candidate.findOne({ userId });
  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const skills = await Skill.find({ candidateId: candidate._id }).select("name");
  const experiences = await Experience.find({ candidateId: candidate._id });
  const educations = await Education.find({ candidateId: candidate._id });

  const candidateData = {
    fullName: user.name,
    headline: candidate.headline || "",
    summary: candidate.bio || "",
    skills: skills.map((s) => s.name),
    experience: experiences.map((exp) => `${exp.jobTitle} at ${exp.companyName}. ${exp.description || ""}`),
    education: educations.map((edu) => `${edu.degree} in ${edu.fieldOfStudy || ""} from ${edu.institution}`),
    resumeUrl: candidate.resumeUrl || "",
  };

  const jobData = {
    title: job.title,
    description: job.description || "",
    requiredSkills: Array.isArray(job.skills) ? job.skills : [],
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [job.responsibilities || ""],
    qualifications: Array.isArray(job.requirements) ? job.requirements : [job.requirements || ""],
    location: job.location || "",
    employmentType: job.employmentType || "",
  };

  console.log(`[CANDIDATE AI MATCH SERVICE] Running Gemini AI match for Candidate "${user.name}" against Job "${job.title}"...`);
  const aiResult = await getCandidateAIMatch(candidateData, jobData);
  return aiResult;
};

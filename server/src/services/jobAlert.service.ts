import Candidate from "../models/candidate.model.js";
import JobAlert from "../models/jobAlert.model.js";
import { AppError } from "../utils/AppError.js";

const MAX_JOB_ALERTS = 10;

export const createJobAlert = async (
  userId: string,
  keywords: string[],
  location: string,
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship",
  remote: boolean,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const totalAlerts = await JobAlert.countDocuments({
    candidateId: candidate._id,
  });

  if (totalAlerts >= MAX_JOB_ALERTS) {
    throw new AppError(
      `You can create a maximum of ${MAX_JOB_ALERTS} job alerts`,
      400,
    );
  }

  const jobAlert = await JobAlert.create({
    candidateId: candidate._id,
    keywords,
    location,
    employmentType,
    remote,
  });

  return jobAlert;
};

export const getMyJobAlerts = async (userId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const jobAlerts = await JobAlert.find({
    candidateId: candidate._id,
  });

  return jobAlerts;
};

export const updateJobAlert = async (
  userId: string,
  jobAlertId: string,
  keywords: string[],
  location: string,
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship",
  remote: boolean,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const jobAlert = await JobAlert.findById(jobAlertId);

  if (!jobAlert) {
    throw new AppError("Job alert not found", 404);
  }

  if (jobAlert.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError("You are not authorized to update this job alert", 403);
  }

  jobAlert.keywords = keywords;
  jobAlert.location = location;
  jobAlert.employmentType = employmentType;
  jobAlert.remote = remote;

  await jobAlert.save();

  return jobAlert;
};

export const deleteJobAlert = async (userId: string, jobAlertId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const jobAlert = await JobAlert.findById(jobAlertId);

  if (!jobAlert) {
    throw new AppError("Job alert not found", 404);
  }

  if (jobAlert.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError("You are not authorized to delete this job alert", 403);
  }

  await jobAlert.deleteOne();

  return;
};

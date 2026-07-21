import Application from "../models/application.model.js";
import Candidate from "../models/candidate.model.js";
import CompanyProfile from "../models/company.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { IApplication } from "../models/application.model.js";
import { createNotification } from "./notification.service.js";
import {
  sendApplicationStatusEmail,
  sendApplicationSubmittedEmail,
} from "./mail.service.js";

export const applyForJob = async (userId: string, jobId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }
  if (job.status !== "Open") {
    throw new AppError("Job is not accepting applications", 400);
  }
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }
  const existingApplication = await Application.findOne({
    candidateId: candidate._id,
    jobId,
  });
  if (existingApplication) {
    throw new AppError("You have already applied for this job", 400);
  }
  const company = await CompanyProfile.findById(job.companyId);
  if (!company) {
    throw new AppError("Company not found", 404);
  }
  const application = await Application.create({
    candidateId: candidate._id,
    jobId: job._id,
    companyId: job.companyId,
  });

  await sendApplicationSubmittedEmail({
    email: user.email,
    candidateName: user.name,
    jobTitle: job.title,
    companyName: company.companyName,
    applicationDate: new Date().toLocaleDateString(),
  });
  return application;
};
export const FetchAllAppliedApplications = async (userId: string) => {
  const candidate = await Candidate.findOne({ userId });
  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const applications = await Application.find({
    candidateId: candidate._id,
  }).populate({
    path: "jobId",
    populate: {
      path: "companyId",
    },
  });

  return applications;
};

export const deleteApplication = async (
  userId: string,
  applicationId: string,
) => {
  const candidate = await Candidate.findOne({ userId });
  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }
  const application = await Application.findOne({ _id: applicationId });
  if (!application) {
    throw new AppError("Application not found", 404);
  }
  if (application.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError(
      "You are not authorized to delete this application",
      403,
    );
  }
  await application.deleteOne();
  return;
};

// recruiter
export const getApplicationsByJob = async (userId: string, jobId: string) => {
  const company = await CompanyProfile.findOne({ ownerId: userId });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.companyId.toString() !== company._id.toString()) {
    throw new AppError("You are not authorized to access this job", 403);
  }

  const applications = await Application.find({
    jobId: job._id,
  }).populate("candidateId");

  return applications;
};
export const updateApplicationStatus = async (
  userId: string,
  applicationId: string,
  status: IApplication["status"],
) => {
  const company = await CompanyProfile.findOne({ ownerId: userId });
  if (!company) {
    throw new AppError("Company not found", 404);
  }
  const application = await Application.findById(applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }
  if (application.companyId.toString() !== company._id.toString()) {
    throw new AppError(
      "You are not authorized to update this application",
      403,
    );
  }
  if (application.status === status) {
    throw new AppError(
      `Application is already in the ${application.status} status`,
      400,
    );
  }
  application.status = status;
  await application.save();

  const candidate = await Candidate.findById(application.candidateId);

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const user = await User.findById(candidate.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }
  const job = await Job.findById(application.jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }
  let title = "";
  let message = "";

  switch (status) {
    case "Applied":
      title = "Application Received";
      message = "Your application has been received.";
      break;

    case "Under Review":
      title = "Application Under Review";
      message = "Your application is now under review.";
      break;

    case "Shortlisted":
      title = "Application Shortlisted";
      message = "Congratulations! You have been shortlisted.";
      break;

    case "Rejected":
      title = "Application Rejected";
      message = "Unfortunately, your application was not selected.";
      break;

    case "Hired":
      title = "Congratulations!";
      message = "Congratulations! You have been hired.";
      break;
  }
  await createNotification(
    candidate.userId.toString(),
    title,
    message,
    "APPLICATION",
  );

  await sendApplicationStatusEmail({
    email: user.email,
    candidateName: user.name,
    jobTitle: job.title,
    companyName: company.companyName,
    status: application.status,
  });

  return application;
};

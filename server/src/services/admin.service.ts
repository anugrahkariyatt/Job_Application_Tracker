import User from "../models/user.model.js";
import Candidate from "../models/candidate.model.js";
import CompanyProfile from "../models/company.model.js";
import Job from "../models/job.model.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";

export const getDashboard = async () => {
  const totalUsers = await User.countDocuments();

  const totalCandidates = await Candidate.countDocuments();

  const totalRecruiters = await User.countDocuments({
    role: "recruiter",
  });

  const totalCompanies = await CompanyProfile.countDocuments();

  const totalJobs = await Job.countDocuments();

  return {
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalCompanies,
    totalJobs,
  };
};

export const getAllUsers = async () => {
  const users = await User.find().select("-password");

  return users;
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "admin") {
    throw new AppError("Admin account cannot be modified", 403);
  }

  if (user.isActive === isActive) {
    throw new AppError(
      `User is already ${isActive ? "active" : "inactive"}`,
      400,
    );
  }

  user.isActive = isActive;

  await user.save();

  return user;
};

// compnay control

export const getAllCompanies = async () => {
  const companies = await CompanyProfile.find().populate({
    path: "ownerId",
    select: "name email",
  });

  return companies;
};

export const updateCompanyVerification = async (
  companyId: string,
  verified: boolean,
) => {
  const company = await CompanyProfile.findById(companyId);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  if (company.verified === verified) {
    throw new AppError(
      `Company is already ${verified ? "verified" : "unverified"}`,
      400,
    );
  }

  company.verified = verified;

  await company.save();
  let title = "";
  let message = "";

  if (verified) {
    title = "Company Verified";
    message =
      "Congratulations! Your company profile has been verified. You can now continue using all company features.";
  } else {
    title = "Company Verification Removed";
    message =
      "Your company verification has been removed. Please contact support if you believe this is a mistake.";
  }

  await createNotification(
    company.ownerId.toString(),
    title,
    message,
    "SYSTEM",
  );

  return company;
};

export const updateCompanyStatus = async (
  companyId: string,
  isActive: boolean,
) => {
  const company = await CompanyProfile.findById(companyId);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  if (company.isActive === isActive) {
    throw new AppError(
      `Company is already ${isActive ? "active" : "inactive"}`,
      400,
    );
  }

  company.isActive = isActive;

  await company.save();

  let title = "";
  let message = "";

  if (isActive) {
    title = "Company Account Reactivated";
    message =
      "Your company account has been reactivated. You can now access all company features.";
  } else {
    title = "Company Account Suspended";
    message =
      "Your company account has been suspended. You cannot post or manage jobs until your account is reactivated.";
  }

  await createNotification(
    company.ownerId.toString(),
    title,
    message,
    "SYSTEM",
  );

  return company;

  return company;
};

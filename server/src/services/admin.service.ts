import User from "../models/user.model.js";
import Candidate from "../models/candidate.model.js";
import CompanyProfile from "../models/company.model.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import Subscription from "../models/subscription.model.js";
import JobAlert from "../models/jobAlert.model.js";
import { AppError } from "../utils/AppError.js";

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

  return company;
};

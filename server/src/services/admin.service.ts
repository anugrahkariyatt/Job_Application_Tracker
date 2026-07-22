import User from "../models/user.model.js";
import Candidate from "../models/candidate.model.js";
import CompanyProfile from "../models/company.model.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";
import { deleteUserService } from "./auth.service.js";

export const getDashboard = async () => {
  const totalUsers = await User.countDocuments();

  const totalCandidates = await Candidate.countDocuments();

  const totalRecruiters = await User.countDocuments({
    role: "recruiter",
  });

  const totalCompanies = await CompanyProfile.countDocuments();

  const totalJobs = await Job.countDocuments();

  const totalApplications = await Application.countDocuments();

  // Generate 6 months data for charts
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData: any[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthName = monthNames[month];
    
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    const usersCount = await User.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const companiesCount = await CompanyProfile.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const jobsCount = await Job.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    chartData.push({
      name: `${monthName} ${year.toString().slice(-2)}`,
      Users: usersCount,
      Companies: companiesCount,
      Jobs: jobsCount
    });
  }

  return {
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalCompanies,
    totalJobs,
    totalApplications,
    chartData,
  };
};

export const getAllUsers = async (query: {
  search?: string;
  role?: string;
  status?: string;
}) => {
  const filter: any = {};

  if (query.role && query.role !== "all") {
    filter.role = query.role;
  }

  if (query.status && query.status !== "all") {
    filter.isActive = query.status === "Active";
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
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

export const getAllCompanies = async (query: {
  search?: string;
  status?: string;
  verified?: string;
}) => {
  const filter: any = {};

  if (query.status && query.status !== "all") {
    filter.isActive = query.status === "Active";
  }

  if (query.verified !== undefined && query.verified !== "") {
    filter.verified = query.verified === "true";
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [
      { companyName: searchRegex },
      { website: searchRegex },
      { industry: searchRegex },
    ];
  }

  const companies = await CompanyProfile.find(filter)
    .populate({
      path: "ownerId",
      select: "name email",
    })
    .sort({ createdAt: -1 });

  const companiesWithCount = await Promise.all(
    companies.map(async (company) => {
      const jobsCount = await Job.countDocuments({ companyId: company._id });
      return {
        ...company.toObject(),
        jobsPosted: jobsCount,
      };
    })
  );

  return companiesWithCount;
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
};

export const deleteUserByAdmin = async (userId: string) => {
  return await deleteUserService(userId);
};

export const deleteCompanyService = async (companyId: string) => {
  const company = await CompanyProfile.findById(companyId);
  if (!company) {
    throw new AppError("Company not found", 404);
  }

  // Notify the recruiter (company owner) before deletion
  try {
    if (company.ownerId) {
      await createNotification(
        company.ownerId.toString(),
        "Company Deleted by Admin",
        `Your company profile "${company.companyName}" has been permanently deleted by an administrator. All associated job postings and applications have also been removed. Please contact support if you believe this was a mistake.`,
        "SYSTEM",
      );
    }
  } catch (notifErr) {
    console.error(
      "[ADMIN SERVICE] Failed to send deletion notification to recruiter:",
      notifErr,
    );
  }

  // Delete jobs & applications associated with this company
  await Job.deleteMany({ companyId });
  await Application.deleteMany({ companyId });

  // Delete company profile
  await CompanyProfile.findByIdAndDelete(companyId);
  return { success: true };
};

export const getAllJobs = async (query: {
  search?: string;
  type?: string;
  status?: string;
}) => {
  const filter: any = {};

  if (query.type && query.type !== "all") {
    filter.employmentType = query.type;
  }

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    // Find matching companies
    const matchedCompanies = await CompanyProfile.find({ companyName: searchRegex }).select("_id");
    const companyIds = matchedCompanies.map((c) => c._id);
    
    filter.$or = [
      { title: searchRegex },
      { companyId: { $in: companyIds } }
    ];
  }

  const jobs = await Job.find(filter)
    .populate({
      path: "companyId",
      select: "companyName logo location industry",
    })
    .sort({ createdAt: -1 });

  const jobsWithCount = await Promise.all(
    jobs.map(async (job) => {
      const appsCount = await Application.countDocuments({ jobId: job._id });
      return {
        ...job.toObject(),
        applicationsCount: appsCount,
      };
    })
  );

  return jobsWithCount;
};

export const deleteJobByAdmin = async (jobId: string) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  // Notify company owner before deleting
  const company = await CompanyProfile.findById(job.companyId);
  if (company) {
    try {
      await createNotification(
        company.ownerId.toString(),
        "Job Post Deleted by Admin",
        `Your job posting "${job.title}" has been deleted by the administrator.`,
        "SYSTEM",
      );
    } catch (notifErr) {
      console.error("[ADMIN SERVICE ERROR] Failed to send job deletion notification:", notifErr);
    }
  }

  // Delete applications for this job
  await Application.deleteMany({ jobId });

  // Delete job
  await Job.findByIdAndDelete(jobId);
  return { success: true };
};

export const getAllApplications = async (query: {
  search?: string;
  status?: string;
}) => {
  const filter: any = {};

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  let applications = await Application.find(filter)
    .populate({
      path: "candidateId",
      populate: {
        path: "userId",
        select: "name email",
      },
    })
    .populate("jobId")
    .populate("companyId")
    .sort({ createdAt: -1 });

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    applications = applications.filter((app: any) => {
      const candidateName = app.candidateId?.userId?.name?.toLowerCase() || "";
      const companyName = app.companyId?.companyName?.toLowerCase() || "";
      const jobTitle = app.jobId?.title?.toLowerCase() || "";
      return (
        candidateName.includes(searchLower) ||
        companyName.includes(searchLower) ||
        jobTitle.includes(searchLower)
      );
    });
  }

  return applications;
};

export const getJobByIdForAdmin = async (jobId: string) => {
  const job = await Job.findById(jobId).populate({
    path: "companyId",
    select: "companyName logo location industry verified description website",
  });
  if (!job) {
    throw new AppError("Job not found", 404);
  }
  const appsCount = await Application.countDocuments({ jobId: job._id });
  return {
    ...job.toObject(),
    applicationsCount: appsCount,
  };
};

export const getApplicationByIdForAdmin = async (applicationId: string) => {
  const application = await Application.findById(applicationId)
    .populate({
      path: "candidateId",
      populate: [
        { path: "userId", select: "name email" },
        { path: "experience" },
        { path: "education" },
        { path: "skills" }
      ]
    })
    .populate({
      path: "jobId",
      select: "title description location salaryMin salaryMax employmentType experienceLevel requirements responsibilities",
    })
    .populate("companyId");

  if (!application) {
    throw new AppError("Application not found", 404);
  }
  return application;
};

export const updateApplicationStatusByAdmin = async (
  applicationId: string,
  status: string,
) => {
  const validStatuses = ["Applied", "Under Review", "Shortlisted", "Rejected", "Hired"];
  if (!validStatuses.includes(status)) {
    throw new AppError("Invalid application status", 400);
  }

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  application.status = status as any;
  await application.save();

  // Create notification for candidate
  const candidate = await Candidate.findById(application.candidateId);
  if (candidate) {
    try {
      await createNotification(
        candidate.userId.toString(),
        "Application Status Updated",
        `Your application status for job has been updated to "${status}" by Administrator.`,
        "APPLICATION",
      );
    } catch (err) {
      console.error("Failed to send status update notification:", err);
    }
  }

  return application;
};

export const getCompanyByIdForAdmin = async (companyId: string) => {
  const company = await CompanyProfile.findById(companyId).populate({
    path: "ownerId",
    select: "name email",
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const jobsCount = await Job.countDocuments({ companyId: company._id });
  return {
    ...company.toObject(),
    jobsPosted: jobsCount,
  };
};

export const globalSearch = async (query: string) => {
  if (!query || query.trim().length < 2) {
    return { users: [], companies: [], jobs: [] };
  }

  const q = query.trim();
  const regex = new RegExp(q, "i");

  const [users, companies, jobs] = await Promise.all([
    User.find({
      $or: [{ name: regex }, { email: regex }],
    })
      .select("name email role isActive")
      .limit(5)
      .lean(),

    CompanyProfile.find({
      $or: [{ companyName: regex }, { industry: regex }, { location: regex }],
    })
      .select("companyName industry location verified isActive logo")
      .limit(5)
      .lean(),

    Job.find({
      $or: [{ title: regex }, { location: regex }],
    })
      .populate({ path: "companyId", select: "companyName" })
      .select("title location status companyId createdAt")
      .limit(5)
      .lean(),
  ]);

  return { users, companies, jobs };
};

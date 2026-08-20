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
  page?: number;
  limit?: number;
}) => {
  const filter: any = {};

  if (query.role && query.role !== "all") {
    filter.role = query.role.toLowerCase();
  }

  if (query.status && query.status !== "all") {
    filter.isActive = query.status === "Active";
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const page = query.page ? Math.max(1, Number(query.page)) : 1;
  const limit = query.limit ? Math.max(1, Number(query.limit)) : 8;
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: filter },
    {
      $lookup: {
        from: "candidates",
        localField: "_id",
        foreignField: "userId",
        as: "candidateProfile",
      },
    },
    {
      $lookup: {
        from: "companyprofiles",
        localField: "_id",
        foreignField: "ownerId",
        as: "companyProfile",
      },
    },
    {
      $addFields: {
        profileImage: {
          $cond: {
            if: { $eq: ["$role", "candidate"] },
            then: {
              $let: {
                vars: { cand: { $arrayElemAt: ["$candidateProfile", 0] } },
                in: {
                  $cond: {
                    if: { $eq: [{ $type: "$$cand.profileImage" }, "object"] },
                    then: "$$cand.profileImage.url",
                    else: "$$cand.profileImage",
                  },
                },
              },
            },
            else: {
              $cond: {
                if: { $eq: ["$role", "recruiter"] },
                then: {
                  $let: {
                    vars: { comp: { $arrayElemAt: ["$companyProfile", 0] } },
                    in: {
                      $cond: {
                        if: { $eq: [{ $type: "$$comp.logo" }, "object"] },
                        then: "$$comp.logo.url",
                        else: "$$comp.logo",
                      },
                    },
                  },
                },
                else: null,
              },
            },
          },
        },
      },
    },
    {
      $project: {
        password: 0,
        candidateProfile: 0,
        companyProfile: 0,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "totalCount" }],
        users: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
      },
    },
  ];

  const [facetResult] = await User.aggregate(pipeline);
  const totalCount = facetResult?.metadata[0]?.totalCount || 0;
  const users = facetResult?.users || [];

  return {
    users,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
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
    filter.$text = { $search: query.search };
  }

  const companies = await CompanyProfile.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "ownerId",
        foreignField: "_id",
        as: "ownerId",
      },
    },
    {
      $unwind: {
        path: "$ownerId",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "jobs",
        let: { companyId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$companyId", "$$companyId"] } } },
          { $group: { _id: "$companyId", count: { $sum: 1 } } },
        ],
        as: "jobCountData",
      },
    },
    {
      $addFields: {
        jobsPosted: {
          $ifNull: [{ $arrayElemAt: ["$jobCountData.count", 0] }, 0],
        },
        ownerId: {
          _id: "$ownerId._id",
          name: "$ownerId.name",
          email: "$ownerId.email",
        },
      },
    },
    {
      $project: {
        jobCountData: 0,
      },
    },
  ]);

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
  page?: string | number;
  limit?: string | number;
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
    const matchedCompanies = await CompanyProfile.find({ companyName: searchRegex }).select("_id").lean();
    const companyIds = matchedCompanies.map((c) => c._id);

    filter.$or = [
      { title: searchRegex },
      { companyId: { $in: companyIds } }
    ];
  }

  const page = query.page ? Math.max(1, Number(query.page)) : 1;
  const limit = query.limit ? Math.max(1, Number(query.limit)) : 10;
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: filter },
    {
      $lookup: {
        from: "companyprofiles",
        localField: "companyId",
        foreignField: "_id",
        as: "companyId",
      },
    },
    { $unwind: { path: "$companyId", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "applications",
        localField: "_id",
        foreignField: "jobId",
        as: "applications",
      },
    },
    {
      $addFields: {
        applicationsCount: { $size: "$applications" },
      },
    },
    {
      $project: {
        applications: 0,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "totalCount" }],
        jobs: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
      },
    },
  ];

  const [facetResult] = await Job.aggregate(pipeline);
  const totalCount = facetResult?.metadata[0]?.totalCount || 0;
  const jobs = facetResult?.jobs || [];

  return {
    jobs,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
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



export const getJobByIdForAdmin = async (jobId: string) => {
  const job: any = await Job.findById(jobId)
    .populate({
      path: "companyId",
      select: "companyName logo location industry verified description website",
    })
    .lean();
  if (!job) {
    throw new AppError("Job not found", 404);
  }
  const appsCount = await Application.countDocuments({ jobId: job._id });
  return {
    ...job,
    applicationsCount: appsCount,
  };
};



export const getCompanyByIdForAdmin = async (companyId: string) => {
  const company: any = await CompanyProfile.findById(companyId)
    .populate({
      path: "ownerId",
      select: "name email",
    })
    .lean();

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const jobsCount = await Job.countDocuments({ companyId: company._id });
  return {
    ...company,
    jobsPosted: jobsCount,
  };
};

import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../utils/AppError.js";
import {
  registerCompanySchema,
  updateCompanySchema,
} from "../validations/company.validations.js";
import {
  createCompanyService,
  getMyCompanyDetails,
  updateCompanyDetails,
  updateCompanyLogo,
  updateCompanyCoverImage,
  getCompanyByIdService,
} from "../services/company.service.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import Notification from "../models/notification.model.js";
import Company from "../models/company.model.js";
export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = registerCompanySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }
    const result = await createCompanyService(validation.data, req.user!.id);
    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getMyCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMyCompanyDetails(req.user!.id);
    return res.status(201).json({
      success: true,
      message: "Company fetch successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = updateCompanySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }
    const result = await updateCompanyDetails(req.user!.id, validation.data);
    return res.status(201).json({
      success: true,
      message: "Company deatils update successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateLogo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new AppError("Logo image is required", 400);
    }

    const result = await updateCompanyLogo(req.user!.id, req.file);
    return res.status(201).json({
      success: true,
      message: "Company Logo update successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    if (!req.file) {
      throw new AppError("Cover image is required", 400);
    }
    const result = await updateCompanyCoverImage(req.user!.id, req.file);
    return res.status(201).json({
      success: true,
      message: "Company CoverImage update successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const company = await Company.findOne({ ownerId: req.user!.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found. Please create a company profile first.",
      });
    }

    const jobs = await Job.find({ companyId: company._id });
    const activeJobs = jobs.filter(j => j.status === "Open").length;
    const draftJobs = jobs.filter(j => j.status === "Draft").length;

    const jobIds = jobs.map(j => j._id);
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate({
        path: "candidateId",
        populate: {
          path: "userId",
          select: "name email"
        }
      })
      .populate("jobId", "title");

    const totalApplications = applications.length;

    // Calculate new applications (Applied in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newApplications = applications.filter(
      app => app.createdAt >= sevenDaysAgo
    ).length;

    const interviewsScheduled = applications.filter(
      app => app.status === "Interview"
    ).length;

    const hiredCandidates = applications.filter(
      app => app.status === "Hired"
    ).length;

    // Define date ranges for comparison
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const calculateDelta = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Calculate Active Jobs Delta (vs last month)
    const activeJobsThisMonth = jobs.filter(j => j.status === "Open" && j.createdAt >= thirtyDaysAgo).length;
    const activeJobsLastMonth = jobs.filter(j => j.status === "Open" && j.createdAt >= sixtyDaysAgo && j.createdAt < thirtyDaysAgo).length;
    const activeJobsDelta = calculateDelta(activeJobsThisMonth, activeJobsLastMonth);

    // Calculate Draft Jobs Delta (vs last month)
    const draftJobsThisMonth = jobs.filter(j => j.status === "Draft" && j.createdAt >= thirtyDaysAgo).length;
    const draftJobsLastMonth = jobs.filter(j => j.status === "Draft" && j.createdAt >= sixtyDaysAgo && j.createdAt < thirtyDaysAgo).length;
    const draftJobsDelta = calculateDelta(draftJobsThisMonth, draftJobsLastMonth);

    // Calculate Total Applications Delta (vs last month)
    const totalAppsThisMonth = applications.filter(app => app.createdAt >= thirtyDaysAgo).length;
    const totalAppsLastMonth = applications.filter(app => app.createdAt >= sixtyDaysAgo && app.createdAt < thirtyDaysAgo).length;
    const totalApplicationsDelta = calculateDelta(totalAppsThisMonth, totalAppsLastMonth);

    // Calculate New Applications Delta (last 7 days vs previous 7 days)
    const newAppsThisPeriod = applications.filter(app => app.createdAt >= sevenDaysAgo).length;
    const newAppsLastPeriod = applications.filter(app => app.createdAt >= fourteenDaysAgo && app.createdAt < sevenDaysAgo).length;
    const newApplicationsDelta = calculateDelta(newAppsThisPeriod, newAppsLastPeriod);

    // Calculate Interviews Delta (vs last month)
    const interviewsThisMonth = applications.filter(app => app.status === "Interview" && app.createdAt >= thirtyDaysAgo).length;
    const interviewsLastMonth = applications.filter(app => app.status === "Interview" && app.createdAt >= sixtyDaysAgo && app.createdAt < thirtyDaysAgo).length;
    const interviewsScheduledDelta = calculateDelta(interviewsThisMonth, interviewsLastMonth);

    // Calculate Hired Delta (vs last month)
    const hiredThisMonth = applications.filter(app => app.status === "Hired" && app.createdAt >= thirtyDaysAgo).length;
    const hiredLastMonth = applications.filter(app => app.status === "Hired" && app.createdAt >= sixtyDaysAgo && app.createdAt < thirtyDaysAgo).length;
    const hiredCandidatesDelta = calculateDelta(hiredThisMonth, hiredLastMonth);

    // Calculate jobs posted over time (last 6 months cumulative)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const jobsByMonthMap = new Map<string, number>();
    const trackedMonths: string[] = [];
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 5);
    cutoffDate.setDate(1);
    cutoffDate.setHours(0, 0, 0, 0);

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = monthNames[d.getMonth()];
      jobsByMonthMap.set(monthName, 0);
      trackedMonths.push(monthName);
    }

    let priorJobsCount = 0;
    jobs.forEach(j => {
      const jobDate = new Date(j.createdAt);
      if (jobDate < cutoffDate) {
        priorJobsCount++;
      } else {
        const monthName = monthNames[jobDate.getMonth()];
        if (jobsByMonthMap.has(monthName)) {
          jobsByMonthMap.set(monthName, jobsByMonthMap.get(monthName)! + 1);
        }
      }
    });

    let runningTotal = priorJobsCount;
    const jobsOverTime = trackedMonths.map(monthName => {
      runningTotal += jobsByMonthMap.get(monthName) || 0;
      return {
        name: monthName,
        jobs: runningTotal,
      };
    });
    // Applications per job
    const appsPerJobMap = new Map<string, number>();
    jobs.forEach(j => {
      if (j.status === "Open") {
        appsPerJobMap.set(j.title, 0);
      }
    });
    applications.forEach(app => {
      const jobTitle = (app.jobId as any)?.title || "Unknown Job";
      appsPerJobMap.set(jobTitle, (appsPerJobMap.get(jobTitle) || 0) + 1);
    });
    const applicationsPerJob = Array.from(appsPerJobMap.entries()).map(([name, count]) => ({
      name,
      applications: count,
    }));

    // Status distribution
    const statusMap = {
      "Applied": { name: "Applied", value: 0, color: "hsl(var(--chart-1))" },
      "Under Review": { name: "Under Review", value: 0, color: "hsl(var(--chart-2))" },
      "Shortlisted": { name: "Shortlisted", value: 0, color: "hsl(var(--chart-3))" },
      "Interview": { name: "Interview", value: 0, color: "hsl(var(--chart-6))" },
      "Rejected": { name: "Rejected", value: 0, color: "hsl(var(--chart-5))" },
      "Hired": { name: "Hired", value: 0, color: "hsl(var(--chart-4))" }
    };
    applications.forEach(app => {
      if (statusMap[app.status]) {
        statusMap[app.status].value++;
      }
    });
    const statusDistribution = Object.values(statusMap).filter(s => s.value > 0);

    // Recent applications (limit 4)
    const recentApplications = applications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4)
      .map(app => {
        const candidate = app.candidateId as any;
        const user = candidate?.userId as any;
        return {
          id: app._id,
          name: user?.name || "Candidate",
          photo: candidate?.profileImage || "",
          headline: candidate?.headline || "Software Engineer",
          jobTitle: (app.jobId as any)?.title || "Job Title",
          appliedDate: app.createdAt.toISOString().split("T")[0],
          status: app.status,
        };
      });

    // Recent jobs (limit 4)
    const recentJobs = jobs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4);

    // Recent notifications (limit 3)
    const recentNotifications = await Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(3);

    return res.status(200).json({
      success: true,
      data: {
        company: {
          name: company.companyName,
          logo: company.logo,
        },
        stats: {
          activeJobs,
          activeJobsDelta,
          draftJobs,
          draftJobsDelta,
          totalApplications,
          totalApplicationsDelta,
          newApplications,
          newApplicationsDelta,
          interviewsScheduled,
          interviewsScheduledDelta,
          hiredCandidates,
          hiredCandidatesDelta,
        },
        applicationsPerJob,
        statusDistribution,
        recentApplications,
        recentNotifications,
        recentJobs,
        jobsOverTime,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getCompanyByIdService(req.params.id as string);
    return res.status(200).json({
      success: true,
      message: "Get company details successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

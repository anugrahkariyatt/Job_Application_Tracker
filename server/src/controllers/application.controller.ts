import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../utils/AppError.js";
import {
  applyJobSchema,
  getApplicationSchema,
  getJobApplicationsSchema,
  updateApplicationStatusSchema,
} from "../validations/application.validation.js";
import {
  applyForJob,
  deleteApplication,
  FetchAllAppliedApplications,
  getApplicationsByJob,
  updateApplicationStatus,
} from "../services/application.service.js";
import Job from "../models/job.model.js";
import Company from "../models/company.model.js";
import Application from "../models/application.model.js";
import User from "../models/user.model.js";
import Candidate from "../models/candidate.model.js";

export const applyForJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = applyJobSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
      });
    }
    const result = await applyForJob(req.user!.id, validation.data.jobId);

    return res.status(201).json({
      success: true,
      message: "Job application submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAppliedApplicationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await FetchAllAppliedApplications(req.user!.id);

    return res.status(201).json({
      success: true,
      message: "Fetch all job application successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = req.params;
    const validation = getApplicationSchema.safeParse(applicationId);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
      });
    }
    const result = await deleteApplication(
      req.user!.id,
      validation.data.applicationId,
    );

    return res.status(201).json({
      success: true,
      message: "Delete Job application  successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
//recruiter
export const FetchApplicantByJobIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = getJobApplicationsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
      });
    }
    const result = await getApplicationsByJob(
      req.user!.id,
      validation.data.jobId,
    );

    return res.status(200).json({
      success: true,
      message: "Applicants fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateApplicationStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = req.params;
    const paramsValidation = getApplicationSchema.safeParse(req.params);

    const bodyValidation = updateApplicationStatusSchema.safeParse(req.body);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }
    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: bodyValidation.error.flatten(),
      });
    }

    const company = await Company.findOne({ ownerId: req.user!.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    if (company.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your company has been disabled by the administrator. Candidate status updates are blocked.",
      });
    }

    if (company.verified === false) {
      return res.status(403).json({
        success: false,
        message: "Your company is not verified yet. Candidate status updates are blocked.",
      });
    }

    const result = await updateApplicationStatus(
      req.user!.id,
      paramsValidation.data.applicationId,
      bodyValidation.data.status,
    );
    return res.status(200).json({
      success: true,
      message: "Update status successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterApplicationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const company = await Company.findOne({ ownerId: req.user!.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    const { search, status, jobId, page, limit } = req.query;

    const jobs = await Job.find({ companyId: company._id });
    const jobIds = jobs.map((j) => j._id);

    const query: any = { jobId: { $in: jobIds } };

    if (status && status !== "All") {
      query.status = status;
    }

    if (jobId && jobId !== "All") {
      query.jobId = jobId;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");

      // Find matching users by name or email
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      });
      const matchingUserIds = matchingUsers.map((u) => u._id);

      // Find matching candidate profiles by userId, headline, or location
      const matchingCandidates = await Candidate.find({
        $or: [
          { userId: { $in: matchingUserIds } },
          { headline: searchRegex },
          { location: searchRegex },
        ],
      });
      const matchingCandidateIds = matchingCandidates.map((c) => c._id);

      query.candidateId = { $in: matchingCandidateIds };
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 9;
    const skipNum = (pageNum - 1) * limitNum;

    const totalCount = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({
        path: "candidateId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("jobId", "title")
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    // Calculate statistics for recruiter's company applications
    const baseCompanyQuery = { jobId: { $in: jobIds } };
    const stats = {
      total: await Application.countDocuments(baseCompanyQuery),
      applied: await Application.countDocuments({ ...baseCompanyQuery, status: "Applied" }),
      underReview: await Application.countDocuments({ ...baseCompanyQuery, status: "Under Review" }),
      shortlisted: await Application.countDocuments({ ...baseCompanyQuery, status: "Shortlisted" }),
      hired: await Application.countDocuments({ ...baseCompanyQuery, status: "Hired" }),
      rejected: await Application.countDocuments({ ...baseCompanyQuery, status: "Rejected" }),
    };

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: {
        applications,
        totalCount,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const company = await Company.findOne({ ownerId: req.user!.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    const application = await Application.findById(req.params.applicationId)
      .populate({
        path: "candidateId",
        populate: {
          path: "userId",
          select: "name email"
        }
      })
      .populate("jobId");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this application",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application fetched successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

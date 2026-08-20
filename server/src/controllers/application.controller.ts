import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
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
  getRecruiterApplicationsService,
  updateApplicationStatus,
} from "../services/application.service.js";
import Job from "../models/job.model.js";
import Company from "../models/company.model.js";
import Application from "../models/application.model.js";
import User from "../models/user.model.js";
import Candidate from "../models/candidate.model.js";
import Skill from "../models/skill.model.js";
import Experience from "../models/experience.model.js";

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
      req.query,
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
    const result = await getRecruiterApplicationsService(
      req.user!.id,
      req.query,
    );

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: result,
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

    const appObj = application.toObject();
    if (appObj.candidateId && appObj.candidateId._id) {
      const candIdStr = appObj.candidateId._id.toString();
      const [skillsList, expList] = await Promise.all([
        Skill.find({ candidateId: candIdStr }),
        Experience.find({ candidateId: candIdStr }),
      ]);

      (appObj.candidateId as any).skills = skillsList.map((s) => s.name);
      (appObj.candidateId as any).experience = expList;

      if (appObj.aiScreening) {
        (appObj as any).aiMatchScore = appObj.aiScreening.score;
        (appObj as any).aiStrengths = appObj.aiScreening.strengths;
        (appObj as any).aiSummary = appObj.aiScreening.summary;
      } else {
        (appObj as any).aiMatchScore = null;
        (appObj as any).aiStrengths = [];
        (appObj as any).aiSummary = "";
      }
    }

    return res.status(200).json({
      success: true,
      message: "Application fetched successfully",
      data: appObj,
    });
  } catch (error) {
    next(error);
  }
};


import { getApplicationAIScreening } from "../services/application.service.js";

export const applicationAIScreening = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  
    const result = await getApplicationAIScreening(
      req.user!.id,
      req.params.applicationId as string,
    );


    res.status(200).json({
      success: true,
      message: "AI screening completed successfully.",
      data: result,
    });
  } catch (error) {
    console.error(`[API RESPONSE ERROR] AI Screening failed for App ID ${req.params.applicationId}:`, error);

    next(error);
  }
};
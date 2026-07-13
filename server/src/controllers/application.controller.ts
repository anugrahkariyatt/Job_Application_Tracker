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
        errors: z.flattenError(validation.error),
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
        errors: z.flattenError(validation.error),
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
        errors: z.flattenError(validation.error),
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
        errors: z.flattenError(paramsValidation.error),
      });
    }
    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(bodyValidation.error),
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

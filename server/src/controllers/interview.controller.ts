import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  createInterviewSchema,
  updateInterviewStatusSchema,
} from "../validations/interview.validation.js";
import {
  createInterview,
  updateInterviewStatus,
  getMyInterviews,
} from "../services/interview.service.js";
import Company from "../models/company.model.js";

export const createInterviewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = createInterviewSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
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
        message: "Your company has been disabled by the administrator. Interview scheduling is blocked.",
      });
    }

    if (company.verified === false) {
      return res.status(403).json({
        success: false,
        message: "Your company is not verified yet. Interview scheduling is blocked.",
      });
    }

    const result = await createInterview(req.user!.id, validation.data);

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterviewStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { interviewId } = req.params;
    const validation = updateInterviewStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
      });
    }

    const result = await updateInterviewStatus(
      req.user!.id,
      req.user!.role as any,
      interviewId as string,
      validation.data.status,
    );

    return res.status(200).json({
      success: true,
      message: "Interview status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyInterviewsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMyInterviews(req.user!.id, req.user!.role as any);

    return res.status(200).json({
      success: true,
      message: "Interviews fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  createJobAlertSchema,
  getJobAlertSchema,
  updateJobAlertSchema,
} from "../validations/jobAlert.validation.js";
import {
  createJobAlert,
  deleteJobAlert,
  getMyJobAlerts,
  updateJobAlert,
} from "../services/jobAlert.service.js";

export const createJobAlertController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = createJobAlertSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    const result = await createJobAlert(
      req.user!.id,
      validation.data.keywords,
      validation.data.location,
      validation.data.employmentType,
      validation.data.remote,
    );

    return res.status(201).json({
      success: true,
      message: "Job alert created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyJobAlertsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMyJobAlerts(req.user!.id);

    return res.status(200).json({
      success: true,
      message: "Job alerts fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJobAlertController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validationParams = getJobAlertSchema.safeParse(req.params);

    if (!validationParams.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validationParams.error),
      });
    }

    const validationBody = updateJobAlertSchema.safeParse(req.body);

    if (!validationBody.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validationBody.error),
      });
    }

    const result = await updateJobAlert(
      req.user!.id,
      validationParams.data.jobAlertId,
      validationBody.data.keywords,
      validationBody.data.location,
      validationBody.data.employmentType,
      validationBody.data.remote,
    );

    return res.status(200).json({
      success: true,
      message: "Job alert updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJobAlertController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = getJobAlertSchema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    await deleteJobAlert(req.user!.id, validation.data.jobAlertId);

    return res.status(200).json({
      success: true,
      message: "Job alert deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

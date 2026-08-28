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
  processScheduledJobAlerts,
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
        errors: validation.error.flatten(),
      });
    }

    const result = await createJobAlert(
      req.user!.id,
      validation.data.keywords,
      validation.data.location,
      validation.data.employmentType,
      validation.data.remote,
      validation.data.frequency,
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
        errors: validationParams.error.flatten(),
      });
    }

    const validationBody = updateJobAlertSchema.safeParse(req.body);

    if (!validationBody.success) {
      return res.status(400).json({
        success: false,
        errors: validationBody.error.flatten(),
      });
    }

    const result = await updateJobAlert(
      req.user!.id,
      validationParams.data.jobAlertId,
      validationBody.data,
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
        errors: validation.error.flatten(),
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

export const processScheduledJobAlertsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cronSecret =
      process.env.CRON_SECRET ||
      process.env.N8N_CRON_SECRET ||
      process.env.cronSecret;
    if (cronSecret) {
      const providedSecret =
        req.headers["x-cron-secret"] || req.headers["x-n8n-secret"];

      if (providedSecret !== cronSecret) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid x-cron-secret header",
        });
      }
    }

    const frequency = (req.query.frequency || req.body?.frequency) as
      | "Daily"
      | "Weekly"
      | "Monthly"
      | "All"
      | undefined;

    const stats = await processScheduledJobAlerts(frequency);

    return res.status(200).json({
      success: true,
      message: "Scheduled job alerts processed successfully",
      stats,
    });
  } catch (error) {
    next(error);
  }
};


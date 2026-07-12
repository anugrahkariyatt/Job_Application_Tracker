import { Request, Response, NextFunction } from "express";
import {
  createJobSchema,
  getJobSchema,
  updateJobSchema,
} from "../validations/jobs.validation.js";
import {
  createJob,
  deleteJob,
  getJobById,
  getMyJobs,
  updateJob,
} from "../services/job.service.js";
import z from "zod";

export const createJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = createJobSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    const result = await createJob(req.user!.id, validation.data);
    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getMyJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMyJobs(req.user!.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = getJobSchema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    const result = await getJobById(validation.data.jobId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = updateJobSchema.safeParse(req.body);
    const paramsValidation = getJobSchema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }
    if (paramsValidation.error) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(paramsValidation.error),
      });
    }

    const result = await updateJob(
      req.user!.id,
      paramsValidation.data.jobId,
      validation.data,
    );

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getJobSchema.safeParse(req.params);
    if (paramsValidation.error) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(paramsValidation.error),
      });
    }
    await deleteJob(req.user!.id, paramsValidation.data.jobId);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

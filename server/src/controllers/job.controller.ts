import { Request, Response, NextFunction } from "express";
import {
  createJobSchema,
  getJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
} from "../validations/jobs.validation.js";
import {
  createJob,
  deleteJob,
  getJobById,
  getMyJobs,
  updateJob,
  updateJobStatus,
} from "../services/job.service.js";
import z from "zod";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";

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
    const { search, status, page, limit } = req.query;

    const result = await getMyJobs(req.user!.id, {
      search: search as string,
      status: status as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    const company = await Company.findOne({ ownerId: req.user!.id });
    const stats = company
      ? {
          total: await Job.countDocuments({ companyId: company._id }),
          open: await Job.countDocuments({ companyId: company._id, status: "Open" }),
          closed: await Job.countDocuments({ companyId: company._id, status: "Closed" }),
          draft: await Job.countDocuments({ companyId: company._id, status: "Draft" }),
        }
      : { total: 0, open: 0, closed: 0, draft: 0 };

    return res.status(200).json({
      success: true,
      data: {
        jobs: result.jobs,
        totalCount: result.totalCount,
        stats,
      },
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

export const updateJobStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = updateJobStatusSchema.safeParse(req.body);
    const paramsValidation = getJobSchema.safeParse(req.params);
    if (paramsValidation.error) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(paramsValidation.error),
      });
    }
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    const result = await updateJobStatus(
      req.user!.id,
      paramsValidation.data.jobId,
      validation.data.status,
    );

    return res.status(200).json({
      success: true,
      message: "Job status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobs = await Job.find({ status: "Open" })
      .populate("companyId", "companyName logo location industry description")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

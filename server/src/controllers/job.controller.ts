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

    const company = await Company.findOne({ ownerId: req.user!.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found. Please create a company profile first.",
      });
    }

    if (company.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your company has been disabled by the administrator. Job creation is blocked.",
      });
    }

    if (company.verified === false) {
      return res.status(403).json({
        success: false,
        message: "Your company is not verified yet. Job creation is blocked.",
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
        message: "Your company has been disabled by the administrator. Job editing is blocked.",
      });
    }

    if (company.verified === false) {
      return res.status(403).json({
        success: false,
        message: "Your company is not verified yet. Job editing is blocked.",
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
        message: "Your company has been disabled by the administrator. Job status modification is blocked.",
      });
    }

    if (company.verified === false) {
      return res.status(403).json({
        success: false,
        message: "Your company is not verified yet. Job status modification is blocked.",
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
    const {
      search,
      employmentTypes,
      experienceLevels,
      location,
      remote,
      salaryMin,
      sortBy,
      companyId,
      workModes,
    } = req.query;

    const activeCompanies = await Company.find({ isActive: { $ne: false }, verified: true }).select("_id");
    const activeCompanyIds = activeCompanies.map((c) => c._id.toString());

    const filterQuery: any = { status: "Open" };
    if (companyId) {
      if (activeCompanyIds.includes(companyId as string)) {
        filterQuery.companyId = companyId;
      } else {
        filterQuery.companyId = null;
      }
    } else {
      filterQuery.companyId = { $in: activeCompanyIds };
    }

    // 1. Search text filter (title, skills, description)
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      filterQuery.$or = [
        { title: searchRegex },
        { skills: { $in: [searchRegex] } },
        { description: searchRegex },
      ];
    }

    // 2. Employment types filter
    if (employmentTypes) {
      const typesList = (employmentTypes as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (typesList.length > 0) {
        filterQuery.employmentType = { $in: typesList };
      }
    }

    // 3. Experience level filter
    if (experienceLevels) {
      const levelsList = (experienceLevels as string)
        .split(",")
        .map((l) => {
          const val = l.trim();
          if (val === "Entry") return "Fresher";
          if (val === "Mid") return "Mid-Level";
          return val;
        })
        .filter(Boolean);
      if (levelsList.length > 0) {
        filterQuery.experienceLevel = { $in: levelsList };
      }
    }

    // 4. Remote & Work Mode filter
    if (workModes) {
      const modesList = (workModes as string)
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean);
      if (modesList.length > 0) {
        const workModeQueries: any[] = [];
        if (modesList.includes("Remote")) {
          workModeQueries.push({ workMode: "Remote" });
          workModeQueries.push({ remote: true });
        }
        if (modesList.includes("Onsite")) {
          workModeQueries.push({ workMode: "Onsite" });
          workModeQueries.push({ workMode: { $exists: false }, remote: false });
        }
        if (modesList.includes("Hybrid")) {
          workModeQueries.push({ workMode: "Hybrid" });
        }
        if (workModeQueries.length > 0) {
          filterQuery.$and = filterQuery.$and || [];
          filterQuery.$and.push({ $or: workModeQueries });
        }
      }
    } else if (remote === "true") {
      filterQuery.$or = [{ workMode: "Remote" }, { remote: true }];
    }

    // 5. Location filter
    if (location) {
      filterQuery.location = new RegExp(location as string, "i");
    }

    // 6. Minimum Salary filter
    if (salaryMin) {
      const minVal = Number(salaryMin) * 1000;
      if (!isNaN(minVal)) {
        filterQuery.salaryMin = { $gte: minVal };
      }
    }

    // 7. Sorting setup
    let sortObj: any = { createdAt: -1 };
    if (sortBy === "salary_high") {
      sortObj = { salaryMin: -1, salaryMax: -1 };
    } else if (sortBy === "salary_low") {
      sortObj = { salaryMin: 1, salaryMax: 1 };
    }

    const jobs = await Job.find(filterQuery)
      .populate("companyId", "companyName logo location industry description")
      .sort(sortObj);

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

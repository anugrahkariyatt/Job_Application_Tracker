import { NextFunction, Request, Response } from "express";
import { getDashboard } from "../services/admin.service.js";
import { z } from "zod";
import {
  getUserSchema,
  updateUserStatusSchema,
  getCompanySchema,
  updateCompanyStatusSchema,
  updateCompanyVerificationSchema,
  getJobSchema,
  getApplicationSchema,
  updateApplicationStatusSchema,
} from "../validations/admin.validation.js";
import { getAllUsers, updateUserStatus } from "../services/admin.service.js";

import {
  getAllCompanies,
  updateCompanyStatus,
  updateCompanyVerification,
  deleteUserByAdmin,
  deleteCompanyService,
  getAllJobs,
  deleteJobByAdmin,
  getAllApplications,
  getJobByIdForAdmin,
  getApplicationByIdForAdmin,
  updateApplicationStatusByAdmin,
  getCompanyByIdForAdmin,
  globalSearch,
} from "../services/admin.service.js";

export const getDashboardController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getDashboard();

    return res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// User control

export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllUsers(req.query as any);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getUserSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    const bodyValidation = updateUserStatusSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: bodyValidation.error.flatten(),
      });
    }

    const result = await updateUserStatus(
      paramsValidation.data.userId,
      bodyValidation.data.isActive,
    );

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//compnay

export const getAllCompaniesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllCompanies(req.query as any);

    return res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCompanyVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getCompanySchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    const bodyValidation = updateCompanyVerificationSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: bodyValidation.error.flatten(),
      });
    }

    const result = await updateCompanyVerification(
      paramsValidation.data.companyId,
      bodyValidation.data.verified,
    );

    return res.status(200).json({
      success: true,
      message: "Company verification updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getCompanySchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    const bodyValidation = updateCompanyStatusSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: bodyValidation.error.flatten(),
      });
    }

    const result = await updateCompanyStatus(
      paramsValidation.data.companyId,
      bodyValidation.data.isActive,
    );

    return res.status(200).json({
      success: true,
      message: "Company status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getUserSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    await deleteUserByAdmin(paramsValidation.data.userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getCompanySchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    await deleteCompanyService(paramsValidation.data.companyId);

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully",
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
    const result = await getAllJobs(req.query as any);
    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
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
    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    await deleteJobByAdmin(paramsValidation.data.jobId);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApplicationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllApplications(req.query as any);
    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
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
    const paramsValidation = getJobSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    const result = await getJobByIdForAdmin(paramsValidation.data.jobId);
    return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
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
    const paramsValidation = getApplicationSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    const result = await getApplicationByIdForAdmin(paramsValidation.data.applicationId);
    return res.status(200).json({
      success: true,
      message: "Application fetched successfully",
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
    const paramsValidation = getApplicationSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    const bodyValidation = updateApplicationStatusSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: bodyValidation.error.flatten(),
      });
    }

    const result = await updateApplicationStatusByAdmin(
      paramsValidation.data.applicationId,
      bodyValidation.data.status,
    );

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: result,
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
    const paramsValidation = getCompanySchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    const result = await getCompanyByIdForAdmin(paramsValidation.data.companyId);
    return res.status(200).json({
      success: true,
      message: "Company details fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const globalSearchController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = (req.query.q as string) || "";
    const result = await globalSearch(q);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

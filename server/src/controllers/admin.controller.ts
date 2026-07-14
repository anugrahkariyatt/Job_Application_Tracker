import { NextFunction, Request, Response } from "express";
import { getDashboard } from "../services/admin.service.js";
import { z } from "zod";
import {
  getUserSchema,
  updateUserStatusSchema,
} from "../validations/admin.validation.js";
import { getAllUsers, updateUserStatus } from "../services/admin.service.js";

import {
  getCompanySchema,
  updateCompanyStatusSchema,
  updateCompanyVerificationSchema,
} from "../validations/admin.validation.js";

import {
  getAllCompanies,
  updateCompanyStatus,
  updateCompanyVerification,
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
    const result = await getAllUsers();

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
        errors: z.flattenError(paramsValidation.error),
      });
    }

    const bodyValidation = updateUserStatusSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(bodyValidation.error),
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
    const result = await getAllCompanies();

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
        errors: z.flattenError(paramsValidation.error),
      });
    }

    const bodyValidation = updateCompanyVerificationSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(bodyValidation.error),
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
        errors: z.flattenError(paramsValidation.error),
      });
    }

    const bodyValidation = updateCompanyStatusSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(bodyValidation.error),
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

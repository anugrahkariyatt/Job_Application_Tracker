import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../utils/AppError.js";
import {
  registerCompanySchema,
  updateCompanySchema,
} from "../validations/company.validations.js";
import {
  createCompanyService,
  getMyCompanyDetails,
  updateCompanyDetails,
  updateCompanyLogo,
  updateCompanyCoverImage,
} from "../services/company.service.js";
import User from "../models/user.model.js";
export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = registerCompanySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }
    const result = await createCompanyService(validation.data, req.user!.id);
    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getMyCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMyCompanyDetails(req.user!.id);
    return res.status(201).json({
      success: true,
      message: "Company fetch successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = updateCompanySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }
    const result = await updateCompanyDetails(req.user!.id, validation.data);
    return res.status(201).json({
      success: true,
      message: "Company deatils update successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateLogo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new AppError("Logo image is required", 400);
    }

    const result = await updateCompanyLogo(req.user!.id, req.file);
    return res.status(201).json({
      success: true,
      message: "Company Logo update successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    if (!req.file) {
      throw new AppError("Cover image is required", 400);
    }
    const result = await updateCompanyCoverImage(req.user!.id, req.file);
    return res.status(201).json({
      success: true,
      message: "Company CoverImage update successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

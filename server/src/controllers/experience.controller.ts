import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  createExperienceSchema,
  getExperienceSchema,
  updateExperienceSchema,
} from "../validations/experience.validation.js";
import {
  addExperience,
  getMyExperience,
  updateExperience,
  deleteExperience,
} from "../services/experience.service.js";

export const addExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = createExperienceSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    const result = await addExperience(req.user!.id, validation.data);

    return res.status(201).json({
      success: true,
      message: "Experience added successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMyExperience(req.user!.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getExperienceSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(paramsValidation.error),
      });
    }

    const bodyValidation = updateExperienceSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(bodyValidation.error),
      });
    }

    const result = await updateExperience(
      req.user!.id,
      paramsValidation.data.experienceId,
      bodyValidation.data,
    );

    return res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getExperienceSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(paramsValidation.error),
      });
    }

    await deleteExperience(req.user!.id, paramsValidation.data.experienceId);

    return res.status(200).json({
      success: true,
      message: "Experience deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

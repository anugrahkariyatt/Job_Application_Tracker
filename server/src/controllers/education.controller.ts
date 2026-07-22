import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  createEducationSchema,
  getEducationSchema,
  updateEducationSchema,
} from "../validations/education.validation.js";
import {
  addEducation,
  deleteEducation,
  getMyEducation,
  updateEducation,
} from "../services/education.service.js";

export const addEducationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = createEducationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
      });
    }

    const result = await addEducation(
      req.user!.id,
      validation.data,
    );

    return res.status(201).json({
      success: true,
      message: "Education added successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEducationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMyEducation(req.user!.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEducationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getEducationSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    const bodyValidation = updateEducationSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: bodyValidation.error.flatten(),
      });
    }

    const result = await updateEducation(
      req.user!.id,
      paramsValidation.data.educationId,
      bodyValidation.data,
    );

    return res.status(200).json({
      success: true,
      message: "Education updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEducationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getEducationSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    await deleteEducation(
      req.user!.id,
      paramsValidation.data.educationId,
    );

    return res.status(200).json({
      success: true,
      message: "Education deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
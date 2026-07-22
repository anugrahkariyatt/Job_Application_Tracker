import { Request, Response, NextFunction } from "express";
import z from "zod";
import {
  createSkillSchema,
  getSkillSchema,
  updateSkillSchema,
} from "../validations/skill.validation.js";
import {
  addSkill,
  deleteSkill,
  getMySkills,
  updateSkill,
} from "../services/skill.service.js";

export const addSkillController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = createSkillSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
      });
    }

    const result = await addSkill(req.user!.id, validation.data);

    return res.status(201).json({
      success: true,
      message: "Skill added successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getMySkillsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMySkills(req.user!.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateSkillController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getSkillSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    const bodyValidation = updateSkillSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        errors: bodyValidation.error.flatten(),
      });
    }

    const result = await updateSkill(
      req.user!.id,
      paramsValidation.data.skillId,
      bodyValidation.data,
    );

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSkillController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paramsValidation = getSkillSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        errors: paramsValidation.error.flatten(),
      });
    }

    await deleteSkill(req.user!.id, paramsValidation.data.skillId);

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createCandidateSchema,
  updateCandidateSchema,
} from "../validations/candidate.validations.js";
import {
  createCandidate,
  getMyCandidate,
  updateCandidate,
  updateCandidateProfileImage,
  updateCandidateResume,
} from "../services/candidate.service.js";
import { AppError } from "../utils/AppError.js";

export const createCandidateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = createCandidateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    const result = await createCandidate(req.user!.id, validation.data);

    return res.status(201).json({
      success: true,
      message: "Candidate profile created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCandidateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMyCandidate(req.user!.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = updateCandidateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    const result = await updateCandidate(req.user!.id, validation.data);

    return res.status(200).json({
      success: true,
      message: "Candidate profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfileImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new AppError("Profile image is required", 400);
    }

    const result = await updateCandidateProfileImage(req.user!.id, req.file);

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateResumeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new AppError("Resume is required", 400);
    }

    const result = await updateCandidateResume(req.user!.id, req.file);

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

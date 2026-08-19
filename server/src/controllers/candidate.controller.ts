import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createCandidateSchema,
  updateCandidateSchema,
} from "../validations/candidate.validation.js";
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
    console.log(`[CANDIDATE_CONTROLLER] POST /api/candidate - User ID: ${req.user?.id}`);
    const validation = createCandidateSchema.safeParse(req.body);

    if (!validation.success) {
      console.warn(`[CANDIDATE_CONTROLLER] Validation failed for createCandidate:`, validation.error.flatten());
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
      });
    }

    const result = await createCandidate(req.user!.id, validation.data);
    console.log(`[CANDIDATE_CONTROLLER] Candidate created successfully for User ID: ${req.user?.id}`);

    return res.status(201).json({
      success: true,
      message: "Candidate profile created successfully",
      data: result,
    });
  } catch (error) {
    console.error(`[CANDIDATE_CONTROLLER] Error in createCandidateController:`, error);
    next(error);
  }
};

export const getMyCandidateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log(`[CANDIDATE_CONTROLLER] GET /api/candidate - User ID: ${req.user?.id}`);
    const result = await getMyCandidate(req.user!.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(`[CANDIDATE_CONTROLLER] Error in getMyCandidateController:`, error);
    next(error);
  }
};

export const updateCandidateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log(`[CANDIDATE_CONTROLLER] PATCH /api/candidate - User ID: ${req.user?.id}`, req.body);
    const validation = updateCandidateSchema.safeParse(req.body);

    if (!validation.success) {
      console.warn(`[CANDIDATE_CONTROLLER] Validation failed for updateCandidate:`, validation.error.flatten());
      return res.status(400).json({
        success: false,
        errors: validation.error.flatten(),
      });
    }

    const result = await updateCandidate(req.user!.id, validation.data);
    console.log(`[CANDIDATE_CONTROLLER] Candidate updated successfully for User ID: ${req.user?.id}`);

    return res.status(200).json({
      success: true,
      message: "Candidate profile updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(`[CANDIDATE_CONTROLLER] Error in updateCandidateController:`, error);
    next(error);
  }
};

export const updateProfileImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log(`[CANDIDATE_CONTROLLER] PATCH /api/candidate/profile-image - User ID: ${req.user?.id}, File present: ${Boolean(req.file)}`);
    if (!req.file) {
      console.warn(`[CANDIDATE_CONTROLLER] No file attached in req.file for profile image upload.`);
      throw new AppError("Profile image is required", 400);
    }

    const result = await updateCandidateProfileImage(req.user!.id, req.file);

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(`[CANDIDATE_CONTROLLER] Error in updateProfileImageController:`, error);
    next(error);
  }
};

export const updateResumeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log(`[CANDIDATE_CONTROLLER] PATCH /api/candidate/resume - User ID: ${req.user?.id}, File present: ${Boolean(req.file)}`);
    if (!req.file) {
      console.warn(`[CANDIDATE_CONTROLLER] No file attached in req.file for resume upload.`);
      throw new AppError("Resume is required", 400);
    }

    const result = await updateCandidateResume(req.user!.id, req.file);

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(`[CANDIDATE_CONTROLLER] Error in updateResumeController:`, error);
    next(error);
  }
};

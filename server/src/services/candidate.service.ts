import Candidate from "../models/candidate.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateCandidateInput,
  UpdateCandidateInput,
} from "../validations/candidate.validation.js";
import { uploadFile, deleteFile } from "./cloudinary.service.js";

export const createCandidate = async (
  userId: string,
  data: CreateCandidateInput,
) => {
  const existingCandidate = await Candidate.findOne({
    userId,
  }).lean();

  if (existingCandidate) {
    throw new AppError("Candidate profile already exists", 400);
  }

  const candidate = await Candidate.create({
    userId,
    ...data,
  });

  return candidate;
};

export const getMyCandidate = async (userId: string) => {
  const candidate = await Candidate.findOne({ userId })
    .populate("userId", "name email")
    .lean();
  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  return candidate;
};

export const updateCandidate = async (
  userId: string,
  data: UpdateCandidateInput,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const { fullName, ...candidateUpdateData } = data;

  if (fullName) {
    await User.findByIdAndUpdate(userId, {
      name: fullName,
    });
  }

  Object.assign(candidate, candidateUpdateData);

  await candidate.save();

  return candidate;
};

export const updateCandidateProfileImage = async (
  userId: string,
  file: Express.Multer.File,
) => {
  const candidate = await Candidate.findOne({ userId });
  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const oldPublicId = candidate.profileImage?.publicId;

  const uploadedImage = await uploadFile(file, "candidate/profile-image");

  candidate.profileImage = {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
    resourceType: "image",
  };

  await candidate.save();

  if (oldPublicId) {
    try {
      await deleteFile(oldPublicId);
    } catch (err) {
      console.warn("[CLOUDINARY] Failed to delete old profile image:", err);
    }
  }

  return candidate;
};

export const updateCandidateResume = async (
  userId: string,
  file: Express.Multer.File,
) => {
  const candidate = await Candidate.findOne({ userId });
  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const oldPublicId = candidate.resume?.publicId;

  const uploadedResume = await uploadFile(file, "candidate/resume");

  candidate.resume = {
    url: uploadedResume.secure_url,
    publicId: uploadedResume.public_id,
    resourceType: "image",
  };

  await candidate.save();

  if (oldPublicId) {
    try {
      await deleteFile(oldPublicId);
    } catch (err) {
      console.warn("[CLOUDINARY] Failed to delete old resume:", err);
    }
  }

  return candidate;
};
import Candidate from "../models/candidate.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateCandidateInput,
  UpdateCandidateInput,
} from "../validations/candidate.validations.js";
import { uploadImage } from "./cloudinary.service.js";

export const createCandidate = async (
  userId: string,
  data: CreateCandidateInput,
) => {
  const existingCandidate = await Candidate.findOne({
    userId,
  });

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
  const candidate = await Candidate.findOne({ userId }).populate(
    "userId",
    "name email",
  );
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

  if (data.fullName) {
    await User.findByIdAndUpdate(userId, {
      name: data.fullName,
    });

    delete data.fullName;
  }

  Object.assign(candidate, data);

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

  const uploadedImage = await uploadImage(file, "candidate/profile-image");

  candidate.profileImage = uploadedImage.secure_url;

  await candidate.save();

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

  const uploadedResume = await uploadImage(file, "candidate/resume");

  candidate.resumeUrl = uploadedResume.secure_url;

  await candidate.save();

  return candidate;
};

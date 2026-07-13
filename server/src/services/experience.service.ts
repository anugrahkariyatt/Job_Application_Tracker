import Candidate from "../models/candidate.model.js";
import Experience from "../models/experience.model.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateExperienceInput,
  UpdateExperienceInput,
} from "../validations/experience.validation.js";

export const addExperience = async (
  userId: string,
  data: CreateExperienceInput,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const existingExperience = await Experience.findOne({
    candidateId: candidate._id,
    companyName: data.companyName,
    jobTitle: data.jobTitle,
    startDate: data.startDate,
  });

  if (existingExperience) {
    throw new AppError("Experience already exists", 400);
  }

  const experience = await Experience.create({
    candidateId: candidate._id,
    ...data,
  });

  return experience;
};

export const getMyExperience = async (userId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const experience = await Experience.find({
    candidateId: candidate._id,
  }).sort({
    startDate: -1,
  });

  return experience;
};

export const updateExperience = async (
  userId: string,
  experienceId: string,
  data: UpdateExperienceInput,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const experience = await Experience.findById(experienceId);

  if (!experience) {
    throw new AppError("Experience not found", 404);
  }

  if (experience.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError("You are not authorized to update this experience", 403);
  }

  Object.assign(experience, data);

  await experience.save();

  return experience;
};

export const deleteExperience = async (
  userId: string,
  experienceId: string,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const experience = await Experience.findById(experienceId);

  if (!experience) {
    throw new AppError("Experience not found", 404);
  }

  if (experience.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError("You are not authorized to delete this experience", 403);
  }

  await experience.deleteOne();

  return;
};

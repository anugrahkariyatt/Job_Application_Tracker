import Candidate from "../models/candidate.model.js";
import Education from "../models/education.model.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateEducationInput,
  UpdateEducationInput,
} from "../validations/education.validation.js";

export const addEducation = async (
  userId: string,
  data: CreateEducationInput,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const education = await Education.create({
    candidateId: candidate._id,
    ...data,
  });

  return education;
};

export const getMyEducation = async (userId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const education = await Education.find({
    candidateId: candidate._id,
  }).sort({
    startDate: -1,
  });

  return education;
};

export const updateEducation = async (
  userId: string,
  educationId: string,
  data: UpdateEducationInput,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const education = await Education.findById(educationId);

  if (!education) {
    throw new AppError("Education not found", 404);
  }

  if (education.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError(
      "You are not authorized to update this education",
      403,
    );
  }

  Object.assign(education, data);

  await education.save();

  return education;
};

export const deleteEducation = async (
  userId: string,
  educationId: string,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const education = await Education.findById(educationId);

  if (!education) {
    throw new AppError("Education not found", 404);
  }

  if (education.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError(
      "You are not authorized to delete this education",
      403,
    );
  }

  await education.deleteOne();

  return;
};
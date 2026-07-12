import Candidate from "../models/candidate.model.js";
import Skill from "../models/skill.model.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateSkillInput,
  UpdateSkillInput,
} from "../validations/skill.validation.js";

export const addSkill = async (userId: string, data: CreateSkillInput) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const existingSkill = await Skill.findOne({
    candidateId: candidate._id,
    name: data.name,
  });

  if (existingSkill) {
    throw new AppError("Skill already exists", 400);
  }

  const skill = await Skill.create({
    candidateId: candidate._id,
    ...data,
  });

  return skill;
};

export const getMySkills = async (userId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const skills = await Skill.find({
    candidateId: candidate._id,
  }).sort({
    createdAt: -1,
  });

  return skills;
};

export const updateSkill = async (
  userId: string,
  skillId: string,
  data: UpdateSkillInput,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const skill = await Skill.findById(skillId);

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  if (skill.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError("You are not authorized to update this skill", 403);
  }

  Object.assign(skill, data);

  await skill.save();

  return skill;
};

export const deleteSkill = async (userId: string, skillId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const skill = await Skill.findById(skillId);

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  if (skill.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError("You are not authorized to delete this skill", 403);
  }

  await skill.deleteOne();

  return;
};

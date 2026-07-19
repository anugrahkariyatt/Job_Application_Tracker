import Company from "../models/company.model.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../validations/company.validations.js";
import { uploadImage } from "./cloudinary.service.js";

export const createCompanyService = async (
  data: CreateCompanyInput,
  ownerId: string,
) => {
  const existingCompany = await Company.findOne({
    ownerId,
  });

  if (existingCompany) {
    throw new AppError("Recruiter already owns a company", 409);
  }

  const company = await Company.create({
    ownerId,
    companyName: data.companyName,
    industry: data.industry,
  });

  return company;
};
export const getMyCompanyDetails = async (ownerId: string) => {
  const company = await Company.findOne({
    ownerId,
  });

  return company;
};
export const updateCompanyDetails = async (
  ownerId: string,
  data: UpdateCompanyInput,
) => {
  const company = await Company.findOne({
    ownerId,
  });
  if (!company) {
    throw new AppError("Company not found ", 404);
  }

  Object.assign(company, data);

  await company.save();

  return company;
};
export const updateCompanyLogo = async (
  ownerId: string,
  file: Express.Multer.File,
) => {
  const company = await Company.findOne({
    ownerId,
  });
  if (!company) {
    throw new AppError("Company not found ", 404);
  }
  const uploadedImage = await uploadImage(file, "company/logo");

  company.logo = uploadedImage.secure_url;

  await company.save();

  return company;
};
export const updateCompanyCoverImage = async (
  ownerId: string,
  file: Express.Multer.File,
) => {
  const company = await Company.findOne({
    ownerId,
  });
  if (!company) {
    throw new AppError("Company not found ", 404);
  }
  const uploadedImage = await uploadImage(file, "company/coverImage");

  company.coverImage = uploadedImage.secure_url;

  await company.save();

  return company;
};

export const getCompanyByIdService = async (id: string) => {
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError("Company not found", 404);
  }
  return company;
};

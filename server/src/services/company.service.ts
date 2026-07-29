import Company from "../models/company.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../validations/company.validation.js";
import { uploadImage } from "./cloudinary.service.js";
import { createNotification } from "./notification.service.js";

const notifyAdminsOnRegistration = async (companyName: string) => {
  try {
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification(
        admin._id.toString(),
        "New Company Registered",
        `A new company "${companyName}" has registered and is pending verification.`,
        "SYSTEM",
      );
    }
  } catch (err) {
    console.error("Error creating registration notification for admins:", err);
  }
};

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

  await notifyAdminsOnRegistration(company.companyName);

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

  const wasPlaceholder = company.companyName === "Placeholder Company Name";

  Object.assign(company, data);

  await company.save();

  if (wasPlaceholder && company.companyName !== "Placeholder Company Name") {
    await notifyAdminsOnRegistration(company.companyName);
  }

  return company;
};
export const updateCompanyLogo = async (
  ownerId: string,
  file: Express.Multer.File,
) => {
  let company = await Company.findOne({
    ownerId,
  });
  if (!company) {
    company = await Company.create({
      ownerId,
      companyName: "Placeholder Company Name",
      industry: "Technology",
    });
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
  let company = await Company.findOne({
    ownerId,
  });
  if (!company) {
    company = await Company.create({
      ownerId,
      companyName: "Placeholder Company Name",
      industry: "Technology",
    });
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

export const getAllPublicCompaniesService = async (query: {
  search?: string;
  industry?: string;
  location?: string;
  page?: string | number;
  limit?: string | number;
}) => {
  const { search, industry, location, page, limit } = query;
  const filter: any = { isActive: { $ne: false }, verified: true };

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { companyName: regex },
      { description: regex },
      { industry: regex },
    ];
  }

  if (industry && industry !== "All" && industry !== "all") {
    filter.industry = industry;
  }

  if (location && location !== "all") {
    const regex = new RegExp(location, "i");
    filter.headquarters = regex;
  }

  const pageNum = page ? Math.max(1, Number(page)) : 1;
  const limitNum = limit ? Math.max(1, Number(limit)) : 9;
  const skip = (pageNum - 1) * limitNum;

  const totalCount = await Company.countDocuments(filter);
  const companies = await Company.find(filter)
    .sort({ companyName: 1 })
    .skip(skip)
    .limit(limitNum);

  const totalPages = Math.ceil(totalCount / limitNum);

  return {
    companies,
    pagination: {
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  };
};

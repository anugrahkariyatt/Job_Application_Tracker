import Company from "../models/company.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../validations/company.validation.js";
import { uploadFile, deleteFile } from "./cloudinary.service.js";
import { createNotification } from "./notification.service.js";
import { sendCompanyRegistrationAdminAlert } from "./mail.service.js";

const notifyAdminsOnRegistration = async (companyName: string, industry: string = "Technology") => {
  try {
    const admins = await User.find({ role: "admin" }).lean();
    for (const admin of admins) {
      // In-app system notification
      await createNotification(
        admin._id.toString(),
        "New Company Registered",
        `A new company "${companyName}" has registered and is pending verification.`,
        "SYSTEM",
      );

      // n8n email/webhook dispatch
      if (admin.email) {
        await sendCompanyRegistrationAdminAlert({
          adminEmail: admin.email,
          adminName: admin.name || "Admin",
          companyName,
          industry,
          registeredAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("Error creating registration notification/n8n alert for admins:", err);
  }
};

export const createCompanyService = async (
  data: CreateCompanyInput,
  ownerId: string,
) => {
  const existingCompany = await Company.findOne({
    ownerId,
  }).lean();

  if (existingCompany) {
    throw new AppError("Recruiter already owns a company", 409);
  }

  const company = await Company.create({
    ownerId,
    companyName: data.companyName,
    industry: data.industry,
  });

  await notifyAdminsOnRegistration(company.companyName, company.industry);

  return company;
};
export const getMyCompanyDetails = async (ownerId: string) => {
  const company = await Company.findOne({
    ownerId,
  }).lean();

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
    await notifyAdminsOnRegistration(company.companyName, company.industry);
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

  const oldPublicId = company.logo?.publicId;

  const uploadedImage = await uploadFile(file, "company/logo");

  company.logo = {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
    resourceType: "image",
  };

  await company.save();

  if (oldPublicId) {
    try {
      await deleteFile(oldPublicId);
    } catch (err) {
      console.warn("[CLOUDINARY] Failed to delete old logo:", err);
    }
  }

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

  const oldPublicId = company.coverImage?.publicId;

  const uploadedImage = await uploadFile(file, "company/coverImage");

  company.coverImage = {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
    resourceType: "image",
  };

  await company.save();

  if (oldPublicId) {
    try {
      await deleteFile(oldPublicId);
    } catch (err) {
      console.warn("[CLOUDINARY] Failed to delete old cover image:", err);
    }
  }

  return company;
};

export const getCompanyByIdService = async (id: string) => {
  const company = await Company.findById(id).lean();
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

  if (industry && industry !== "All" && industry !== "all") {
    filter.industry = industry;
  }

  if (location && location !== "all" && location.trim()) {
    const regex = new RegExp(location.trim(), "i");
    filter.headquarters = regex;
  }

  const pageNum = page ? Math.max(1, Number(page)) : 1;
  const limitNum = limit ? Math.max(1, Number(limit)) : 9;
  const skip = (pageNum - 1) * limitNum;

  const pipeline: any[] = [
    { $match: filter },
    {
      $lookup: {
        from: "jobs",
        let: { compId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$companyId", "$$compId"] },
                  { $eq: ["$status", "Open"] },
                ],
              },
            },
          },
          { $count: "openCount" },
        ],
        as: "openJobsCountData",
      },
    },
    {
      $addFields: {
        openJobsCount: {
          $ifNull: [{ $arrayElemAt: ["$openJobsCountData.openCount", 0] }, 0],
        },
      },
    },
    {
      $project: {
        openJobsCountData: 0,
      },
    },
  ];

  let sortStage: any = { companyName: 1 };

  if (search && search.trim()) {
    const searchTrimmed = search.trim();
    const regex = new RegExp(searchTrimmed, "i");
    const prefixRegex = new RegExp("^" + searchTrimmed, "i");

    pipeline.push({
      $match: {
        $or: [
          { companyName: regex },
          { description: regex },
          { industry: regex },
        ],
      },
    });

    pipeline.push({
      $addFields: {
        searchWeight: {
          $cond: {
            if: { $regexMatch: { input: "$companyName", regex: prefixRegex } },
            then: 1,
            else: {
              $cond: {
                if: { $regexMatch: { input: "$companyName", regex: regex } },
                then: 2,
                else: 3,
              },
            },
          },
        },
      },
    });

    sortStage = { searchWeight: 1, companyName: 1 };
  }

  pipeline.push({
    $facet: {
      metadata: [{ $count: "totalCount" }],
      companies: [
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limitNum },
      ],
    },
  });

  const [facetResult] = await Company.aggregate(pipeline);
  const totalCount = facetResult?.metadata[0]?.totalCount || 0;
  const companies = facetResult?.companies || [];
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

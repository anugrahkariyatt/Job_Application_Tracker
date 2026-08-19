import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface ICompanyProfile extends Document {
  ownerId: Types.ObjectId;
  companyName: string;
  logo?: { url: string; publicId: string; resourceType: string };
  coverImage?: { url: string; publicId: string; resourceType: string };
  industry: string;
  companySize?: string;
  website?: string;
  email: string;
  phone?: string;
  description?: string;
  foundedYear?: number;
  headquarters?: string;
  address?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  verified?: boolean;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companyProfileSchema = new Schema<ICompanyProfile>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },

    logo: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      resourceType: { type: String, default: "image" },
    },

    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      resourceType: { type: String, default: "image" },
    },

    companySize: {
      type: String,
    },
    website: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    foundedYear: {
      type: Number,
    },
    headquarters: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        if (ret.logo && typeof ret.logo === "object") {
          ret.logo = ret.logo.url || "";
        }
        if (ret.coverImage && typeof ret.coverImage === "object") {
          ret.coverImage = ret.coverImage.url || "";
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret: any) => {
        if (ret.logo && typeof ret.logo === "object") {
          ret.logo = ret.logo.url || "";
        }
        if (ret.coverImage && typeof ret.coverImage === "object") {
          ret.coverImage = ret.coverImage.url || "";
        }
        return ret;
      },
    },
  },
);

companyProfileSchema.index({ companyName: "text", industry: "text", website: "text" });

const CompanyProfile: Model<ICompanyProfile> = mongoose.model<ICompanyProfile>(
  "CompanyProfile",
  companyProfileSchema,
);
export default CompanyProfile;

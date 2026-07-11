import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface ICompanyProfile extends Document {
  ownerId: Types.ObjectId;
  companyName: string;
  logo?: string;
  coverImage?: string;
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
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
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
  },
);

const CompanyProfile: Model<ICompanyProfile> = mongoose.model<ICompanyProfile>(
  "CompanyProfile",
  companyProfileSchema,
);
export default CompanyProfile;

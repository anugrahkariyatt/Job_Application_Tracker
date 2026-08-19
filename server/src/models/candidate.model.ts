import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICandidate extends Document {
  userId: Types.ObjectId;
  profileImage: { url: string; publicId: string; resourceType: string; };
  phone: string;
  location: string;
  headline: string;
  bio: string;
  resume: { url: string; publicId: string; resourceType: string; };
  portfolio: string;
  github: string;
  linkedin: string;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    profileImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      resourceType: { type: String, default: "image" }
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    headline: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    resume: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      resourceType: { type: String, default: "image" }
    },

    portfolio: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        if (ret.profileImage && typeof ret.profileImage === "object") {
          ret.profileImage = ret.profileImage.url || "";
        }
        if (ret.resume && typeof ret.resume === "object") {
          ret.resumeUrl = ret.resume.url || "";
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret: any) => {
        if (ret.profileImage && typeof ret.profileImage === "object") {
          ret.profileImage = ret.profileImage.url || "";
        }
        if (ret.resume && typeof ret.resume === "object") {
          ret.resumeUrl = ret.resume.url || "";
        }
        return ret;
      },
    },
  },
);

const Candidate: Model<ICandidate> = mongoose.model<ICandidate>(
  "Candidate",
  candidateSchema,
);

export default Candidate;

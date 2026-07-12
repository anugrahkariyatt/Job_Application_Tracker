import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICandidate extends Document {
  userId: Types.ObjectId;
  profileImage: string;
  phone: string;
  location: string;
  headline: string;
  bio: string;
  resumeUrl: string;
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
      type: String,
      default: "",
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

    resumeUrl: {
      type: String,
      default: "",
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
  },
);

const Candidate: Model<ICandidate> = mongoose.model<ICandidate>(
  "Candidate",
  candidateSchema,
);

export default Candidate;

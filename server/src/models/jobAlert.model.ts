import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IJobAlert extends Document {
  candidateId: Types.ObjectId;
  keywords: string[];
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  remote: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobAlertSchema = new Schema<IJobAlert>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    keywords: {
      type: [String],
      required: true,
    },

    location: {
      type: String,
      default: "",
    },

    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true,
    },

    remote: {
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

const JobAlert: Model<IJobAlert> = mongoose.model<IJobAlert>(
  "JobAlert",
  jobAlertSchema,
);

export default JobAlert;

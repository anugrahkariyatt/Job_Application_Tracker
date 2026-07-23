import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IApplication extends Document {
  candidateId: Types.ObjectId;
  jobId: Types.ObjectId;
  companyId: Types.ObjectId;
  status: "Applied" | "Under Review" | "Shortlisted" | "Interview" | "Rejected" | "Hired";
  aiMatchScore?: number;
  aiStrengths?: string[];
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },

    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Interview", "Rejected", "Hired"],
      default: "Applied",
      required: true,
    },

    aiMatchScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    aiStrengths: {
      type: [String],
      default: [],
    },

    aiSummary: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
applicationSchema.index(
  {
    candidateId: 1,
    jobId: 1,
  },
  {
    unique: true,
  },
);

const Application: Model<IApplication> = mongoose.model<IApplication>(
  "Application",
  applicationSchema,
);

export default Application;

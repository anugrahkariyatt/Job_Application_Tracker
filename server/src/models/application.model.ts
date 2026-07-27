import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAIScreening {
  score: number;
  strengths: string[];
  missingSkills: string[];
  summary: string;
  generatedAt: Date;
}

export interface IApplication extends Document {
  candidateId: Types.ObjectId;
  jobId: Types.ObjectId;
  companyId: Types.ObjectId;

  status:
  | "Applied"
  | "Under Review"
  | "Shortlisted"
  | "Interview"
  | "Rejected"
  | "Hired";

  aiScreening?: IAIScreening;

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

    aiScreening: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },

      strengths: {
        type: [String],
        default: [],
      },

      missingSkills: {
        type: [String],
        default: [],
      },

      summary: {
        type: String,
        default: "",
      },

      generatedAt: {
        type: Date,
      },
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

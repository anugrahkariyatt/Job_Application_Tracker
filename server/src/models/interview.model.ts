import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IInterview extends Document {
  applicationId: Types.ObjectId;
  candidateId: Types.ObjectId;
  jobId: Types.ObjectId;
  companyId: Types.ObjectId;
  title: string;
  date: Date;
  type: "Video Call" | "Onsite" | "Phone";
  link?: string;
  notes?: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

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

    title: {
      type: String,
      required: true,
      default: "Technical Interview",
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["Video Call", "Onsite", "Phone"],
      required: true,
      default: "Video Call",
    },

    link: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Interview: Model<IInterview> = mongoose.model<IInterview>(
  "Interview",
  interviewSchema,
);

export default Interview;

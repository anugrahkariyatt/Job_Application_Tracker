import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IExperience extends Document {
  candidateId: Types.ObjectId;
  companyName: string;
  jobTitle: string;
  employmentType: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  currentlyWorking: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<IExperience>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Freelance"],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    currentlyWorking: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Experience: Model<IExperience> = mongoose.model<IExperience>(
  "Experience",
  experienceSchema,
);

export default Experience;

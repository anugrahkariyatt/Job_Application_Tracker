import mongoose, { Schema, InferSchemaType } from "mongoose";

const jobSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    requirements: {
      type: String,
      required: true,
      trim: true,
    },

    responsibilities: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      required: true,
      default: [],
    },

    employmentType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Internship",
        "Contract",
        "Freelance",
      ],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: [
        "Fresher",
        "Junior",
        "Mid-Level",
        "Senior",
        "Lead",
      ],
      required: true,
    },

    salaryMin: {
      type: Number,
      required: true,
      min: 0,
    },

    salaryMax: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    remote: {
      type: Boolean,
      default: false,
    },

    vacancies: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    applicationDeadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Open", "Closed", "Draft"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  },
);

export type Job = InferSchemaType<typeof jobSchema>;

const Job = mongoose.model<Job>("Job", jobSchema);

export default Job;
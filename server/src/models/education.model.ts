import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IEducation extends Document {
  candidateId: Types.ObjectId;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  currentlyStudying: boolean;
  grade: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const educationSchema = new Schema<IEducation>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    institution: {
      type: String,
      required: true,
      trim: true,
    },

    degree: {
      type: String,
      required: true,
      trim: true,
    },

    fieldOfStudy: {
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

    currentlyStudying: {
      type: Boolean,
      default: false,
    },

    grade: {
      type: String,
      default: "",
      trim: true,
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

const Education: Model<IEducation> = mongoose.model<IEducation>(
  "Education",
  educationSchema,
);

export default Education;

import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "candidate" | "recruiter" | "admin";
  isVerified: boolean;
  isActive: boolean;
  preferences: {
    applicationReceived: boolean;
    candidateWithdrew: boolean;
    jobExpiring: boolean;
    companyUpdates: boolean;
    systemAlerts: boolean;
  };
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      applicationReceived: { type: Boolean, default: true },
      candidateWithdrew: { type: Boolean, default: true },
      jobExpiring: { type: Boolean, default: true },
      companyUpdates: { type: Boolean, default: false },
      systemAlerts: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;

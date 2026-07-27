import mongoose, { Schema, Document, Types } from "mongoose";
export enum AuthProvider {
  LOCAL = "local",
  GOOGLE = "google",
}
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "candidate" | "recruiter" | "admin";
  provider: AuthProvider;
  googleId?: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  subscriptionPlan: "free" | "pro";
  subscriptionExpiresAt?: Date;
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
      type: String
    },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
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
    subscriptionPlan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    subscriptionExpiresAt: {
      type: Date,
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

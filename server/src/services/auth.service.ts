import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import Candidate from "../models/candidate.model.js";
import Education from "../models/education.model.js";
import Experience from "../models/experience.model.js";
import Skill from "../models/skill.model.js";
import JobAlert from "../models/jobAlert.model.js";
import Subscription from "../models/subscription.model.js";
import { generateAccessToken } from "../utils/generateAccessToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import { compareValue, hashValue } from "../utils/bcrypt.js";
import { LoginInput, RegisterInput } from "../validations/auth.validation.js";
import RefreshToken from "../models/refreshToken.model.js";
import { verifyRefreshToken } from "../utils/verifyRefreshToken.js";
import { generatePasswordVerificationToken } from "../utils/generatePasswordVerificationToken.js";
import { verifyPasswordVerificationToken } from "../utils/verifyPasswordVerificationToken.js";
import { generatePasswordResetToken } from "../utils/generatePasswordRestToken.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "./mail.service.js";
import { verifyPasswordResetToken } from "../utils/verifyPasswordResetToken.js";
import { verifyEmailVerificationToken } from "../utils/verifyEmailVerificationToken.js";
import { generateEmailVerificationToken } from "../utils/generateEmailVerificationToken.js";
import { Request } from "express";
import { getClientUrl } from "../utils/clientUrl.util.js";

export const registerUser = async (data: RegisterInput, req?: Request | string) => {
  const existingUser = await User.findOne({
    email: data.email,
  });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }
  const hashedPassword = await hashValue(data.password);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
  });

  await sendVerificationEmailService(user._id.toString(), req);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const loginUser = async (data: LoginInput) => {
  const user = await User.findOne({
    email: data.email,
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await compareValue(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email before logging in.", 403);
  }

  // Reactivate user if they log back in
  if (!user.isActive) {
    user.isActive = true;
    await user.save();
  }

  const accessToken = generateAccessToken(user._id.toString(), user.role);

  const refreshToken = generateRefreshToken(user._id.toString(), user.role);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const hashedRefreshToken = await hashValue(refreshToken);

  await RefreshToken.create({
    user: user._id,
    token: hashedRefreshToken,
    expiresAt,
  });
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      subscriptionPlan: user.subscriptionPlan || "free",
      subscriptionExpiresAt: user.subscriptionExpiresAt || null,
      preferences: user.preferences,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshUser = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken) as {
    userId: string;
    role: string;
  };

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }
  const storedToken = await RefreshToken.findOne({
    user: user._id,
  });

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  const isValidRefreshToken = await compareValue(refreshToken, storedToken.token);

  if (!isValidRefreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }
  const accessToken = generateAccessToken(user._id.toString(), user.role!);

  const newRefreshToken = generateRefreshToken(user._id.toString(), user.role!);

  const hashedRefreshToken = await hashValue(newRefreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  storedToken.token = hashedRefreshToken;
  storedToken.expiresAt = expiresAt;

  await storedToken.save();

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken) as {
    userId: string;
    role: string;
  };
  const storedToken = await RefreshToken.findOne({
    user: decoded.userId,
  });
  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }
  const isValidRefreshToken = await compareValue(refreshToken, storedToken.token);

  if (!isValidRefreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }
  await storedToken.deleteOne();
};
export const verifyUserPassword = async (password: string, userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const hashedPassword = user.password;
  const isPasswordValid = await compareValue(password, hashedPassword);
  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }
  const verificationToken = generatePasswordVerificationToken(
    user._id.toString(),
  );

  return verificationToken;
};

export const updateUserPassword = async (password: string, token: string) => {
  const isValidpasswordtoken = verifyPasswordVerificationToken(token) as {
    userId: string;
    purpose: string;
  };

  if (!isValidpasswordtoken) {
    throw new AppError("Invalid password verifcation token", 401);
  }
  if (isValidpasswordtoken.purpose !== "change-password") {
    throw new AppError("Invalid password verification token", 401);
  }
  const user = await User.findById(isValidpasswordtoken.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const hashedPassword = await hashValue(password);
  user.password = hashedPassword;

  await user.save();
  return {
    message: "Password updated successfully",
  };
};

export const sendPasswordResetLink = async (email: string, req?: Request | string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetToken = await generatePasswordResetToken(user._id.toString());
  const clientUrl = getClientUrl(req);
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail({
    to: user.email,
    resetLink,
  });

  return {
    message: "Password reset link sent successfully",
  };
};

export const resetUserPassword = async (token: string, newPassword: string) => {
  const decoded = verifyPasswordResetToken(token) as {
    userId: string;
    purpose: string;
  };

  if (decoded.purpose !== "reset-password") {
    throw new AppError("Invalid reset token", 401);
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const hashedPassword = await hashValue(newPassword);

  user.password = hashedPassword;

  await user.save();
  await RefreshToken.deleteMany({
    user: user._id,
  });

  const accessToken = generateAccessToken(user._id.toString(), user.role!);
  const refreshToken = generateRefreshToken(user._id.toString(), user.role!);
  const hashedRefreshToken = await hashValue(refreshToken);

  await RefreshToken.create({
    user: user._id,
    token: hashedRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    message: "Password reset successfully",
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role!,
      isVerified: user.isVerified,
      isActive: user.isActive,
      preferences: user.preferences,
    },
    accessToken,
    refreshToken,
  };
};

export const sendVerificationEmailService = async (userId: string, req?: Request | string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Email is already verified", 400);
  }

  const verificationToken = generateEmailVerificationToken(user._id.toString());

  const clientUrl = getClientUrl(req);
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  await sendVerificationEmail({
    to: user.email,
    verificationLink,
  });
  return {
    message: "Verification email sent successfully",
  };
};

export const resendVerificationEmailService = async (email: string, req?: Request | string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Email is already verified", 400);
  }

  const verificationToken = generateEmailVerificationToken(user._id.toString());

  const clientUrl = getClientUrl(req);
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  await sendVerificationEmail({
    to: user.email,
    verificationLink,
  });

  return {
    message: "Verification email sent successfully",
  };
};

export const verifyEmailService = async (token: string) => {
  const decoded = verifyEmailVerificationToken(token);

  if (decoded.purpose !== "verify-email") {
    throw new AppError("Invalid verification token", 401);
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Email is already verified", 400);
  }

  user.isVerified = true;

  await user.save();

  return {
    message: "Email verified successfully",
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).select(
    "name email role isVerified isActive preferences subscriptionPlan subscriptionExpiresAt",
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const updateUserPreferencesService = async (
  userId: string,
  preferences: any,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.preferences = {
    ...user.preferences,
    ...preferences,
  };

  await user.save();
  return user.preferences;
};

export const deactivateUserService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isActive = false;
  await user.save();

  await RefreshToken.deleteMany({ user: userId });
  return { success: true };
};

export const deleteUserService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Delete all refresh tokens
  await RefreshToken.deleteMany({ user: userId });

  // If recruiter, delete company & jobs & applications
  if (user.role === "recruiter") {
    const company = await Company.findOne({ ownerId: userId });
    if (company) {
      const companyId = company._id;
      await Job.deleteMany({ companyId });
      await Application.deleteMany({ companyId });
      await Company.findByIdAndDelete(companyId);
    }
  } else if (user.role === "candidate") {
    // Cascade delete all candidate associated records
    const candidate = await Candidate.findOne({ userId: userId });
    if (candidate) {
      const candidateId = candidate._id;
      await Education.deleteMany({ candidateId });
      await Experience.deleteMany({ candidateId });
      await Skill.deleteMany({ candidateId });
      await JobAlert.deleteMany({ candidateId });
      await Subscription.deleteMany({ candidateId });
      await Application.deleteMany({ candidateId });
      await Candidate.findByIdAndDelete(candidateId);
    }
  }

  // Delete user
  await User.findByIdAndDelete(userId);
  return { success: true };
};

import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
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
export const registerUser = async (data: RegisterInput) => {
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
  if (!user.isActive) {
    throw new AppError("Account is disabled", 403);
  }

  const isPasswordValid = await compareValue(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
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

  const isValidRefreshToken = await hashValue(refreshToken, storedToken.token);

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
  const isValidRefreshToken = await hashValue(refreshToken, storedToken.token);

  if (!isValidRefreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }
  await storedToken.deleteOne();
};
export const verifyUserPassword = async (password: string, userId: string) => {
  const user = await User.findById(userId);
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
  const isValidpasswordtoken = await verifyPasswordVerificationToken(token);

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

export const sendPasswordResetLink = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetToken = await generatePasswordResetToken(user._id.toString());
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail({
    to: "anugrahk489@gmail.com",
    resetLink,
  });

  return {
    message: "Password reset link sent successfully",
  };
};

export const resetUserPassword = async (token: string, newPassword: string) => {
  const decoded = verifyPasswordResetToken(token);

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
  return {
    message: "Password reset successfully",
  };
};

export const sendVerificationEmailService = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Email is already verified", 400);
  }

  const verificationToken = generateEmailVerificationToken(user._id.toString());

  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  await sendVerificationEmail({
    to: "anugrahk489@gmail.com",
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

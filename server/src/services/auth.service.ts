import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { generateAccessToken } from "../utils/generateAccessToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import { compareValue, hashValue } from "../utils/bcrypt.js";
import { LoginInput, RegisterInput } from "../validations/auth.validation.js";
import RefreshToken from "../models/RefreshToken.js";
import { verifyRefreshToken } from "../utils/verifyRefreshToken.js";

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await User.findOne({
    email: data.email,
  });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }
  const hashedPassword = await data.password;

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

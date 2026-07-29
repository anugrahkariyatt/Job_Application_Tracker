import axios from "axios";
import { googleClient } from "../config/google.config.js";
import { AppError } from "../utils/AppError.js";
import User, { AuthProvider } from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import { hashValue } from "../utils/bcrypt.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt.util.js";

export const verifyGoogleToken = async (idToken?: string, accessToken?: string) => {
    if (idToken) {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            throw new AppError("Invalid Google token", 401);
        }

        return payload;
    }

    if (accessToken) {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = response.data;
        if (!data || !data.email) {
            throw new AppError("Invalid Google access token", 401);
        }

        return {
            email: data.email,
            name: data.name || data.email.split("@")[0],
            picture: data.picture,
            sub: data.sub,
        };
    }

    throw new AppError("Google token is required", 400);
};

export const googleLoginUser = async (
  tokenData: { idToken?: string; accessToken?: string },
  role: "candidate" | "recruiter"
) => {
  if (!["candidate", "recruiter"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  const payload = await verifyGoogleToken(tokenData.idToken, tokenData.accessToken);

  const { email, name, picture, sub } = payload;

  if (!email) {
    throw new AppError("Google account email not found", 400);
  }

  let user = await User.findOne({ email });

  if (user) {
    if (user.role === "admin") {
      throw new AppError(
        "Google login is not available for administrator accounts.",
        403
      );
    }

    if (user.role !== role) {
      throw new AppError(
        `This account is registered as a ${user.role}. Please use the ${user.role} login page.`,
        403
      );
    }

    if (!user.isActive) {
      user.isActive = true;
    }

    if (
      user.provider === AuthProvider.LOCAL &&
      !user.googleId
    ) {
      user.googleId = sub;
      user.avatar = user.avatar || picture;
      user.isVerified = true;
    }

    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      provider: AuthProvider.GOOGLE,
      googleId: sub,
      avatar: picture,
      role,
      isVerified: true,
    });
  }

  const accessToken = generateAccessToken(
    user._id.toString(),
    user.role
  );

  const refreshToken = generateRefreshToken(
    user._id.toString(),
    user.role
  );

  const hashedRefreshToken = await hashValue(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.findOneAndUpdate(
    { user: user._id },
    { token: hashedRefreshToken, expiresAt },
    { upsert: true, new: true }
  );

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
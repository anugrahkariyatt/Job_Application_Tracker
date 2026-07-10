import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const generatePasswordResetToken = (userId: string): string => {
  const secret = process.env.PASSWORD_RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.sign(
    {
      userId,
      purpose: "reset-password",
    },
    secret,
    {
      expiresIn: "15m",
    },
  );
};

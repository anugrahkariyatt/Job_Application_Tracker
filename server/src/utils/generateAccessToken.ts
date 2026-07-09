import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const generateAccessToken = (userId: string, role: string): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.sign(
    {
      userId,
      role,
    },
    secret,
    {
      expiresIn: "15m",
    },
  );
};

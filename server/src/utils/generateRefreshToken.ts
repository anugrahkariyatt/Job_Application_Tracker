import jwt from "jsonwebtoken";

export const generateRefreshToken = (userId: string, role: string): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;

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
      expiresIn: "7d",
    },
  );
};

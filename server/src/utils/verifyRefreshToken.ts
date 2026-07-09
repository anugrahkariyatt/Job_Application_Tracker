import jwt from "jsonwebtoken";

export const verifyRefreshToken = (token: string) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }

  return jwt.verify(token, secret);
};
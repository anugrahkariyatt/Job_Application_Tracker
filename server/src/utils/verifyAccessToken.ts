import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export const verifyAccessToken = (token: string) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }

  return jwt.verify(token, secret) as AccessTokenPayload;
};

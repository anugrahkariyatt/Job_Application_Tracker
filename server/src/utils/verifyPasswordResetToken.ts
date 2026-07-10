import jwt from "jsonwebtoken";

export const verifyPasswordResetToken = (token: string) => {
  const secret = process.env.PASSWORD_RESET_TOKEN_SECRET;

  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }

  return jwt.verify(token, secret);
};

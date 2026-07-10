import jwt from "jsonwebtoken";

export const verifyPasswordVerificationToken = (token: string) => {
  const secret = process.env.PASSWORD_VERIFICATION_SECRET;

  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }

  return jwt.verify(token, secret);
};

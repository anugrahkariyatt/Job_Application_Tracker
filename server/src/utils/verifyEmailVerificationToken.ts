import jwt from "jsonwebtoken";

export const verifyEmailVerificationToken = (token: string) => {
  const secret = process.env.EMAIL_VERIFICATION_TOKEN_SECRET;

  if (!secret) {
    throw new Error("EMAIL_VERIFICATION_TOKEN_SECRET is missing");
  }

  return jwt.verify(token, secret) as {
    userId: string;
    purpose: string;
  };
};
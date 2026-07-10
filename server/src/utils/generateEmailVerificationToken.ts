import jwt from "jsonwebtoken";

export const generateEmailVerificationToken = (
  userId: string,
): string => {
  const secret = process.env.EMAIL_VERIFICATION_TOKEN_SECRET;

  if (!secret) {
    throw new Error("EMAIL_VERIFICATION_TOKEN_SECRET is missing");
  }

  return jwt.sign(
    {
      userId,
      purpose: "verify-email",
    },
    secret,
    {
      expiresIn: "1d",
    },
  );
};
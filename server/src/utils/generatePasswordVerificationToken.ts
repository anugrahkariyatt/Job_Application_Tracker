import jwt from "jsonwebtoken";

export const generatePasswordVerificationToken = (userId: string): string => {
  const secret = process.env.PASSWORD_VERIFICATION_SECRET;

  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }

  return jwt.sign(
    {
      userId,
      purpose: "change-password",
    },
    secret,
    {
      expiresIn: "5m",
    },
  );
};

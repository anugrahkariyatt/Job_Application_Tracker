import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (userId: string, role: string): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.sign({ userId, role }, secret, { expiresIn: "3h" });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.verify(token, secret) as AccessTokenPayload;
};

export const generateRefreshToken = (userId: string, role: string): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.sign({ userId, role }, secret, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token: string) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.verify(token, secret);
};

export const generateEmailVerificationToken = (userId: string): string => {
  const secret = process.env.EMAIL_VERIFICATION_TOKEN_SECRET;
  if (!secret) {
    throw new Error("EMAIL_VERIFICATION_TOKEN_SECRET is missing");
  }
  return jwt.sign({ userId, purpose: "verify-email" }, secret, { expiresIn: "1d" });
};

export const verifyEmailVerificationToken = (token: string) => {
  const secret = process.env.EMAIL_VERIFICATION_TOKEN_SECRET;
  if (!secret) {
    throw new Error("EMAIL_VERIFICATION_TOKEN_SECRET is missing");
  }
  return jwt.verify(token, secret) as { userId: string; purpose: string };
};

export const generatePasswordResetToken = (userId: string): string => {
  const secret = process.env.PASSWORD_RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.sign({ userId, purpose: "reset-password" }, secret, { expiresIn: "15m" });
};

export const verifyPasswordResetToken = (token: string) => {
  const secret = process.env.PASSWORD_RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.verify(token, secret);
};

export const generatePasswordVerificationToken = (userId: string): string => {
  const secret = process.env.PASSWORD_VERIFICATION_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.sign({ userId, purpose: "change-password" }, secret, { expiresIn: "5m" });
};

export const verifyPasswordVerificationToken = (token: string) => {
  const secret = process.env.PASSWORD_VERIFICATION_SECRET;
  if (!secret) {
    throw new Error("JWT environment variables are missing");
  }
  return jwt.verify(token, secret);
};

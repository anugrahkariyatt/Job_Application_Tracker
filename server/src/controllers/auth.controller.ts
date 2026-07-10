import { NextFunction, Request, Response } from "express";
import {
  loginUser,
  registerUser,
  refreshUser,
  logoutUser,
  updateUserPassword,
  verifyUserPassword,
  sendPasswordResetLink,
  sendVerificationEmailService,
  resetUserPassword,
  verifyEmailService,
} from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import { z } from "zod";
import { AppError } from "../utils/AppError.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }
    const result = await registerUser(validation.data);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }
    const result = await loginUser(validation.data);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token not found", 401);
    }

    const result = await refreshUser(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token not found", 401);
    }

    await logoutUser(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};
export const verifyPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const Password = req.body.password;
    if (!Password) {
      throw new AppError("Password not found", 400);
    }
    console.log("UserId", req.user);
    const userId = req.user?._id;

    const verificationToken = await verifyUserPassword(Password, userId);

    return res.status(200).json({
      success: true,
      verificationToken,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePasword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { password, token } = req.body;

    if (!password) {
      throw new AppError("Password is required", 400);
    }
    const result = await updateUserPassword(password, token);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email = req.body.email;
    if (!email) {
      throw new AppError("email is required", 400);
    }
    const result = await sendPasswordResetLink(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, password } = req.body;
    if (!token) {
      throw new AppError("Reset token is required", 400);
    }

    if (!password) {
      throw new AppError("New password is required", 400);
    }
    const result = await resetUserPassword(token, password);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const sendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const result = await sendVerificationEmailService(userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      throw new AppError("Verification token is required", 400);
    }

    const result = await verifyEmailService(token);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

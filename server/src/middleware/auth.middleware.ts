import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/verifyAccessToken.js";
import User from "../models/user.model.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {


    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return next(new AppError("Access token is missing", 401));
    }
    const decoded = verifyAccessToken(accessToken);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new AppError("User does not exist", 401));
    }
    if (user.isActive === false) {
      return next(new AppError("Account is disabled", 403));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};

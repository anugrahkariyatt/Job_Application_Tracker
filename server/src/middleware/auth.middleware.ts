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
    const authorization = req.headers.authorization;

    if (!authorization) {
      return next(new AppError("Authorization header is missing", 401));
    }

    if (!authorization.startsWith("Bearer ")) {
      return next(new AppError("Invalid authorization format", 401));
    }

    const accessToken = authorization.split(" ")[1];

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
    console.log(req.user);

    next();
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `\'${req.user.role}\' does not have permission to access this route`,
          403,
        ),
      );
    }

    next();
  };
};

import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      console.error("<<<<<<[MulterError]>>>>>>", err);

      return res.status(400).json({
        success: false,
        message: "Image is too large. Maximum allowed size is 2MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof AppError) {
    console.error("<<<<<<[AppError]>>>>>>", err);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  console.error("<<<<<<[Unknown Error]>>>>>>", err);

  return res.status(500).json({
    success: false,
    message: "Intern Server Error",
  });
};

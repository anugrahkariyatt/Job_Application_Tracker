import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

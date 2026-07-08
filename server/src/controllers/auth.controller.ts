import { NextFunction, Request, Response } from "express";
import { registerUser } from "../services/auth.service.js";
import { registerSchema } from "../validations/auth.validation.js";
import { z } from "zod";

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
    return res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

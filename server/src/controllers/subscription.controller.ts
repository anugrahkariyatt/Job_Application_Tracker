import { Request, Response, NextFunction } from "express";
import {
  getMySubscriptions,
  subscribeCompany,
  unsubscribeCompany,
} from "../services/subscription.service.js";
import {
  getSubscriptionSchema,
  subscribeCompanySchema,
} from "../validations/subscription.validation.js";
import z from "zod";

export const subscribeCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = subscribeCompanySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    const result = await subscribeCompany(
      req.user!.id,
      validation.data.companyId,
    );

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getMySubscriptionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMySubscriptions(req.user!.id);

    return res.status(200).json({
      success: true,
      message: "Subscriptions fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const unsubscribeCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = getSubscriptionSchema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    await unsubscribeCompany(req.user!.id, validation.data.subscriptionId);

    return res.status(200).json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { getNotificationSchema } from "../validations/notification.validation.js";
import {
  deleteNotification,
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notification.service.js";

export const getMyNotificationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getMyNotifications(req.user!.id);

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsReadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = getNotificationSchema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    const result = await markNotificationAsRead(
      req.user!.id,
      validation.data.notificationId,
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = getNotificationSchema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: z.flattenError(validation.error),
      });
    }

    await deleteNotification(
      req.user!.id,
      validation.data.notificationId,
    );

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
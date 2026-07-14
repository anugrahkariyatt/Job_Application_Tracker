import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "APPLICATION" | "JOB_ALERT" | "SUBSCRIPTION" | "SYSTEM",
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const notification = await Notification.create({
    userId: user._id,
    title,
    message,
    type,
  });

  return notification;
};

export const getMyNotifications = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const notifications = await Notification.find({
    userId: user._id,
  }).sort({
    createdAt: -1,
  });

  return notifications;
};

export const markNotificationAsRead = async (
  userId: string,
  notificationId: string,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.userId.toString() !== user._id.toString()) {
    throw new AppError(
      "You are not authorized to update this notification",
      403,
    );
  }

  if (notification.isRead) {
    throw new AppError("Notification already marked as read", 400);
  }

  notification.isRead = true;

  await notification.save();

  return notification;
};

export const deleteNotification = async (
  userId: string,
  notificationId: string,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.userId.toString() !== user._id.toString()) {
    throw new AppError(
      "You are not authorized to delete this notification",
      403,
    );
  }

  await notification.deleteOne();

  return;
};

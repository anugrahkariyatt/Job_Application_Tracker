import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  deleteNotificationController,
  getMyNotificationsController,
  markNotificationAsReadController,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", authenticate, getMyNotificationsController);

router.patch(
  "/:notificationId/read",
  authenticate,
  markNotificationAsReadController,
);

router.delete("/:notificationId", authenticate, deleteNotificationController);

export default router;

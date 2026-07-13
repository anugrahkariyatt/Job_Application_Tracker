import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  subscribeCompanyController,
  getMySubscriptionsController,
  unsubscribeCompanyController,
} from "../controllers/subscription.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("candidate"),
  subscribeCompanyController,
);

router.get(
  "/",
  authenticate,
  authorize("candidate"),
  getMySubscriptionsController,
);

router.delete(
  "/:subscriptionId",
  authenticate,
  authorize("candidate"),
  unsubscribeCompanyController,
);

export default router;

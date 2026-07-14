import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  createJobAlertController,
  deleteJobAlertController,
  getMyJobAlertsController,
  updateJobAlertController,
} from "../controllers/jobAlert.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("candidate"),
  createJobAlertController,
);

router.get("/", authenticate, authorize("candidate"), getMyJobAlertsController);

router.patch(
  "/:jobAlertId",
  authenticate,
  authorize("candidate"),
  updateJobAlertController,
);

router.delete(
  "/:jobAlertId",
  authenticate,
  authorize("candidate"),
  deleteJobAlertController,
);

export default router;

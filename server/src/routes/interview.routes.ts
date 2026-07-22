import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  createInterviewController,
  updateInterviewStatusController,
  getMyInterviewsController,
} from "../controllers/interview.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("recruiter"),
  createInterviewController,
);

router.patch(
  "/:interviewId/status",
  authenticate,
  updateInterviewStatusController,
);

router.get(
  "/",
  authenticate,
  getMyInterviewsController,
);

export default router;

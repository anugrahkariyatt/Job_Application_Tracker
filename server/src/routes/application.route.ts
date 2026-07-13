import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  applyForJobController,
  getAllAppliedApplicationsController,
  deleteApplicationController,
  FetchApplicantByJobIdController,
  updateApplicationStatusController,
} from "../controllers/application.controller.js";
import { updateApplicationStatus } from "../services/application.service.js";

const router = Router();

router.post("/", authenticate, authorize("candidate"), applyForJobController);

router.get(
  "/",
  authenticate,
  authorize("candidate"),
  getAllAppliedApplicationsController,
);

router.delete(
  "/:applicationId",
  authenticate,
  authorize("candidate"),
  deleteApplicationController,
);

//recurter

router.get(
  "/job/:jobId",
  authenticate,
  authorize("recruiter"),
  FetchApplicantByJobIdController,
);
router.patch(
  "/:applicationId/status",
  authenticate,
  authorize("recruiter"),
  updateApplicationStatusController,
);

export default router;

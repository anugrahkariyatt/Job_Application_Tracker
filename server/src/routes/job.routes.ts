import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  createJobController,
  deleteJobController,
  getJobByIdController,
  getMyJobsController,
  updateJobController,
} from "../controllers/job.controller.js";

const router = Router();

router.post("/", authenticate, authorize("recruiter"), createJobController);

router.get(
  "/my-jobs",
  authenticate,
  authorize("recruiter"),
  getMyJobsController,
);

router.patch(
  "/:jobId",
  authenticate,
  authorize("recruiter"),
  updateJobController,
);

router.delete(
  "/:jobId",
  authenticate,
  authorize("recruiter"),
  deleteJobController,
);

router.get("/:jobId", getJobByIdController);

export default router;

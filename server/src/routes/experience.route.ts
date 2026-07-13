import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  addExperienceController,
  getMyExperienceController,
  updateExperienceController,
  deleteExperienceController,
} from "../controllers/experience.controller.js";

const router = Router();

router.post("/", authenticate, authorize("candidate"), addExperienceController);

router.get(
  "/",
  authenticate,
  authorize("candidate"),
  getMyExperienceController,
);

router.patch(
  "/:experienceId",
  authenticate,
  authorize("candidate"),
  updateExperienceController,
);

router.delete(
  "/:experienceId",
  authenticate,
  authorize("candidate"),
  deleteExperienceController,
);

export default router;

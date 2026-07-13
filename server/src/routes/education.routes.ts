import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  addEducationController,
  getMyEducationController,
  updateEducationController,
  deleteEducationController,
} from "../controllers/education.controller.js";

const router = Router();

router.post("/", authenticate, authorize("candidate"), addEducationController);

router.get("/", authenticate, authorize("candidate"), getMyEducationController);

router.patch(
  "/:educationId",
  authenticate,
  authorize("candidate"),
  updateEducationController,
);

router.delete(
  "/:educationId",
  authenticate,
  authorize("candidate"),
  deleteEducationController,
);

export default router;

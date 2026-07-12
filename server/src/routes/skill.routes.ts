import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  addSkillController,
  getMySkillsController,
  updateSkillController,
  deleteSkillController,
} from "../controllers/skill.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("candidate"),
  addSkillController,
);

router.get(
  "/",
  authenticate,
  authorize("candidate"),
  getMySkillsController,
);

router.patch(
  "/:skillId",
  authenticate,
  authorize("candidate"),
  updateSkillController,
);

router.delete(
  "/:skillId",
  authenticate,
  authorize("candidate"),
  deleteSkillController,
);

export default router;
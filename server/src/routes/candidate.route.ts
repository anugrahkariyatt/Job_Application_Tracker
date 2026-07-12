import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  createCandidateController,
  getMyCandidateController,
  updateCandidateController,
  updateProfileImageController,
  updateResumeController,
} from "../controllers/candidate.conrtoller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("candidate"),
  createCandidateController,
);
router.get("/", authenticate, authorize("candidate"), getMyCandidateController);
router.patch(
  "/",
  authenticate,
  authorize("candidate"),
  updateCandidateController,
);
router.patch(
  "/profile-image",
  authenticate,
  authorize("candidate"),
  upload.single("profileImage"),
  updateProfileImageController,
);
router.patch(
  "/resume",
  authenticate,
  authorize("candidate"),
  upload.single("resume"),
  updateResumeController,
);
export default router;

import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  createCompany,
  getMyCompany,
  updateCompany,
  updateLogo,
  updateCoverImage,
  getRecruiterDashboardStats,
} from "../controllers/company.controllers.js";
const router = Router();

router.get("/dashboard-stats", authenticate, authorize("recruiter"), getRecruiterDashboardStats);
router.post("/", authenticate, authorize("recruiter"), createCompany);
router.get("/", authenticate, authorize("recruiter"), getMyCompany);
router.patch("/", authenticate, authorize("recruiter"), updateCompany);
router.patch(
  "/logo",
  authenticate,
  authorize("recruiter"),
  upload.single("logo"),
  updateLogo,
);
router.patch(
  "/cover-image",
  authenticate,
  authorize("recruiter"),
  upload.single("coverImage"),
  updateCoverImage,
);

export default router;

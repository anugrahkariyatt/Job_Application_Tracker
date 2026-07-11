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
} from "../controllers/company.controllers.js";
const router = Router();

router.post("/", authenticate, authorize("recruiter"), createCompany);
router.get("/", authenticate, authorize("recruiter"), getMyCompany);
router.patch("/", authenticate, authorize("recruiter"), updateCompany);
router.patch(
  "/logo",
  authenticate,
  authorize("recruiter"),
  (req, res, next) => {
    console.log("Content-Type:", req.headers["content-type"]);
    next();
  },
  upload.single("logo"),
  updateLogo,
);
router.patch(
  "/cover-image",
  authenticate,
  authorize("recruiter"),
  (req, res, next) => {
    console.log("Content-Type:", req.headers["content-type"]);
    next();
  },
  upload.single("coverImage"),
  updateCoverImage,
);

export default router;

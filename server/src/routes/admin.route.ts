import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  getAllCompaniesController,
  getAllUsersController,
  getDashboardController,
  updateCompanyStatusController,
  updateCompanyVerificationController,
  updateUserStatusController,
} from "../controllers/admin.controller.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("admin"),
  getDashboardController,
);
router.get("/users", authenticate, authorize("admin"), getAllUsersController);

router.patch(
  "/users/:userId/status",
  authenticate,
  authorize("admin"),
  updateUserStatusController,
);

router.get(
  "/companies",
  authenticate,
  authorize("admin"),
  getAllCompaniesController,
);

router.patch(
  "/companies/:companyId/verify",
  authenticate,
  authorize("admin"),
  updateCompanyVerificationController,
);

router.patch(
  "/companies/:companyId/status",
  authenticate,
  authorize("admin"),
  updateCompanyStatusController,
);
export default router;

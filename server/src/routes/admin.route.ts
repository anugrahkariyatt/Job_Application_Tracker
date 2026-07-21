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
  deleteUserController,
  deleteCompanyController,
  getAllJobsController,
  deleteJobController,
  getAllApplicationsController,
  getJobByIdController,
  getApplicationByIdController,
  updateApplicationStatusController,
  getCompanyByIdController,
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

router.delete(
  "/users/:userId",
  authenticate,
  authorize("admin"),
  deleteUserController,
);

router.delete(
  "/companies/:companyId",
  authenticate,
  authorize("admin"),
  deleteCompanyController,
);

router.get(
  "/jobs",
  authenticate,
  authorize("admin"),
  getAllJobsController,
);

router.delete(
  "/jobs/:jobId",
  authenticate,
  authorize("admin"),
  deleteJobController,
);

router.get(
  "/applications",
  authenticate,
  authorize("admin"),
  getAllApplicationsController,
);

router.get(
  "/jobs/:jobId",
  authenticate,
  authorize("admin"),
  getJobByIdController,
);

router.get(
  "/applications/:applicationId",
  authenticate,
  authorize("admin"),
  getApplicationByIdController,
);

router.patch(
  "/applications/:applicationId/status",
  authenticate,
  authorize("admin"),
  updateApplicationStatusController,
);

router.get(
  "/companies/:companyId",
  authenticate,
  authorize("admin"),
  getCompanyByIdController,
);

export default router;

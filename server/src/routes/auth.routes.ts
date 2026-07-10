import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  verifyPassword,
  updatePasword,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/verify-password", authenticate, verifyPassword);
router.post("/update-password", authenticate, updatePasword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/send-verification-email", authenticate, sendVerificationEmail);
router.get("/verify-email", verifyEmail);

export default router;

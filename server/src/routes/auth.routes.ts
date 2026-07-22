import { Router } from "express";
import axios from "axios";
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
  getCurrentUserController,
  updatePreferences,
  deactivateAccount,
  deleteAccount,
  resendVerificationEmail,
  updateProfileController,
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
router.post("/resend-verification-email", resendVerificationEmail);
router.get("/verify-email", verifyEmail);
router.get("/profile", authenticate, getCurrentUserController);
router.put("/profile", authenticate, updateProfileController);
router.put("/preferences", authenticate, updatePreferences);
router.post("/deactivate", authenticate, deactivateAccount);
router.delete("/delete-account", authenticate, deleteAccount);


router.get("/test-n8n", async (req, res) => {
  const response = await axios.post(
    "http://localhost:5678/webhook/send-email",
    {
      type: "verification",
      email: "your-email@gmail.com",
      verificationLink: "https://google.com",
    }
  );

  res.json(response.data);
});

export default router;

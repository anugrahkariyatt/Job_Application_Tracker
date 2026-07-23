import { Router } from "express";
import {
  getSubscriptionStatusController,
  createCheckoutSessionController,
  verifyStripeSessionController,
  handlePaymentSuccessController,
} from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/status", authenticate, getSubscriptionStatusController);
router.post("/checkout", authenticate, createCheckoutSessionController);
router.post("/verify-session", authenticate, verifyStripeSessionController);
router.post("/success", authenticate, handlePaymentSuccessController);

export default router;

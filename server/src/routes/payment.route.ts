import { Router } from "express";
import {
  getSubscriptionStatusController,
  createCheckoutSessionController,
  handlePaymentSuccessController,
  createRazorpayOrderController,
} from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/status", authenticate, getSubscriptionStatusController);
router.post("/checkout", authenticate, createCheckoutSessionController);
router.post("/razorpay-order", authenticate, createRazorpayOrderController);
router.post("/success", authenticate, handlePaymentSuccessController);

export default router;

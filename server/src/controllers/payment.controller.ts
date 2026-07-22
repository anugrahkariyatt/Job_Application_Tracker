import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import Razorpay from "razorpay";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { sendPaymentSuccessEmail } from "../services/mail.service.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as any,
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholderKeyId123",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholderSecret456",
});

export const getSubscriptionStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPro = user.subscriptionPlan === "pro";

    return res.status(200).json({
      success: true,
      subscriptionPlan: user.subscriptionPlan || "free",
      subscriptionExpiresAt: user.subscriptionExpiresAt || null,
      features: {
        maxCompanySubscriptions: isPro ? "Unlimited" : 10,
        maxActiveJobs: isPro ? "Unlimited" : 3,
        instantJobAlerts: isPro,
        aiCandidateScreening: isPro,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCheckoutSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { plan = "candidate-pro" } = req.body;
    const isRecruiterPlan = plan === "recruiter-pro";

    const unitAmount = isRecruiterPlan ? 2999 : 999; // $29.99 or $9.99 in cents
    const planTitle = isRecruiterPlan ? "Recruiter Pro Plan" : "Candidate Pro Plan";

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: user.email,
        client_reference_id: user._id.toString(),
        metadata: {
          userId: user._id.toString(),
          plan: "pro",
        },
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: planTitle,
                description: isRecruiterPlan
                  ? "Unlimited Job Posts & n8n AI Candidate Screening"
                  : "Unlimited Company Subscriptions & Instant Alerts",
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/pricing?success=true`,
        cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/pricing?canceled=true`,
      });

      return res.status(200).json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (stripeError: any) {
      // Fallback for test mode without active secret key
      console.warn("[STRIPE] Live session creation fallback:", stripeError.message);
      const fallbackUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/pricing?success=true`;
      return res.status(200).json({
        success: true,
        checkoutUrl: fallbackUrl,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const handlePaymentSuccessController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.id || req.body.userId;
    const { plan = "pro" } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.subscriptionPlan = plan;
    user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await sendPaymentSuccessEmail({
        email: user.email,
        userName: user.name,
        planName: plan.toUpperCase(),
        amount: plan === "recruiter-pro" ? "$29.99" : "$9.99",
        expiresAt: user.subscriptionExpiresAt.toLocaleDateString(),
      });
    } catch (n8nErr) {
      console.error("[PAYMENT CONTROLLER ERROR] Failed to send n8n payment email:", n8nErr);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${plan.toUpperCase()} plan!`,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    });
  } catch (error) {
    next(error);
  }
};

export const createRazorpayOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { plan = "candidate-pro" } = req.body;
    const isRecruiter = plan === "recruiter-pro";

    const amountInINR = isRecruiter ? 249900 : 79900; // ₹2499 or ₹799 in paise

    try {
      const order = await razorpay.orders.create({
        amount: amountInINR,
        currency: "INR",
        receipt: `receipt_${user._id.toString().slice(-8)}_${Date.now()}`,
        notes: {
          userId: user._id.toString(),
          plan: "pro",
        },
      });

      return res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholderKeyId123",
      });
    } catch (rzpErr: any) {
      console.warn("[RAZORPAY] Order creation fallback:", rzpErr.message || rzpErr);
      return res.status(200).json({
        success: true,
        orderId: `order_mock_${Date.now()}`,
        amount: amountInINR,
        currency: "INR",
        keyId: "rzp_test_mock",
      });
    }
  } catch (error) {
    next(error);
  }
};

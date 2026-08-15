import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import jobRoutes from "./routes/job.routes.js";
import candidateRoutes from "./routes/candidate.route.js";
import skillRoutes from "./routes/skill.routes.js";
import educationRoutes from "./routes/education.routes.js";
import experienceRoutes from "./routes/experience.route.js";
import applicationRoutes from "./routes/application.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";
import jobAlertRoutes from "./routes/jobAlert.route.js";
import notificationRoutes from "./routes/notification.route.js";
import adminRoutes from "./routes/admin.route.js";
import interviewRoutes from "./routes/interview.routes.js";
import settingsRoutes from "./routes/settings.route.js";
import paymentRoutes from "./routes/payment.route.js";
import contactRoutes from "./routes/contact.route.js";

const app = express();

app.set("trust proxy", 1);

// Security Headers
app.use(helmet());

// CORS
const allowedOrigins = [
  "https://job-application-tracker-azure-eight.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allAllowedOrigins = [
  ...new Set([...allowedOrigins, ...envOrigins]),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  })
);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Body Parsing
app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// Cookies
app.use(cookieParser());

// Routes
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/company", companyRoutes);

app.use("/api/jobs", jobRoutes);

// Job seeker
app.use("/api/candidate", candidateRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/job-alerts", jobAlertRoutes);

// Both candidate/company
app.use("/api/application", applicationRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/interviews", interviewRoutes);

// Settings
app.use("/api/settings", settingsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contact", contactRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Error Handler
app.use(errorHandler);

export default app;
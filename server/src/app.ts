import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// All routes
app.use("/api/company", companyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

//job seeker
app.use("/api/candidate", candidateRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/job-alerts", jobAlertRoutes);
//for both
app.use("/api/application", applicationRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);

//admin
app.use("/api/admin", adminRoutes);
// error handler middleware
app.use(errorHandler);

export default app;

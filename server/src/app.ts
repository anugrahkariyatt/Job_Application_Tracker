import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import jobRoutes from "./routes/job.routes.js";
import candidateRoutes from "./routes/candidate.route.js";
import skillRoutes from "./routes/skill.routes.js";

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
// error handler middleware
app.use(errorHandler);

export default app;

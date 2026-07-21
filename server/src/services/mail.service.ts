import axios from "axios";
import { AppError } from "../utils/AppError.js";
import { n8nClient } from "../config/axios.config.js";

interface VerificationEmailOptions {
  to: string;
  verificationLink: string;
}

interface PasswordResetEmailOptions {
  to: string;
  resetLink: string;
}

interface ApplicationSubmittedEmailPayload {
  email: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  applicationDate: string;
}

interface ApplicationStatusEmailPayload {
  email: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  status: string;
}

export const sendApplicationStatusEmail = async (
  payload: ApplicationStatusEmailPayload,
): Promise<void> => {
  try {
    console.log("payload",payload);

    await n8nClient.post("/send-email", {
      type: "application-status-updated",
      ...payload,
    });
  } catch (error) {
    console.error("Email Service Error:", error);
    throw new AppError("Unable to send application status email", 500);
  }
};
export const sendApplicationSubmittedEmail = async (
  payload: ApplicationSubmittedEmailPayload,
): Promise<void> => {
  try {
    await n8nClient.post("/send-email", {
      type: "application-submitted",
      ...payload,
    });
  } catch (error) {
    console.error("Email Service Error:", error);
    throw new AppError("Unable to send application submitted email", 500);
  }
};
export const sendVerificationEmail = async ({
  to,
  verificationLink,
}: VerificationEmailOptions): Promise<void> => {
  try {
    await n8nClient.post("/send-email", {
      type: "verification",
      email: to,
      verificationLink,
    });
  } catch (error) {
    throw new AppError("Unable to send verification email", 500);
  }
};

interface JobAlertEmailPayload {
  email: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobId: string;
}

export const sendJobAlertEmail = async (
  payload: JobAlertEmailPayload,
): Promise<void> => {
  try {
    await n8nClient.post("/send-email", {
      type: "job-alert",
      ...payload,
    });
  } catch (error) {
    console.error("Job Alert Email Service Error:", error);
  }
};

export const sendPasswordResetEmail = async ({
  to,
  resetLink,
}: PasswordResetEmailOptions): Promise<void> => {
  try {
    await n8nClient.post("/send-email", {
      type: "forgot-password",
      email: to,
      resetLink,
    });
  } catch (error) {
    throw new AppError("Unable to send verification email", 500);
  }
};


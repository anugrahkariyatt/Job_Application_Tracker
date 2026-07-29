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
    console.log("[MAIL SERVICE] Sending application status update email via n8n:", payload.email, "Status:", payload.status);

    const response = await n8nClient.post("/send-email", {
      type: "application-status-updated",
      ...payload,
    });
    console.log("[MAIL SERVICE SUCCESS] n8n responded with status:", response.status, "data:", JSON.stringify(response.data || {}));
  } catch (error: any) {
    console.error("========== N8N EMAIL ERROR DEBUG ==========");
    console.error("[ENV] N8N_WEBHOOK_URL:", process.env.N8N_WEBHOOK_URL || "NOT SET");
    console.error("[ERROR] Code:", error?.code);                          // e.g. ECONNREFUSED, ETIMEDOUT, ENOTFOUND
    console.error("[ERROR] Message:", error?.message);
    console.error("[ERROR] Stack:", error?.stack);
    console.error("[HTTP] Response Status:", error?.response?.status);
    console.error("[HTTP] Response Data:", JSON.stringify(error?.response?.data || {}, null, 2));
    console.error("[HTTP] Response Headers:", JSON.stringify(error?.response?.headers || {}, null, 2));
    console.error("[REQUEST] Base URL:", error?.config?.baseURL);
    console.error("[REQUEST] Path:", error?.config?.url);
    console.error("[REQUEST] Full URL:", `${error?.config?.baseURL || ""}${error?.config?.url || ""}`);
    console.error("[REQUEST] Method:", error?.config?.method);
    console.error("[REQUEST] Payload:", error?.config?.data);
    console.error("==========================================");
  }
};

export const sendApplicationSubmittedEmail = async (
  payload: ApplicationSubmittedEmailPayload,
): Promise<void> => {
  try {
    console.log("[MAIL SERVICE] Sending application submitted email via n8n:", payload.email);

    await n8nClient.post("/send-email", {
      type: "application-submitted",
      ...payload,
    });
  } catch (error: any) {
    console.error("[MAIL SERVICE ERROR] Failed to send application submitted email via n8n:", error?.response?.data || error?.message || error);
  }
};
export interface ContactEmailPayload {
  name: string;
  email: string;
  role?: string;
  subject?: string;
  message: string;
}

export const sendContactFormEmail = async (payload: ContactEmailPayload): Promise<void> => {
  try {
    await n8nClient.post("/send-email", {
      type: "contact-form-submitted",
      ...payload,
    });
  } catch (error: any) {
    console.error("[MAIL SERVICE ERROR] Failed to send contact form email via n8n:", error?.response?.data || error?.message || error);
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

export interface JobSummary {
  jobId: string;
  title: string;
  companyName: string;
  location: string;
  employmentType: string;
  workplaceType: string; // Remote / Hybrid / Onsite
  experienceLevel?: string;
  salary?: string;
}

export interface JobAlertEmailPayload {
  email: string;
  candidateName: string;
  type?: "job-alert" | "scheduled-job-alert";
  frequency?: string;
  totalJobs?: number;
  jobs?: JobSummary[];
  // Fallback / legacy single-job fields for instant alerts
  jobTitle?: string;
  companyName?: string;
  location?: string;
  jobId?: string;
}

export const sendJobAlertEmail = async (
  payload: JobAlertEmailPayload,
): Promise<void> => {
  try {
    const alertType = payload.type || "scheduled-job-alert";
    const totalJobsCount = payload.totalJobs || payload.jobs?.length || (payload.jobTitle ? 1 : 0);

    console.log(
      "[MAIL SERVICE] Sending Job Alert email via n8n to:",
      payload.email,
      "Type:",
      alertType,
      "Frequency:",
      payload.frequency || "Daily",
      "Total jobs:",
      totalJobsCount
    );

    // Build clean payload for scheduled digest vs instant alert
    const postBody =
      alertType === "scheduled-job-alert"
        ? {
            type: "scheduled-job-alert",
            frequency: payload.frequency || "Daily",
            candidateName: payload.candidateName,
            email: payload.email,
            totalJobs: totalJobsCount,
            jobs: payload.jobs || [],
          }
        : {
            type: "job-alert",
            candidateName: payload.candidateName,
            email: payload.email,
            jobTitle: payload.jobTitle,
            companyName: payload.companyName,
            location: payload.location,
            jobId: payload.jobId,
          };

    const response = await n8nClient.post("/send-email", postBody);
    console.log(
      "[MAIL SERVICE SUCCESS] n8n Job Alert email response status:",
      response.status
    );
  } catch (error: any) {
    console.error(
      "[MAIL SERVICE ERROR] Failed to send Job Alert email via n8n:",
      error?.response?.data || error?.message || error
    );
  }
};

interface CompanyNewJobEmailPayload {
  email: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobId: string;
}

export const sendCompanyNewJobEmail = async (
  payload: CompanyNewJobEmailPayload,
): Promise<void> => {
  try {
    console.log("[MAIL SERVICE] Sending Company Subscription email to:", payload.email, "for job:", payload.jobTitle);
    const response = await n8nClient.post("/send-email", {
      type: "company-new-job",
      ...payload,
    });
    console.log("[MAIL SERVICE] n8n Company Subscription email response success:", response.status);
  } catch (error: any) {
    console.error("[MAIL SERVICE ERROR] Failed to send Company Subscription email via n8n:", error?.response?.data || error?.message || error);
  }
};

export const sendPasswordResetEmail = async ({
  to,
  resetLink,
}: PasswordResetEmailOptions): Promise<void> => {
  try {
    console.log("========== FORGOT PASSWORD ==========");
    console.log("Recipient:", to);
    console.log("Reset Link:", resetLink);
    console.log("Webhook:", process.env.N8N_WEBHOOK_URL);

    const response = await n8nClient.post("/send-email", {
      type: "forgot-password",
      email: to,
      resetLink,
    });

    console.log("Status:", response.status);
    console.log("Response:", response.data);
    console.log("====================================");
  } catch (error: any) {
    console.log("========== N8N ERROR ==========");
    console.log("Message:", error.message);
    console.log("URL:", error.config?.baseURL + error.config?.url);
    console.log("Payload:", error.config?.data);
    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.log("===============================");

    throw new AppError("Unable to send password reset email", 500);
  }
};

interface InterviewEmailPayload {
  email: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  interviewTitle: string;
  dateTime: string;
  type: string;
  link?: string;
}

export const sendInterviewEmail = async (
  payload: InterviewEmailPayload,
): Promise<void> => {
  try {
    console.log("[MAIL SERVICE] Sending Interview Scheduled email to:", payload.email, "for round:", payload.interviewTitle);
    const { type, ...rest } = payload;
    const response = await n8nClient.post("/send-email", {
      type: "interview-scheduled",
      interviewType: type,
      ...rest,
    });
    console.log("[MAIL SERVICE] n8n Interview Scheduled email response success:", response.status);
  } catch (error: any) {
    console.error("[MAIL SERVICE ERROR] Failed to send Interview Scheduled email via n8n:", error?.response?.data || error?.message || error);
  }
};

interface InterviewCancelledEmailPayload {
  email: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  interviewTitle: string;
  dateTime: string;
  cancelledBy: string;
}

export const sendInterviewCancelledEmail = async (
  payload: InterviewCancelledEmailPayload,
): Promise<void> => {
  try {
    console.log("[MAIL SERVICE] Sending Interview Cancelled email via n8n to:", payload.email, "for round:", payload.interviewTitle);
    const response = await n8nClient.post("/send-email", {
      type: "interview-cancelled",
      ...payload,
    });
    console.log("[MAIL SERVICE] n8n Interview Cancelled email response success:", response.status);
  } catch (error: any) {
    console.error("[MAIL SERVICE ERROR] Failed to send Interview Cancelled email via n8n:", error?.response?.data || error?.message || error);
  }
};



interface PaymentSuccessEmailPayload {
  email: string;
  userName: string;
  planName: string;
  amount: string;
  expiresAt: string;
}

export const sendPaymentSuccessEmail = async (
  payload: PaymentSuccessEmailPayload,
): Promise<void> => {
  try {
    console.log("[MAIL SERVICE] Sending Payment Receipt email to:", payload.email, "for plan:", payload.planName);
    const response = await n8nClient.post("/send-email", {
      type: "payment-success",
      ...payload,
    });
    console.log("[MAIL SERVICE] n8n Payment Receipt email response success:", response.status);
  } catch (error: any) {
    console.error("[MAIL SERVICE ERROR] Failed to send Payment Receipt email via n8n:", error?.response?.data || error?.message || error);
  }
};

interface CompanyRegistrationAdminAlertPayload {
  adminEmail: string;
  adminName: string;
  companyName: string;
  industry: string;
  registeredAt: string;
}

export const sendCompanyRegistrationAdminAlert = async (
  payload: CompanyRegistrationAdminAlertPayload,
): Promise<void> => {
  try {
    await n8nClient.post("/send-email", {
      type: "new-company-registered",
      ...payload,
    });
  } catch (error: any) {
    console.error("[MAIL SERVICE ERROR] Failed to trigger n8n Company Registration Admin alert:", error?.response?.data || error?.message || error);
  }
};


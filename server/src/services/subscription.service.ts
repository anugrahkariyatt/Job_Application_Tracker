import Candidate from "../models/candidate.model.js";
import CompanyProfile from "../models/company.model.js";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";
import { sendCompanyNewJobEmail } from "./mail.service.js";


const MAX_SUBSCRIPTIONS = 10;

export const subscribeCompany = async (userId: string, companyId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const maxAllowed = user.subscriptionPlan === "pro" ? Infinity : MAX_SUBSCRIPTIONS;

  const totalSubscriptions = await Subscription.countDocuments({
    candidateId: candidate._id,
  });

  if (totalSubscriptions >= maxAllowed) {
    throw new AppError(
      `Free plan allows subscribing to a maximum of ${MAX_SUBSCRIPTIONS} companies. Upgrade to Pro for unlimited subscriptions!`,
      400,
    );
  }

  const company = await CompanyProfile.findById(companyId);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const existingSubscription = await Subscription.findOne({
    candidateId: candidate._id,
    companyId: company._id,
  });

  if (existingSubscription) {
    throw new AppError("You are already subscribed to this company", 400);
  }

  const subscription = await Subscription.create({
    candidateId: candidate._id,
    companyId: company._id,
  });

  return subscription;
};

export const getMySubscriptions = async (userId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const subscriptions = await Subscription.find({
    candidateId: candidate._id,
  }).populate({
    path: "companyId",
  });

  return subscriptions;
};

export const unsubscribeCompany = async (
  userId: string,
  subscriptionId: string,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError(
      "You are not authorized to delete this subscription",
      403,
    );
  }

  await subscription.deleteOne();

  return;
};

export const notifyCompanySubscribers = async (
  job: any,
  alreadyNotifiedUserIds: Set<string> = new Set(),
) => {
  try {
    console.log("[SUBSCRIPTION SERVICE] Notifying subscribers for company:", job.companyId, "job:", job.title);

    // Ensure User model is referenced (important for Mongoose population)
    if (!User) {
      console.warn("[SUBSCRIPTION SERVICE] User model undefined");
    }

    const subscriptions = await Subscription.find({
      companyId: job.companyId,
    }).populate({
      path: "candidateId",
      populate: { path: "userId", select: "name email" },
    });

    console.log(`[SUBSCRIPTION SERVICE] Found ${subscriptions.length} subscribers for this company`);

    if (!subscriptions || subscriptions.length === 0) return;

    // Get company name
    let companyName = "Company";
    if (job.companyId && typeof job.companyId === "object" && job.companyId.companyName) {
      companyName = job.companyId.companyName;
    } else if (job.companyId) {
      const company = await CompanyProfile.findById(job.companyId);
      if (company) companyName = company.companyName;
    }

    const jobTitle = job.title || "";

    for (const sub of subscriptions) {
      const candidate = sub.candidateId as any;
      if (!candidate) continue;

      // Try to resolve user from populate or direct lookup
      let user = candidate.userId as any;
      if (!user || typeof user !== "object" || !user.email) {
        if (candidate.userId) {
          user = await User.findById(candidate.userId).select("name email");
        }
      }

      if (!user || !user._id) {
        console.log("[SUBSCRIPTION SERVICE] User not found for candidateId:", candidate._id);
        continue;
      }

      const userId = user._id.toString();

      // Skip if already notified via a matching Job Alert (de-duplication)
      if (alreadyNotifiedUserIds.has(userId)) {
        console.log(`[SUBSCRIPTION SERVICE] User ${userId} already notified via job alert, skipping duplicate`);
        continue;
      }

      console.log(`[SUBSCRIPTION SERVICE] Notifying subscriber: ${userId} (${user.email})`);

      // In-app notification
      try {
        await createNotification(
          userId,
          `New Job at ${companyName}`,
          `${companyName} posted a new job: ${jobTitle}`,
          "SUBSCRIPTION",
        );
        console.log(`[SUBSCRIPTION SERVICE] In-app notification created for user ${userId}`);
      } catch (notifErr) {
        console.error(`[SUBSCRIPTION SERVICE ERROR] Failed to create in-app notification for user ${userId}:`, notifErr);
      }

      // Email notification
      if (user.email) {
        await sendCompanyNewJobEmail({
          email: user.email,
          candidateName: user.name || "Candidate",
          jobTitle,
          companyName,
          location: job.location || "Remote",
          jobId: job._id.toString(),
        });
      } else {
        console.warn(`[SUBSCRIPTION SERVICE WARNING] User ${userId} has no email address`);
      }
    }
  } catch (error) {
    console.error("[SUBSCRIPTION SERVICE ERROR] Error notifying company subscribers:", error);
  }
};


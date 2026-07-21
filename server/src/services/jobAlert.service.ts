import Candidate from "../models/candidate.model.js";
import Company from "../models/company.model.js";
import JobAlert from "../models/jobAlert.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";
import { sendJobAlertEmail } from "./mail.service.js";

const MAX_JOB_ALERTS = 10;

export const createJobAlert = async (
  userId: string,
  keywords: string[],
  location: string,
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship",
  remote: boolean,
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const totalAlerts = await JobAlert.countDocuments({
    candidateId: candidate._id,
  });

  if (totalAlerts >= MAX_JOB_ALERTS) {
    throw new AppError(
      `You can create a maximum of ${MAX_JOB_ALERTS} job alerts`,
      400,
    );
  }

  const jobAlert = await JobAlert.create({
    candidateId: candidate._id,
    keywords,
    location,
    employmentType,
    remote,
  });

  return jobAlert;
};

export const getMyJobAlerts = async (userId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const jobAlerts = await JobAlert.find({
    candidateId: candidate._id,
  });

  return jobAlerts;
};

export const updateJobAlert = async (
  userId: string,
  jobAlertId: string,
  data: {
    keywords?: string[];
    location?: string;
    employmentType?: "Full-time" | "Part-time" | "Contract" | "Internship";
    remote?: boolean;
    isActive?: boolean;
  },
) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const jobAlert = await JobAlert.findById(jobAlertId);

  if (!jobAlert) {
    throw new AppError("Job alert not found", 404);
  }

  if (jobAlert.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError("You are not authorized to update this job alert", 403);
  }

  if (data.keywords !== undefined) jobAlert.keywords = data.keywords;
  if (data.location !== undefined) jobAlert.location = data.location;
  if (data.employmentType !== undefined) jobAlert.employmentType = data.employmentType;
  if (data.remote !== undefined) jobAlert.remote = data.remote;
  if (data.isActive !== undefined) jobAlert.isActive = data.isActive;

  await jobAlert.save();

  return jobAlert;
};

export const deleteJobAlert = async (userId: string, jobAlertId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const jobAlert = await JobAlert.findById(jobAlertId);

  if (!jobAlert) {
    throw new AppError("Job alert not found", 404);
  }

  if (jobAlert.candidateId.toString() !== candidate._id.toString()) {
    throw new AppError("You are not authorized to delete this job alert", 403);
  }

  await jobAlert.deleteOne();

  return;
};

export const processJobAlertsForNewJob = async (job: any): Promise<Set<string>> => {
  const notifiedUserIds = new Set<string>();
  try {
    console.log("[JOB ALERT SERVICE] Starting job alert matching for job:", job._id, job.title);

    // Ensure User model is registered before population
    if (!User) {
      console.warn("[JOB ALERT SERVICE] User model undefined");
    }


    const activeAlerts = await JobAlert.find({ isActive: true }).populate({
      path: "candidateId",
      populate: { path: "userId", select: "name email" },
    });

    console.log(`[JOB ALERT SERVICE] Found ${activeAlerts?.length || 0} active job alerts in DB`);

    if (!activeAlerts || activeAlerts.length === 0) {
      return notifiedUserIds;
    }

    let companyName = "Company";
    if (job.companyId && typeof job.companyId === "object" && job.companyId.companyName) {
      companyName = job.companyId.companyName;
    } else if (job.companyId) {
      const company = await Company.findById(job.companyId);
      if (company) {
        companyName = company.companyName;
      }
    }

    const jobTitle = job.title || "";
    const jobDescription = job.description || "";
    const jobSkills = Array.isArray(job.skills) ? job.skills.map((s: string) => s.toLowerCase()) : [];
    const jobLocation = (job.location || "").toLowerCase();
    const jobEmploymentType = job.employmentType;
    const isJobRemote = !!job.remote;

    for (const alert of activeAlerts) {
      const candidate = alert.candidateId as any;
      if (!candidate) {
        console.log("[JOB ALERT SERVICE] Alert candidateId not found, skipping alert:", alert._id);
        continue;
      }
      let user = candidate.userId as any;
      if (!user || typeof user !== "object" || !user.email) {
        if (candidate.userId) {
          user = await User.findById(candidate.userId).select("name email");
        }
      }

      if (!user || !user._id) {
        console.log("[JOB ALERT SERVICE] Candidate user object or ID not found, candidateId:", candidate._id);
        continue;
      }

      const userId = user._id.toString();

      if (notifiedUserIds.has(userId)) {
        console.log(`[JOB ALERT SERVICE] User ${userId} already notified for this job, skipping redundant alert`);
        continue;
      }

      // Match 1: Employment Type
      if (alert.employmentType && alert.employmentType !== jobEmploymentType) {
        console.log(`[JOB ALERT SERVICE] Employment type mismatch (Alert: ${alert.employmentType}, Job: ${jobEmploymentType}) for user ${userId}`);
        continue;
      }

      // Match 2: Remote Preference (if alert demands remote but job is not remote)
      if (alert.remote && !isJobRemote) {
        console.log(`[JOB ALERT SERVICE] Remote preference mismatch (Alert remote: true, Job remote: false) for user ${userId}`);
        continue;
      }

      // Match 3: Location (if specified in alert)
      if (alert.location && alert.location.trim() !== "") {
        const alertLoc = alert.location.trim().toLowerCase();
        if (alertLoc === "remote") {
          if (!isJobRemote && !jobLocation.includes("remote")) {
            console.log(`[JOB ALERT SERVICE] Location mismatch (Alert loc: "remote", Job is not remote) for user ${userId}`);
            continue;
          }
        } else if (alertLoc !== "any" && alertLoc !== "all") {
          if (!jobLocation.includes(alertLoc) && !alertLoc.includes(jobLocation)) {
            console.log(`[JOB ALERT SERVICE] Location mismatch (Alert loc: "${alertLoc}", Job loc: "${jobLocation}") for user ${userId}`);
            continue;
          }
        }
      }

      // Match 4: Keywords (if specified in alert)
      const validKeywords = Array.isArray(alert.keywords)
        ? alert.keywords.map((k: string) => k.toLowerCase().trim()).filter(Boolean)
        : [];

      if (validKeywords.length > 0) {
        const hasKeywordMatch = validKeywords.some((lowerKw: string) => {
          return (
            jobTitle.toLowerCase().includes(lowerKw) ||
            jobDescription.toLowerCase().includes(lowerKw) ||
            jobSkills.some((s: string) => s.includes(lowerKw))
          );
        });

        if (!hasKeywordMatch) {
          console.log(`[JOB ALERT SERVICE] Keyword mismatch (Alert keywords: ${JSON.stringify(validKeywords)}, Job Title/Skills: "${jobTitle}") for user ${userId}`);
          continue;
        }
      }


      console.log(`[JOB ALERT SERVICE] MATCH FOUND! Notifying user ${userId} (${user.email})`);
      notifiedUserIds.add(userId);

      // In-app notification
      try {
        await createNotification(
          userId,
          `New Job Match: ${jobTitle}`,
          `${companyName} posted a new job matching your alert: ${jobTitle}`,
          "JOB_ALERT",
        );
        console.log(`[JOB ALERT SERVICE] In-app notification created for user ${userId}`);
      } catch (notifErr) {
        console.error(`[JOB ALERT SERVICE ERROR] Failed to create in-app notification for user ${userId}:`, notifErr);
      }

      // Email notification
      if (user.email) {
        await sendJobAlertEmail({
          email: user.email,
          candidateName: user.name || "Candidate",
          jobTitle: jobTitle,
          companyName: companyName,
          location: job.location || "Remote",
          jobId: job._id.toString(),
        });
      } else {
        console.warn(`[JOB ALERT SERVICE WARNING] Candidate user ${userId} has no email address`);
      }
    }
  } catch (error) {
    console.error("[JOB ALERT SERVICE ERROR] Error processing job alerts:", error);
  }
  return notifiedUserIds;
};



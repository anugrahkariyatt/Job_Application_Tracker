import Candidate from "../models/candidate.model.js";
import Company from "../models/company.model.js";
import JobAlert from "../models/jobAlert.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";
import { sendJobAlertEmail, JobSummary } from "./mail.service.js";

const MAX_JOB_ALERTS = 10;

export const createJobAlert = async (
  userId: string,
  keywords: string[],
  location: string,
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship",
  remote: boolean,
  frequency: "Daily" | "Weekly" | "Monthly" = "Daily",
) => {
  const candidate = await Candidate.findOne({ userId }).lean();

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
    frequency,
  });

  return jobAlert;
};

export const getMyJobAlerts = async (userId: string) => {
  const candidate = await Candidate.findOne({ userId }).lean();

  if (!candidate) {
    return [];
  }

  const jobAlerts = await JobAlert.find({
    candidateId: candidate._id,
  }).lean();

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
    frequency?: "Daily" | "Weekly" | "Monthly";
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

  if (!jobAlert.candidateId.equals(candidate._id)) {
    throw new AppError("You are not authorized to update this job alert", 403);
  }
  jobAlert.set(data);
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


    const jobEmploymentType = job.employmentType;
    const isJobRemote = !!job.remote;
    const rawJobLocation = (job.location || "").trim();
    const jobLocation = rawJobLocation.toLowerCase();

    // Build targeted MongoDB query to fetch only potentially matching alerts
    const filterQuery: any = { isActive: true };

    // 1. Filter by Employment Type
    if (jobEmploymentType) {
      filterQuery.employmentType = jobEmploymentType;
    }

    // 2. Filter by Remote setting (if job is not remote, exclude alerts demanding remote)
    if (!isJobRemote && !jobLocation.includes("remote")) {
      filterQuery.remote = false;
    }

    // 3. Filter by Location
    if (rawJobLocation) {
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const locationTokens = rawJobLocation
        .split(/[\s,]+/)
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 1);

      const locationConditions: any[] = [
        { location: "" },
        { location: { $exists: false } },
        { location: null },
        { location: /^any$/i },
        { location: /^all$/i },
      ];

      locationConditions.push({ location: new RegExp(escapeRegex(rawJobLocation), "i") });
      for (const token of locationTokens) {
        locationConditions.push({ location: new RegExp(escapeRegex(token), "i") });
      }

      if (isJobRemote || jobLocation.includes("remote")) {
        locationConditions.push({ location: /^remote$/i });
      }

      filterQuery.$or = locationConditions;
    }

    console.log("[JOB ALERT SERVICE] Targeted MongoDB query filter:", JSON.stringify(filterQuery));

    const activeAlerts = await JobAlert.find(filterQuery).populate({
      path: "candidateId",
      populate: { path: "userId", select: "name email preferences" },
    });

    console.log(`[JOB ALERT SERVICE] Found ${activeAlerts?.length || 0} candidate job alerts matching MongoDB filter`);

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


    for (const alert of activeAlerts) {
      const candidate = alert.candidateId as any;
      if (!candidate) {
        console.log("[JOB ALERT SERVICE] Alert candidateId not found, skipping alert:", alert._id);
        continue;
      }
      let user = candidate.userId as any;
      if (!user || typeof user !== "object" || !user.email) {
        if (candidate.userId) {
          user = await User.findById(candidate.userId).select("name email preferences");
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
      const userPrefs = user.preferences || { jobExpiring: true };
      if (user.email) {
        if (userPrefs.jobExpiring !== false) {
          await sendJobAlertEmail({
            email: user.email,
            candidateName: user.name || "Candidate",
            type: "job-alert",
            jobTitle: jobTitle,
            companyName: companyName,
            location: job.location || "Remote",
            jobId: job._id.toString(),
          });
        } else {
          console.log(`[JOB ALERT SERVICE] Email suppressed for user ${userId} (${user.email}) due to jobExpiring preference Config`);
        }
      } else {
        console.warn(`[JOB ALERT SERVICE WARNING] Candidate user ${userId} has no email address`);
      }
    }
  } catch (error) {
    console.error("[JOB ALERT SERVICE ERROR] Error processing job alerts:", error);
  }
  return notifiedUserIds;
};

export const processScheduledJobAlerts = async (
  targetFrequency?: "Daily" | "Weekly" | "Monthly" | "All"
) => {
  const stats = {
    processedAlerts: 0,
    matchedAlerts: 0,
    emailsSent: 0,
    frequency: targetFrequency || "All",
  };

  try {
    console.log(
      `[JOB ALERT SERVICE] Starting n8n scheduled job alert run (Frequency: ${
        targetFrequency || "All"
      })`
    );

    const filterQuery: any = { isActive: true };
    if (targetFrequency && targetFrequency !== "All") {
      filterQuery.frequency = targetFrequency;
    }

    const activeAlerts = await JobAlert.find(filterQuery).populate({
      path: "candidateId",
      populate: { path: "userId", select: "name email preferences" },
    });

    if (!activeAlerts || activeAlerts.length === 0) {
      console.log(
        "[JOB ALERT SERVICE] No active job alerts found for frequency:",
        targetFrequency || "All"
      );
      return stats;
    }

    stats.processedAlerts = activeAlerts.length;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const alert of activeAlerts) {
      const candidate = alert.candidateId as any;
      if (!candidate) continue;

      let user = candidate.userId as any;
      if (!user || typeof user !== "object" || !user.email) {
        if (candidate.userId) {
          user = await User.findById(candidate.userId).select(
            "name email preferences"
          );
        }
      }

      if (!user || !user.email || !user._id) continue;

      let lookbackDate = oneDayAgo;
      if (alert.frequency === "Weekly") {
        lookbackDate = oneWeekAgo;
      } else if (alert.frequency === "Monthly") {
        lookbackDate = oneMonthAgo;
      }

      const jobQuery: any = {
        status: "Open",
        createdAt: { $gte: lookbackDate },
      };

      if (alert.employmentType) {
        jobQuery.employmentType = alert.employmentType;
      }

      if (alert.remote) {
        jobQuery.remote = true;
      }

      const matchingJobsList = await Job.find(jobQuery).populate(
        "companyId",
        "companyName"
      );

      const matchedJobs = matchingJobsList.filter((job: any) => {
        const jobTitle = (job.title || "").toLowerCase();
        const jobDesc = (job.description || "").toLowerCase();
        const jobLoc = (job.location || "").toLowerCase();
        const jobSkills = Array.isArray(job.skills)
          ? job.skills.map((s: string) => s.toLowerCase())
          : [];

        if (alert.location && alert.location.trim() !== "") {
          const alertLoc = alert.location.trim().toLowerCase();
          if (alertLoc !== "any" && alertLoc !== "all") {
            if (alertLoc === "remote") {
              if (!job.remote && !jobLoc.includes("remote")) return false;
            } else if (
              !jobLoc.includes(alertLoc) &&
              !alertLoc.includes(jobLoc)
            ) {
              return false;
            }
          }
        }

        const validKeywords = Array.isArray(alert.keywords)
          ? alert.keywords
              .map((k: string) => k.toLowerCase().trim())
              .filter(Boolean)
          : [];

        if (validKeywords.length > 0) {
          const hasKeywordMatch = validKeywords.some(
            (kw: string) =>
              jobTitle.includes(kw) ||
              jobDesc.includes(kw) ||
              jobSkills.some((s: string) => s.includes(kw))
          );
          if (!hasKeywordMatch) return false;
        }

        return true;
      });

      if (matchedJobs.length > 0) {
        stats.matchedAlerts++;

        const jobsPayload: JobSummary[] = matchedJobs.map((j: any) => {
          const cName = (j.companyId as any)?.companyName || "Company";
          const salaryStr =
            j.salaryMin && j.salaryMax
              ? `${j.currency || "$"}${j.salaryMin.toLocaleString()} - ${j.currency || "$"}${j.salaryMax.toLocaleString()}`
              : undefined;

          return {
            jobId: j._id.toString(),
            title: j.title || "Job Opening",
            companyName: cName,
            location: j.location || (j.remote ? "Remote" : "Onsite"),
            employmentType: j.employmentType || "Full-time",
            workplaceType: j.workMode || (j.remote ? "Remote" : "Onsite"),
            experienceLevel: j.experienceLevel,
            salary: salaryStr,
          };
        });

        const topJob = jobsPayload[0];

        try {
          await createNotification(
            user._id.toString(),
            `${alert.frequency} Job Digest: ${matchedJobs.length} match(es)`,
            `Found ${matchedJobs.length} job(s) matching your ${alert.frequency} alert: ${topJob.title} at ${topJob.companyName}`,
            "JOB_ALERT"
          );
        } catch (notifErr) {
          console.error(
            "[JOB ALERT SERVICE ERROR] Failed to create in-app notification:",
            notifErr
          );
        }

        const userPrefs = user.preferences || { jobExpiring: true };
        if (userPrefs.jobExpiring !== false) {
          await sendJobAlertEmail({
            email: user.email,
            candidateName: user.name || "Candidate",
            type: "scheduled-job-alert",
            frequency: alert.frequency || "Daily",
            totalJobs: jobsPayload.length,
            jobs: jobsPayload,
          });
          stats.emailsSent++;
        }
      }
    }

    console.log(
      "[JOB ALERT SERVICE SUCCESS] n8n scheduled job alert run finished:",
      JSON.stringify(stats)
    );
  } catch (error) {
    console.error(
      "[JOB ALERT SERVICE ERROR] n8n scheduled job alert run failed:",
      error
    );
  }

  return stats;
};




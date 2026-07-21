import Candidate from "../models/candidate.model.js";
import Company from "../models/company.model.js";
import JobAlert from "../models/jobAlert.model.js";
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
  keywords: string[],
  location: string,
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship",
  remote: boolean,
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

  jobAlert.keywords = keywords;
  jobAlert.location = location;
  jobAlert.employmentType = employmentType;
  jobAlert.remote = remote;

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

export const processJobAlertsForNewJob = async (job: any) => {
  try {
    const activeAlerts = await JobAlert.find({ isActive: true }).populate({
      path: "candidateId",
      populate: { path: "userId", select: "name email" },
    });

    if (!activeAlerts || activeAlerts.length === 0) return;

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

    const notifiedUserIds = new Set<string>();

    for (const alert of activeAlerts) {
      const candidate = alert.candidateId as any;
      if (!candidate || !candidate.userId) continue;

      const user = candidate.userId as any;
      const userId = user._id.toString();

      if (notifiedUserIds.has(userId)) continue;

      // Match 1: Employment Type
      if (alert.employmentType && alert.employmentType !== jobEmploymentType) {
        continue;
      }

      // Match 2: Remote Preference
      if (alert.remote && !isJobRemote) {
        continue;
      }

      // Match 3: Location (if specified in alert)
      if (alert.location && alert.location.trim() !== "") {
        const alertLoc = alert.location.trim().toLowerCase();
        if (!jobLocation.includes(alertLoc) && !alertLoc.includes(jobLocation)) {
          continue;
        }
      }

      // Match 4: Keywords (if specified in alert)
      if (alert.keywords && alert.keywords.length > 0) {
        const hasKeywordMatch = alert.keywords.some((kw) => {
          const lowerKw = kw.toLowerCase().trim();
          if (!lowerKw) return false;
          return (
            jobTitle.toLowerCase().includes(lowerKw) ||
            jobDescription.toLowerCase().includes(lowerKw) ||
            jobSkills.some((s: string) => s.includes(lowerKw))
          );
        });

        if (!hasKeywordMatch) continue;
      }

      notifiedUserIds.add(userId);

      // In-app notification
      await createNotification(
        userId,
        `New Job Match: ${jobTitle}`,
        `${companyName} posted a new job matching your alert: ${jobTitle}`,
        "JOB_ALERT",
      );

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
      }
    }
  } catch (error) {
    console.error("Error processing job alerts:", error);
  }
};


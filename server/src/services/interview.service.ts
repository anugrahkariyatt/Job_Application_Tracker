import Interview from "../models/interview.model.js";
import Application from "../models/application.model.js";
import Candidate from "../models/candidate.model.js";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";
import { sendInterviewEmail } from "./mail.service.js";

export const createInterview = async (
  recruiterUserId: string,
  data: {
    applicationId: string;
    title: string;
    date: Date;
    type: "Video Call" | "Onsite" | "Phone";
    link?: string;
    notes?: string;
  },
) => {
  const company = await Company.findOne({ ownerId: recruiterUserId });
  if (!company) {
    throw new AppError(
      "Company profile not found. You must create a company first.",
      404,
    );
  }

  const application = await Application.findById(data.applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  if (application.companyId.toString() !== company._id.toString()) {
    throw new AppError(
      "You are not authorized to schedule an interview for this application",
      403,
    );
  }

  const candidate = await Candidate.findById(application.candidateId);
  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const job = await Job.findById(application.jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  // Create the interview
  const interview = await Interview.create({
    applicationId: application._id,
    candidateId: candidate._id,
    jobId: job._id,
    companyId: company._id,
    title: data.title,
    date: data.date,
    type: data.type,
    link: data.link || "",
    notes: data.notes || "",
    status: "Scheduled",
  });

  // Update application status to "Interview"
  application.status = "Interview";
  await application.save();

  // Create in-app notification for candidate
  try {
    const candidateUser = await User.findById(candidate.userId);
    if (candidateUser) {
      await createNotification(
        candidateUser._id.toString(),
        `Interview Scheduled: ${job.title}`,
        `An interview round "${data.title}" has been scheduled with ${company.companyName} for ${new Date(data.date).toLocaleString()}.`,
        "APPLICATION",
      );

      // Trigger email invitation
      if (candidateUser.email) {
        await sendInterviewEmail({
          email: candidateUser.email,
          candidateName: candidateUser.name || "Candidate",
          jobTitle: job.title,
          companyName: company.companyName,
          interviewTitle: data.title,
          dateTime: new Date(data.date).toLocaleString(),
          type: data.type,
          link: data.link,
        });
      }
    }
  } catch (err) {
    console.error(
      "[INTERVIEW SERVICE ERROR] Notification/Email dispatch failed:",
      err,
    );
  }

  return interview;
};

export const updateInterviewStatus = async (
  userId: string,
  role: "candidate" | "recruiter" | "admin",
  interviewId: string,
  status: "Scheduled" | "Completed" | "Cancelled",
) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  if (role === "candidate") {
    const candidate = await Candidate.findOne({ userId });
    if (
      !candidate ||
      interview.candidateId.toString() !== candidate._id.toString()
    ) {
      throw new AppError(
        "You are not authorized to update this interview",
        403,
      );
    }
  } else if (role === "recruiter") {
    const company = await Company.findOne({ ownerId: userId });
    if (
      !company ||
      interview.companyId.toString() !== company._id.toString()
    ) {
      throw new AppError(
        "You are not authorized to update this interview",
        403,
      );
    }
  }

  interview.status = status;
  await interview.save();

  // Create notification for candidate/recruiter
  try {
    if (role === "recruiter") {
      const candidate = await Candidate.findById(interview.candidateId);
      if (candidate) {
        const candidateUser = await User.findById(candidate.userId);
        if (candidateUser) {
          await createNotification(
            candidateUser._id.toString(),
            `Interview Status Updated: ${status}`,
            `Your interview "${interview.title}" is now marked as ${status}.`,
            "APPLICATION",
          );
        }
      }
    }
  } catch (err) {
    console.error(
      "[INTERVIEW SERVICE ERROR] Notification failed on status update:",
      err,
    );
  }

  return interview;
};

export const getMyInterviews = async (
  userId: string,
  role: "candidate" | "recruiter" | "admin",
) => {
  if (role === "candidate") {
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) {
      return [];
    }
    return await Interview.find({ candidateId: candidate._id })
      .populate("jobId")
      .populate("companyId")
      .sort({ date: 1 });
  } else if (role === "recruiter") {
    const company = await Company.findOne({ ownerId: userId });
    if (!company) {
      return [];
    }
    return await Interview.find({ companyId: company._id })
      .populate("jobId")
      .populate({
        path: "candidateId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ date: 1 });
  }
  return [];
};

import Interview from "../models/interview.model.js";
import Application from "../models/application.model.js";
import Candidate from "../models/candidate.model.js";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";
import { sendInterviewEmail, sendInterviewCancelledEmail } from "./mail.service.js";

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

      // Trigger email invitation only if recruiter is PRO
      const recruiterUser = await User.findById(recruiterUserId);
      if (recruiterUser?.subscriptionPlan === "pro" && candidateUser.email) {
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

  // Create notification and trigger n8n email for candidate/recruiter
  try {
    const candidate = await Candidate.findById(interview.candidateId);
    const job = await Job.findById(interview.jobId);
    const company = await Company.findById(interview.companyId);

    if (role === "recruiter") {
      if (candidate) {
        const candidateUser = await User.findById(candidate.userId);
        if (candidateUser) {
          // Push In-App Notification to candidate
          const notifTitle = status === "Cancelled" 
            ? `Interview Cancelled: ${interview.title}`
            : `Interview Status Updated: ${status}`;
          const notifMsg = status === "Cancelled"
            ? `Your scheduled interview "${interview.title}" for ${job?.title || 'the job'} at ${company?.companyName || 'the company'} has been cancelled by the interviewer.`
            : `Your interview "${interview.title}" is now marked as ${status}.`;

          await createNotification(
            candidateUser._id.toString(),
            notifTitle,
            notifMsg,
            "APPLICATION",
          );

          const recruiterUser = await User.findById(userId);
          if (recruiterUser?.subscriptionPlan === "pro" && status === "Cancelled" && candidateUser.email) {
            await sendInterviewCancelledEmail({
              email: candidateUser.email,
              candidateName: candidateUser.name || "Candidate",
              jobTitle: job?.title || "Position",
              companyName: company?.companyName || "Company",
              interviewTitle: interview.title,
              dateTime: new Date(interview.date).toLocaleString(),
              cancelledBy: "Interviewer",
            });
          }
        }
      }
    } else if (role === "candidate") {
      if (company) {
        const companyOwner = await User.findById(company.ownerId);
        if (companyOwner) {
          const candidateUser = candidate ? await User.findById(candidate.userId) : null;
          await createNotification(
            companyOwner._id.toString(),
            `Interview Status Updated by Candidate: ${status}`,
            `${candidateUser?.name || 'Candidate'} updated interview "${interview.title}" status to ${status}.`,
            "APPLICATION",
          );

          if (status === "Cancelled" && companyOwner.email) {
            await sendInterviewCancelledEmail({
              email: companyOwner.email,
              candidateName: candidateUser?.name || "Candidate",
              jobTitle: job?.title || "Position",
              companyName: company.companyName,
              interviewTitle: interview.title,
              dateTime: new Date(interview.date).toLocaleString(),
              cancelledBy: "Candidate",
            });
          }
        }
      }
    }
  } catch (err) {
    console.error(
      "[INTERVIEW SERVICE ERROR] Notification/n8n dispatch failed on status update:",
      err,
    );
  }

  return interview;
};

export const getMyInterviews = async (
  userId: string,
  role: "candidate" | "recruiter" | "admin",
  query: { status?: string; type?: string; sort?: string } = {}
) => {
  const filter: any = {};

  if (role === "candidate") {
    const candidate = await Candidate.findOne({ userId }).lean();
    if (!candidate) {
      return [];
    }
    filter.candidateId = candidate._id;
  } else if (role === "recruiter") {
    const company = await Company.findOne({ ownerId: userId }).lean();
    if (!company) {
      return [];
    }
    filter.companyId = company._id;
  } else if (role !== "admin") {
    return [];
  }

  if (query.status && query.status !== "all" && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.type && query.type !== "all" && query.type !== "All") {
    if (query.type === "Video") {
      filter.type = "Video Call";
    } else {
      filter.type = query.type;
    }
  }

  let sortOptions: any = { date: -1, createdAt: -1 };
  if (query.sort === "oldest") {
    sortOptions = { date: 1, createdAt: 1 };
  } else if (query.sort === "newest" || !query.sort) {
    sortOptions = { date: -1, createdAt: -1 };
  }

  if (role === "candidate") {
    return await Interview.find(filter)
      .populate("jobId", "title location jobType")
      .populate("companyId", "companyName logo industry")
      .sort(sortOptions)
      .lean();
  } else if (role === "recruiter") {
    return await Interview.find(filter)
      .populate("jobId", "title location jobType")
      .populate({
        path: "candidateId",
        populate: { path: "userId", select: "name email" },
      })
      .sort(sortOptions)
      .lean();
  }
  return [];
};

import Candidate from "../models/candidate.model.js";
import CompanyProfile from "../models/company.model.js";
import Subscription from "../models/subscription.model.js";
import { AppError } from "../utils/AppError.js";

const MAX_SUBSCRIPTIONS = 10;

export const subscribeCompany = async (userId: string, companyId: string) => {
  const candidate = await Candidate.findOne({ userId });

  if (!candidate) {
    throw new AppError("Candidate profile not found", 404);
  }

  const totalSubscriptions = await Subscription.countDocuments({
    candidateId: candidate._id,
  });

  if (totalSubscriptions >= MAX_SUBSCRIPTIONS) {
    throw new AppError(
      `You can subscribe to a maximum of ${MAX_SUBSCRIPTIONS} companies`,
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

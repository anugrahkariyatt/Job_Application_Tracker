import { z } from "zod";

export const subscribeCompanySchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
});

export const getSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
});

export type SubscribeCompanyInput = z.infer<
  typeof subscribeCompanySchema
>;
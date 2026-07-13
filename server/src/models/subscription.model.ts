import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISubscription extends Document {
  candidateId: Types.ObjectId;
  companyId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index(
  { candidateId: 1, companyId: 1 },
  { unique: true },
);

const Subscription: Model<ISubscription> =
  mongoose.model<ISubscription>(
    "Subscription",
    subscriptionSchema,
  );

export default Subscription;
import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: "APPLICATION" | "JOB_ALERT" | "SUBSCRIPTION" | "SYSTEM";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "APPLICATION",
        "JOB_ALERT",
        "SUBSCRIPTION",
        "SYSTEM",
      ],
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Notification: Model<INotification> =
  mongoose.model<INotification>(
    "Notification",
    notificationSchema,
  );

export default Notification;
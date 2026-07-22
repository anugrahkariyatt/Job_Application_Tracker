import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  platformName: string;
  supportEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    platformName: {
      type: String,
      default: "Techno Careers",
      required: true,
    },
    supportEmail: {
      type: String,
      default: "support@technocareers.com",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> = mongoose.model<ISettings>("Settings", settingsSchema);
export default Settings;

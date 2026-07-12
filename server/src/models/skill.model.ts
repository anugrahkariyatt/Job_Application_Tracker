import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISkill extends Document {
  candidateId: Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Skill: Model<ISkill> = mongoose.model<ISkill>("Skill", skillSchema);

export default Skill;

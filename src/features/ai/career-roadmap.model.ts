import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerRoadmap extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  goal: string;
  currentSkills: string[];
  timeline: string;
  steps: { title: string; description: string; resources: string[]; estimatedDuration: string }[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const careerRoadmapSchema = new Schema<ICareerRoadmap>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    goal: { type: String, required: true },
    currentSkills: [{ type: String }],
    timeline: { type: String, default: '3 months' },
    steps: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        resources: [{ type: String }],
        estimatedDuration: { type: String, default: '' },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

careerRoadmapSchema.index({ user: 1, createdAt: -1 });

export const CareerRoadmap = mongoose.model<ICareerRoadmap>('CareerRoadmap', careerRoadmapSchema);

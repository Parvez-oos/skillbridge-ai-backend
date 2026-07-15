import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningRecommendation extends Document {
  user: mongoose.Types.ObjectId;
  goal: string;
  currentSkills: string[];
  recommendations: { title: string; type: string; description: string; url?: string; reason: string }[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const learningRecommendationSchema = new Schema<ILearningRecommendation>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goal: { type: String, required: true },
    currentSkills: [{ type: String }],
    recommendations: [
      {
        title: { type: String, required: true },
        type: { type: String, default: 'course' },
        description: { type: String, default: '' },
        url: { type: String },
        reason: { type: String, default: '' },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

learningRecommendationSchema.index({ user: 1, createdAt: -1 });

export const LearningRecommendation = mongoose.model<ILearningRecommendation>('LearningRecommendation', learningRecommendationSchema);

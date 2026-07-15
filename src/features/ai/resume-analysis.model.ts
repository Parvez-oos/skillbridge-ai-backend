import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeAnalysis extends Document {
  user: mongoose.Types.ObjectId;
  fileName: string;
  atsScore: number;
  missingSkills: string[];
  suggestions: string[];
  summary: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    atsScore: { type: Number, default: 0 },
    missingSkills: [{ type: String }],
    suggestions: [{ type: String }],
    summary: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

resumeAnalysisSchema.index({ user: 1, createdAt: -1 });

export const ResumeAnalysis = mongoose.model<IResumeAnalysis>('ResumeAnalysis', resumeAnalysisSchema);

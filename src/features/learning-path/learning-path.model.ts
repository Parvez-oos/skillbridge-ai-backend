import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningPath extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  rating: number;
  studentsCount: number;
  thumbnail: string;
  learningOutcomes: string[];
  requiredSkills: string[];
  creator: mongoose.Types.ObjectId;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const learningPathSchema = new Schema<ILearningPath>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description must be at most 5000 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [200, 'Short description must be at most 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Difficulty is required'],
      default: 'beginner',
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 hour'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must be at most 5'],
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

learningPathSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

learningPathSchema.index({ title: 'text', description: 'text' });
learningPathSchema.index({ category: 1 });
learningPathSchema.index({ difficulty: 1 });
learningPathSchema.index({ tags: 1 });
learningPathSchema.index({ isPublished: 1, isDeleted: 1 });
learningPathSchema.index({ creator: 1 });

export const LearningPath = mongoose.model<ILearningPath>(
  'LearningPath',
  learningPathSchema
);

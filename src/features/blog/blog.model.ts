import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  content: string;
  coverImage: string;
  thumbnail: string;
  author: mongoose.Types.ObjectId;
  publishDate: Date;
  updatedDate: Date;
  readingTime: number;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  tableOfContents: { id: string; title: string; level: number }[];
  views: number;
  likes: number;
  bookmarks: number;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle must be at most 300 characters'],
      default: '',
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      maxlength: [500, 'Summary must be at most 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    updatedDate: {
      type: Date,
      default: Date.now,
    },
    readingTime: {
      type: Number,
      default: 5,
      min: [1, 'Reading time must be at least 1 minute'],
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
        lowercase: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredImage: {
      type: String,
      default: '',
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'SEO title must be at most 70 characters'],
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'SEO description must be at most 160 characters'],
      default: '',
    },
    tableOfContents: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        level: { type: Number, required: true },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    bookmarks: {
      type: Number,
      default: 0,
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

blogPostSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  if (this.isModified('content') && !this.readingTime) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  this.updatedDate = new Date();
  next();
});

blogPostSchema.index({ title: 'text', summary: 'text', content: 'text', tags: 'text' });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ difficulty: 1 });
blogPostSchema.index({ featured: 1 });
blogPostSchema.index({ publishDate: -1 });
blogPostSchema.index({ views: -1 });
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ isPublished: 1, isDeleted: 1 });
blogPostSchema.index({ slug: 1 });

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);

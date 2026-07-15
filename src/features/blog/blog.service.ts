import { BlogPost, IBlogPost } from './blog.model';
import {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  QueryBlogPostInput,
} from './blog.validation';
import { AppError } from '../../middleware/error.middleware';

interface QueryResult {
  posts: IBlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const createBlogPost = async (
  data: CreateBlogPostInput,
  authorId: string
): Promise<IBlogPost> => {
  const post = await BlogPost.create({
    ...data,
    author: authorId,
  });
  return post.populate('author', 'name avatar');
};

export const getBlogPosts = async (
  query: QueryBlogPostInput
): Promise<QueryResult> => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    tag,
    difficulty,
    featured,
    sortBy = 'publishDate',
    sortOrder = 'desc',
  } = query;

  const filter: Record<string, unknown> = {
    isDeleted: false,
    isPublished: true,
  };

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    filter.category = category;
  }

  if (tag) {
    filter.tags = { $in: [tag] };
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (featured !== undefined) {
    filter.featured = featured;
  }

  const total = await BlogPost.countDocuments(filter);
  const posts = await BlogPost.find(filter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'name avatar');

  return {
    posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getBlogPostBySlug = async (
  slug: string
): Promise<IBlogPost> => {
  const post = await BlogPost.findOne({
    slug,
    isDeleted: false,
  }).populate('author', 'name avatar bio');

  if (!post) {
    throw new AppError('Blog post not found', 404);
  }

  return post;
};

export const getBlogPostById = async (
  id: string
): Promise<IBlogPost> => {
  const post = await BlogPost.findOne({
    _id: id,
    isDeleted: false,
  }).populate('author', 'name avatar bio');

  if (!post) {
    throw new AppError('Blog post not found', 404);
  }

  return post;
};

export const updateBlogPost = async (
  id: string,
  data: UpdateBlogPostInput
): Promise<IBlogPost> => {
  const post = await BlogPost.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { ...data, updatedDate: new Date() },
    { new: true, runValidators: true }
  ).populate('author', 'name avatar');

  if (!post) {
    throw new AppError('Blog post not found', 404);
  }

  return post;
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  const post = await BlogPost.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!post) {
    throw new AppError('Blog post not found', 404);
  }
};

export const incrementViews = async (slug: string): Promise<void> => {
  await BlogPost.findOneAndUpdate(
    { slug, isDeleted: false },
    { $inc: { views: 1 } }
  );
};

export const getBlogCategories = async (): Promise<string[]> => {
  const categories = await BlogPost.distinct('category', {
    isDeleted: false,
    isPublished: true,
  });
  return categories;
};

export const getBlogTags = async (): Promise<string[]> => {
  const tags = await BlogPost.distinct('tags', {
    isDeleted: false,
    isPublished: true,
  });
  return tags;
};

export const getFeaturedPosts = async (limit: number = 5): Promise<IBlogPost[]> => {
  return BlogPost.find({
    isDeleted: false,
    isPublished: true,
    featured: true,
  })
    .sort({ publishDate: -1 })
    .limit(limit)
    .populate('author', 'name avatar');
};

export const getRelatedPosts = async (
  postId: string,
  category: string,
  tags: string[],
  limit: number = 4
): Promise<IBlogPost[]> => {
  return BlogPost.find({
    _id: { $ne: postId },
    isDeleted: false,
    isPublished: true,
    $or: [{ category }, { tags: { $in: tags } }],
  })
    .sort({ views: -1 })
    .limit(limit)
    .populate('author', 'name avatar');
};

export const getRecentPosts = async (limit: number = 5): Promise<IBlogPost[]> => {
  return BlogPost.find({
    isDeleted: false,
    isPublished: true,
  })
    .sort({ publishDate: -1 })
    .limit(limit)
    .populate('author', 'name avatar');
};

export const getPopularPosts = async (limit: number = 5): Promise<IBlogPost[]> => {
  return BlogPost.find({
    isDeleted: false,
    isPublished: true,
  })
    .sort({ views: -1 })
    .limit(limit)
    .populate('author', 'name avatar');
};

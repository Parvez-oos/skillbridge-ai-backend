import { Request, Response, NextFunction } from 'express';
import * as blogService from './blog.service';
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  queryBlogPostSchema,
} from './blog.validation';
import { sendSuccess, sendPaginatedSuccess } from '../../utils/response';

export const createBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createBlogPostSchema.parse(req.body);
    const authorId = req.user?._id;

    if (!authorId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const post = await blogService.createBlogPost(validatedData, authorId);
    sendSuccess(res, post, 'Blog post created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getBlogPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = queryBlogPostSchema.parse(req.query);
    const result = await blogService.getBlogPosts(query);

    sendPaginatedSuccess(
      res,
      result.posts,
      result.total,
      result.page,
      result.limit,
      'Blog posts retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getBlogPostBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slug = String(req.params.slug);
    const post = await blogService.getBlogPostBySlug(slug);

    await blogService.incrementViews(slug);

    sendSuccess(res, post, 'Blog post retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const validatedData = updateBlogPostSchema.parse(req.body);

    const post = await blogService.updateBlogPost(id, validatedData);
    sendSuccess(res, post, 'Blog post updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    await blogService.deleteBlogPost(id);

    sendSuccess(res, null, 'Blog post deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getBlogCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await blogService.getBlogCategories();
    sendSuccess(res, categories, 'Blog categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getBlogTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tags = await blogService.getBlogTags();
    sendSuccess(res, tags, 'Blog tags retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getFeaturedPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 5;
    const posts = await blogService.getFeaturedPosts(limit);
    sendSuccess(res, posts, 'Featured posts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getRelatedPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const post = await blogService.getBlogPostById(id);
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 4;

    const relatedPosts = await blogService.getRelatedPosts(
      id,
      post.category,
      post.tags,
      limit
    );

    sendSuccess(res, relatedPosts, 'Related posts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getRecentPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 5;
    const posts = await blogService.getRecentPosts(limit);
    sendSuccess(res, posts, 'Recent posts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPopularPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 5;
    const posts = await blogService.getPopularPosts(limit);
    sendSuccess(res, posts, 'Popular posts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

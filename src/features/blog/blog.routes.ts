import { Router } from 'express';
import * as blogController from './blog.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  queryBlogPostSchema,
} from './blog.validation';

const router = Router();

router.get(
  '/posts',
  validate(queryBlogPostSchema, 'query'),
  blogController.getBlogPosts
);

router.get('/posts/featured', blogController.getFeaturedPosts);
router.get('/posts/recent', blogController.getRecentPosts);
router.get('/posts/popular', blogController.getPopularPosts);
router.get('/categories', blogController.getBlogCategories);
router.get('/tags', blogController.getBlogTags);
router.get('/posts/:slug', blogController.getBlogPostBySlug);
router.get('/posts/:id/related', blogController.getRelatedPosts);

router.post(
  '/posts',
  authenticate,
  validate(createBlogPostSchema, 'body'),
  blogController.createBlogPost
);

router.put(
  '/posts/:id',
  authenticate,
  validate(updateBlogPostSchema, 'body'),
  blogController.updateBlogPost
);

router.delete('/posts/:id', authenticate, blogController.deleteBlogPost);

export default router;

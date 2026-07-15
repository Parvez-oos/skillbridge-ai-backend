import { z } from 'zod';

export const createBlogPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  subtitle: z.string().max(300, 'Subtitle must be at most 300 characters').optional(),
  summary: z
    .string()
    .min(1, 'Summary is required')
    .max(500, 'Summary must be at most 500 characters'),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().optional(),
  thumbnail: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  featured: z.boolean().optional(),
  featuredImage: z.string().optional(),
  seoTitle: z.string().max(70, 'SEO title must be at most 70 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must be at most 160 characters').optional(),
  tableOfContents: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        level: z.number(),
      })
    )
    .optional(),
  isPublished: z.boolean().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const queryBlogPostSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z
    .enum(['publishDate', 'views', 'likes', 'readingTime', 'createdAt'])
    .optional()
    .default('publishDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type QueryBlogPostInput = z.infer<typeof queryBlogPostSchema>;

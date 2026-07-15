import { z } from 'zod';

export const createLearningPathSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be at most 5000 characters'),
  shortDescription: z
    .string()
    .min(1, 'Short description is required')
    .max(200, 'Short description must be at most 200 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  thumbnail: z.string().optional(),
  learningOutcomes: z.array(z.string()).min(1, 'At least one learning outcome is required'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill is required'),
  isPublished: z.boolean().optional(),
});

export const updateLearningPathSchema = createLearningPathSchema.partial();

export const queryLearningPathSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  sortBy: z.enum(['title', 'createdAt', 'rating', 'studentsCount', 'duration']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateLearningPathInput = z.infer<typeof createLearningPathSchema>;
export type UpdateLearningPathInput = z.infer<typeof updateLearningPathSchema>;
export type QueryLearningPathInput = z.infer<typeof queryLearningPathSchema>;

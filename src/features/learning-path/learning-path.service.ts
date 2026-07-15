import { LearningPath, ILearningPath } from './learning-path.model';
import {
  CreateLearningPathInput,
  UpdateLearningPathInput,
  QueryLearningPathInput,
} from './learning-path.validation';
import { AppError } from '../../middleware/error.middleware';

interface QueryResult {
  learningPaths: ILearningPath[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const createLearningPath = async (
  data: CreateLearningPathInput,
  creatorId: string
): Promise<ILearningPath> => {
  const learningPath = await LearningPath.create({
    ...data,
    creator: creatorId,
  });
  return learningPath;
};

export const getLearningPaths = async (
  query: QueryLearningPathInput
): Promise<QueryResult> => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    difficulty,
    sortBy = 'createdAt',
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

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  const total = await LearningPath.countDocuments(filter);
  const learningPaths = await LearningPath.find(filter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('creator', 'name avatar');

  return {
    learningPaths,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getLearningPathBySlug = async (
  slug: string
): Promise<ILearningPath> => {
  const learningPath = await LearningPath.findOne({
    slug,
    isDeleted: false,
  }).populate('creator', 'name avatar');

  if (!learningPath) {
    throw new AppError('Learning path not found', 404);
  }

  return learningPath;
};

export const getLearningPathById = async (
  id: string
): Promise<ILearningPath> => {
  const learningPath = await LearningPath.findOne({
    _id: id,
    isDeleted: false,
  }).populate('creator', 'name avatar');

  if (!learningPath) {
    throw new AppError('Learning path not found', 404);
  }

  return learningPath;
};

export const updateLearningPath = async (
  id: string,
  data: UpdateLearningPathInput
): Promise<ILearningPath> => {
  const learningPath = await LearningPath.findOneAndUpdate(
    { _id: id, isDeleted: false },
    data,
    { new: true, runValidators: true }
  );

  if (!learningPath) {
    throw new AppError('Learning path not found', 404);
  }

  return learningPath;
};

export const deleteLearningPath = async (id: string): Promise<void> => {
  const learningPath = await LearningPath.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!learningPath) {
    throw new AppError('Learning path not found', 404);
  }
};

export const getMyLearningPaths = async (
  creatorId: string,
  page: number = 1,
  limit: number = 10
): Promise<QueryResult> => {
  const filter = {
    creator: creatorId,
    isDeleted: false,
  };

  const total = await LearningPath.countDocuments(filter);
  const learningPaths = await LearningPath.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    learningPaths,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getCategories = async (): Promise<string[]> => {
  const categories = await LearningPath.distinct('category', {
    isDeleted: false,
    isPublished: true,
  });
  return categories;
};

export const incrementStudentsCount = async (
  id: string
): Promise<void> => {
  await LearningPath.findByIdAndUpdate(id, {
    $inc: { studentsCount: 1 },
  });
};

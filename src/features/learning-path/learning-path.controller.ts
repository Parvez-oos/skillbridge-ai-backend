import { Request, Response, NextFunction } from 'express';
import * as learningPathService from './learning-path.service';
import {
  CreateLearningPathInput,
  UpdateLearningPathInput,
  QueryLearningPathInput,
} from './learning-path.validation';
import { sendSuccess, sendError } from '../../utils/response';

export const createLearningPath = async (
  req: Request<{}, {}, CreateLearningPathInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const creatorId = req.user?._id;
    if (!creatorId) {
      sendError(res, 'User not authenticated', 401);
      return;
    }
    const learningPath = await learningPathService.createLearningPath(
      req.body,
      creatorId
    );
    sendSuccess(res, learningPath, 'Learning path created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getLearningPaths = async (
  req: Request<{}, {}, {}, QueryLearningPathInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await learningPathService.getLearningPaths(req.query);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getLearningPathBySlug = async (
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const learningPath = await learningPathService.getLearningPathBySlug(
      req.params.slug
    );
    sendSuccess(res, learningPath);
  } catch (error) {
    next(error);
  }
};

export const getLearningPathById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const learningPath = await learningPathService.getLearningPathById(
      req.params.id
    );
    sendSuccess(res, learningPath);
  } catch (error) {
    next(error);
  }
};

export const updateLearningPath = async (
  req: Request<{ id: string }, {}, UpdateLearningPathInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const learningPath = await learningPathService.updateLearningPath(
      req.params.id,
      req.body
    );
    sendSuccess(res, learningPath, 'Learning path updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteLearningPath = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await learningPathService.deleteLearningPath(req.params.id);
    sendSuccess(res, null, 'Learning path deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyLearningPaths = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const creatorId = req.user?._id;
    if (!creatorId) {
      sendError(res, 'User not authenticated', 401);
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await learningPathService.getMyLearningPaths(
      creatorId,
      page,
      limit
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await learningPathService.getCategories();
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};

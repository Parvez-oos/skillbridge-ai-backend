import { Router, RequestHandler } from 'express';
import * as learningPathController from './learning-path.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createLearningPathSchema,
  updateLearningPathSchema,
  queryLearningPathSchema,
} from './learning-path.validation';

const router = Router();

router.get(
  '/',
  validate(queryLearningPathSchema, 'query'),
  learningPathController.getLearningPaths as unknown as RequestHandler
);

router.get('/categories', learningPathController.getCategories);

router.get('/my-paths', authenticate, learningPathController.getMyLearningPaths);

router.get('/slug/:slug', learningPathController.getLearningPathBySlug);

router.get('/:id', learningPathController.getLearningPathById);

router.post(
  '/',
  authenticate,
  validate(createLearningPathSchema),
  learningPathController.createLearningPath
);

router.put(
  '/:id',
  authenticate,
  validate(updateLearningPathSchema),
  learningPathController.updateLearningPath
);

router.delete(
  '/:id',
  authenticate,
  learningPathController.deleteLearningPath
);

export default router;

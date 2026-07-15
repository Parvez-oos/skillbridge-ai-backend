import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { sendSuccess } from '../../utils/response';
import { User } from './user.model';
import { LearningPath } from '../learning-path/learning-path.model';
import { BlogPost } from '../blog/blog.model';
import { AppError } from '../../middleware/error.middleware';

const router = Router();

router.get('/', authenticate, authorize('admin'), async (_req, res, next) => {
  try {
    const users = await User.find().select('-__v');
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!._id).select('-__v');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user!._id, updates, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!user) {
      throw new AppError('User not found', 404);
    }
    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
});

router.put('/me/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!._id).select('+password');
    if (!user || !user.password) {
      throw new AppError('User not found', 404);
    }
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }
    user.password = newPassword;
    await user.save();
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
});

router.get('/me/stats', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!._id;
    const [learningPaths, publishedPaths, blogPosts, totalViews] = await Promise.all([
      LearningPath.countDocuments({ creator: userId, isDeleted: false }),
      LearningPath.countDocuments({ creator: userId, isPublished: true, isDeleted: false }),
      BlogPost.countDocuments({ author: userId, isDeleted: false }),
      BlogPost.aggregate([
        { $match: { author: userId, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
    ]);

    sendSuccess(res, {
      learningPaths,
      publishedLearningPaths: publishedPaths,
      blogPosts,
      totalViews: totalViews[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me/activity', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [learningPaths, blogPosts, total] = await Promise.all([
      LearningPath.find({ creator: userId, isDeleted: false })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug updatedAt isPublished')
        .lean(),
      BlogPost.find({ author: userId, isDeleted: false })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug updatedAt isPublished')
        .lean(),
      LearningPath.countDocuments({ creator: userId, isDeleted: false }),
    ]);

    const activities = [
      ...learningPaths.map((lp) => ({
        type: 'learning_path' as const,
        title: lp.title,
        slug: lp.slug,
        updatedAt: lp.updatedAt,
        isPublished: lp.isPublished,
      })),
      ...blogPosts.map((bp) => ({
        type: 'blog_post' as const,
        title: bp.title,
        slug: bp.slug,
        updatedAt: bp.updatedAt,
        isPublished: bp.isPublished,
      })),
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    sendSuccess(res, {
      data: activities.slice(skip, skip + limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/me', authenticate, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user!._id);
    sendSuccess(res, null, 'Account deleted');
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

export default router;

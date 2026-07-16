import { Request, Response, NextFunction } from 'express';
import { User } from '../user/user.model';
import { BlogPost } from '../blog/blog.model';
import { LearningPath } from '../learning-path/learning-path.model';
import { sendSuccess, sendError, sendPaginatedSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    const totalBlogPosts = await BlogPost.countDocuments({ isDeleted: false });
    const publishedBlogPosts = await BlogPost.countDocuments({ isDeleted: false, isPublished: true });
    const totalLearningPaths = await LearningPath.countDocuments({ isDeleted: false });
    const publishedLearningPaths = await LearningPath.countDocuments({ isDeleted: false, isPublished: true });

    const totalBlogViews = await BlogPost.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);
    const totalLikes = await BlogPost.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$likes' } } },
    ]);
    const totalStudents = await LearningPath.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$studentsCount' } } },
    ]);

    const recentUsers = await User.find({ role: 'user' })
      .select('name email avatar createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentBlogPosts = await BlogPost.find({ isDeleted: false })
      .select('title slug category views publishDate isPublished')
      .sort({ publishDate: -1 })
      .limit(5)
      .lean();

    const recentLearningPaths = await LearningPath.find({ isDeleted: false })
      .select('title slug category difficulty studentsCount isPublished')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const blogViewsByMonth = await BlogPost.aggregate([
      { $match: { publishDate: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }, isDeleted: false } },
      { $group: { _id: { year: { $year: '$publishDate' }, month: { $month: '$publishDate' } }, views: { $sum: '$views' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const categoryDistribution = await LearningPath.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const difficultyDistribution = await LearningPath.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    sendSuccess(res, {
      stats: {
        totalUsers,
        activeUsers,
        totalBlogPosts,
        publishedBlogPosts,
        totalLearningPaths,
        publishedLearningPaths,
        totalBlogViews: totalBlogViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalStudents: totalStudents[0]?.total || 0,
      },
      recent: {
        users: recentUsers,
        blogPosts: recentBlogPosts,
        learningPaths: recentLearningPaths,
      },
      charts: {
        usersByMonth,
        blogViewsByMonth,
        categoryDistribution,
        difficultyDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      filter.role = role;
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    sendPaginatedSuccess(res, users, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password').lean();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendSuccess(res, user, 'User role updated');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendSuccess(res, null, 'User deleted');
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

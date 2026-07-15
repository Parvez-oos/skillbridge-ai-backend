import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';
import { LearningPath } from '../learning-path/learning-path.model';
import { BlogPost } from '../blog/blog.model';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalLearningPaths,
      publishedPaths,
      blogPosts,
      totalViewsResult,
      recentLearningPaths,
      recentBlogPosts,
      progressPaths,
      lpMonthly,
      bpMonthly,
      distribution,
    ] = await Promise.all([
      LearningPath.countDocuments({ creator: userId, isDeleted: false }),
      LearningPath.countDocuments({ creator: userId, isPublished: true, isDeleted: false }),
      BlogPost.countDocuments({ author: userId, isDeleted: false }),
      BlogPost.aggregate([
        { $match: { author: userId, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
      LearningPath.find({ creator: userId, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(10)
        .select('title slug updatedAt isPublished thumbnail')
        .lean(),
      BlogPost.find({ author: userId, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(10)
        .select('title slug updatedAt isPublished coverImage')
        .lean(),
      LearningPath.find({ creator: userId, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title slug difficulty thumbnail studentsCount rating')
        .lean(),
      LearningPath.aggregate([
        { $match: { creator: userId, isDeleted: false, createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      BlogPost.aggregate([
        { $match: { author: userId, isDeleted: false, createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      LearningPath.aggregate([
        { $match: { creator: userId, isDeleted: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { category: '$_id', count: '$count', _id: 0 } },
      ]),
    ]);

    const monthMap: Record<string, { learningPaths: number; blogPosts: number }> = {};
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = { learningPaths: 0, blogPosts: 0 };
      months.push(key);
    }
    lpMonthly.forEach((item: { _id: string; count: number }) => {
      if (monthMap[item._id]) monthMap[item._id].learningPaths = item.count;
    });
    bpMonthly.forEach((item: { _id: string; count: number }) => {
      if (monthMap[item._id]) monthMap[item._id].blogPosts = item.count;
    });

    const activities = [
      ...recentLearningPaths.map((lp) => ({
        type: 'learning_path' as const,
        title: lp.title,
        slug: lp.slug,
        updatedAt: lp.updatedAt,
        isPublished: lp.isPublished,
        thumbnail: lp.thumbnail,
      })),
      ...recentBlogPosts.map((bp) => ({
        type: 'blog_post' as const,
        title: bp.title,
        slug: bp.slug,
        updatedAt: bp.updatedAt,
        isPublished: bp.isPublished,
        thumbnail: bp.coverImage,
      })),
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    sendSuccess(res, {
      stats: {
        totalLearningPaths,
        completedPaths: publishedPaths,
        inProgressPaths: totalLearningPaths - publishedPaths,
        totalHoursLearned: totalViewsResult[0]?.total || 0,
        learningStreak: 0,
        averageRating: 0,
      },
      recentActivity: activities.slice(0, 10),
      learningProgress: progressPaths,
      recommendations: [],
      monthlyActivity: months.map((m) => ({
        month: m,
        hours: 0,
        courses: monthMap[m].learningPaths,
      })),
      categoryDistribution: distribution,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', authenticate, async (req, res, next) => {
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

router.get('/activity', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!._id;
    const [learningPaths, blogPosts] = await Promise.all([
      LearningPath.find({ creator: userId, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(10)
        .select('title slug updatedAt isPublished thumbnail')
        .lean(),
      BlogPost.find({ author: userId, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(10)
        .select('title slug updatedAt isPublished coverImage')
        .lean(),
    ]);

    const activities = [
      ...learningPaths.map((lp) => ({
        type: 'learning_path' as const,
        title: lp.title,
        slug: lp.slug,
        updatedAt: lp.updatedAt,
        isPublished: lp.isPublished,
        thumbnail: lp.thumbnail,
      })),
      ...blogPosts.map((bp) => ({
        type: 'blog_post' as const,
        title: bp.title,
        slug: bp.slug,
        updatedAt: bp.updatedAt,
        isPublished: bp.isPublished,
        thumbnail: bp.coverImage,
      })),
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    sendSuccess(res, activities.slice(0, 10));
  } catch (error) {
    next(error);
  }
});

router.get('/progress', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!._id;
    const paths = await LearningPath.find({ creator: userId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title slug difficulty thumbnail studentsCount rating')
      .lean();

    sendSuccess(res, paths);
  } catch (error) {
    next(error);
  }
});

router.get('/monthly-activity', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [lpMonthly, bpMonthly] = await Promise.all([
      LearningPath.aggregate([
        { $match: { creator: userId, isDeleted: false, createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      BlogPost.aggregate([
        { $match: { author: userId, isDeleted: false, createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const monthMap: Record<string, { learningPaths: number; blogPosts: number }> = {};
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = { learningPaths: 0, blogPosts: 0 };
      months.push(key);
    }

    lpMonthly.forEach((item) => {
      if (monthMap[item._id]) monthMap[item._id].learningPaths = item.count;
    });
    bpMonthly.forEach((item) => {
      if (monthMap[item._id]) monthMap[item._id].blogPosts = item.count;
    });

    sendSuccess(res, months.map((m) => ({ month: m, ...monthMap[m] })));
  } catch (error) {
    next(error);
  }
});

router.get('/category-distribution', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!._id;
    const distribution = await LearningPath.aggregate([
      { $match: { creator: userId, isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    sendSuccess(res, distribution);
  } catch (error) {
    next(error);
  }
});

export default router;

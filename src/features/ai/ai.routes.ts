import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';
import { CareerRoadmap } from './career-roadmap.model';
import { ResumeAnalysis } from './resume-analysis.model';
import { LearningRecommendation } from './learning-recommendation.model';

const router = Router();

router.post('/roadmap', authenticate, async (req, res, next) => {
  try {
    const { title, goal, currentSkills, timeline, steps } = req.body;
    const roadmap = await CareerRoadmap.create({
      user: req.user!._id,
      title: title || 'My Career Roadmap',
      goal,
      currentSkills: currentSkills || [],
      timeline: timeline || '3 months',
      steps: steps || [],
    });
    sendSuccess(res, roadmap, 'Roadmap created', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/roadmaps', authenticate, async (req, res, next) => {
  try {
    const roadmaps = await CareerRoadmap.find({ user: req.user!._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
    sendSuccess(res, roadmaps);
  } catch (error) {
    next(error);
  }
});

router.get('/roadmap/:id', authenticate, async (req, res, next) => {
  try {
    const roadmap = await CareerRoadmap.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: false,
    }).lean();
    if (!roadmap) throw new AppError('Roadmap not found', 404);
    sendSuccess(res, roadmap);
  } catch (error) {
    next(error);
  }
});

router.delete('/roadmap/:id', authenticate, async (req, res, next) => {
  try {
    const roadmap = await CareerRoadmap.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!roadmap) throw new AppError('Roadmap not found', 404);
    sendSuccess(res, null, 'Roadmap deleted');
  } catch (error) {
    next(error);
  }
});

router.post('/resume/analyze', authenticate, async (req, res, next) => {
  try {
    const { fileName, atsScore, missingSkills, suggestions, summary } = req.body;
    const analysis = await ResumeAnalysis.create({
      user: req.user!._id,
      fileName: fileName || 'resume.pdf',
      atsScore: atsScore || 0,
      missingSkills: missingSkills || [],
      suggestions: suggestions || [],
      summary: summary || '',
    });
    sendSuccess(res, analysis, 'Resume analyzed', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/resume/history', authenticate, async (req, res, next) => {
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user!._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
    sendSuccess(res, analyses);
  } catch (error) {
    next(error);
  }
});

router.get('/resume/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: false,
    }).lean();
    if (!analysis) throw new AppError('Analysis not found', 404);
    sendSuccess(res, analysis);
  } catch (error) {
    next(error);
  }
});

router.delete('/resume/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!analysis) throw new AppError('Analysis not found', 404);
    sendSuccess(res, null, 'Analysis deleted');
  } catch (error) {
    next(error);
  }
});

router.post('/recommendations', authenticate, async (req, res, next) => {
  try {
    const { goal, currentSkills, recommendations } = req.body;
    const rec = await LearningRecommendation.create({
      user: req.user!._id,
      goal,
      currentSkills: currentSkills || [],
      recommendations: recommendations || [],
    });
    sendSuccess(res, rec, 'Recommendations generated', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/recommendations/history', authenticate, async (req, res, next) => {
  try {
    const recs = await LearningRecommendation.find({ user: req.user!._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
    sendSuccess(res, recs);
  } catch (error) {
    next(error);
  }
});

router.delete('/recommendations/:id', authenticate, async (req, res, next) => {
  try {
    const rec = await LearningRecommendation.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!rec) throw new AppError('Recommendation not found', 404);
    sendSuccess(res, null, 'Recommendation deleted');
  } catch (error) {
    next(error);
  }
});

export default router;

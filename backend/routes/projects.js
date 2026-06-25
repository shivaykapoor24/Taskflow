const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, requireProjectAccess } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.use(protect);

// ─── GET /api/projects — list all projects for current user ───────────────────
router.get('/', asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    status: { $ne: 'archived' },
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

  // Attach task counts
  const withCounts = await Promise.all(
    projects.map(async (p) => {
      const [total, done, inProgress, overdue] = await Promise.all([
        Task.countDocuments({ project: p._id }),
        Task.countDocuments({ project: p._id, status: 'done' }),
        Task.countDocuments({ project: p._id, status: 'in-progress' }),
        Task.countDocuments({
          project: p._id,
          status: { $ne: 'done' },
          dueDate: { $lt: new Date() },
        }),
      ]);
      return { ...p.toJSON(), taskCount: { total, done, inProgress, overdue } };
    })
  );

  res.json({ projects: withCounts });
}));

// ─── POST /api/projects — create a project ───────────────────────────────────
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid hex color'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });

    const { name, description, emoji, color } = req.body;
    const project = await Project.create({
      name, description, emoji, color,
      owner: req.user._id,
    });
    await project.populate('owner', 'name email avatar');
    res.status(201).json({ project });
  })
);

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
router.get('/:id', requireProjectAccess('viewer'), asyncHandler(async (req, res) => {
  await req.project.populate('owner', 'name email avatar');
  await req.project.populate('members.user', 'name email avatar');
  res.json({ project: req.project });
}));

// ─── PATCH /api/projects/:id ──────────────────────────────────────────────────
router.patch(
  '/:id',
  requireProjectAccess('editor'),
  [body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/)],
  asyncHandler(async (req, res) => {
    const allowed = ['name', 'description', 'emoji', 'color', 'status'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email avatar');
    res.json({ project });
  })
);

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
router.delete('/:id', requireProjectAccess('admin'), asyncHandler(async (req, res) => {
  const isOwner = req.project.owner.toString() === req.user._id.toString();
  if (!isOwner) return res.status(403).json({ error: 'Only the project owner can delete it' });

  await Task.deleteMany({ project: req.params.id });
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project and all its tasks deleted' });
}));

// ─── GET /api/projects/:id/stats ──────────────────────────────────────────────
router.get('/:id/stats', requireProjectAccess('viewer'), asyncHandler(async (req, res) => {
  const [byStatus, byPriority, overdueTasks, recentlyCompleted] = await Promise.all([
    Task.aggregate([
      { $match: { project: req.project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: { project: req.project._id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({
      project: req.project._id,
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() },
    }),
    Task.find({ project: req.project._id, status: 'done' })
      .sort({ completedAt: -1 })
      .limit(5)
      .select('title completedAt'),
  ]);
  res.json({ byStatus, byPriority, overdueTasks, recentlyCompleted });
}));

// ─── POST /api/projects/:id/members ──────────────────────────────────────────
router.post('/:id/members', requireProjectAccess('admin'), asyncHandler(async (req, res) => {
  const { userId, role = 'editor' } = req.body;
  const project = req.project;

  const already = project.members.some((m) => m.user.toString() === userId);
  if (already) return res.status(409).json({ error: 'User is already a member' });

  project.members.push({ user: userId, role });
  await project.save();
  await project.populate('members.user', 'name email avatar');
  res.json({ project });
}));

// ─── DELETE /api/projects/:id/members/:userId ────────────────────────────────
router.delete('/:id/members/:userId', requireProjectAccess('admin'), asyncHandler(async (req, res) => {
  req.project.members = req.project.members.filter(
    (m) => m.user.toString() !== req.params.userId
  );
  await req.project.save();
  res.json({ message: 'Member removed' });
}));

module.exports = router;

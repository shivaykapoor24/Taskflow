const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.use(protect);

// Helper: verify user has access to the task's project
async function checkProjectAccess(req, res, projectId, minRole = 'viewer') {
  const project = await Project.findById(projectId);
  if (!project) { res.status(404).json({ error: 'Project not found' }); return null; }

  const isOwner = project.owner.toString() === req.user._id.toString();
  if (isOwner) return project;

  const member = project.members.find((m) => m.user.toString() === req.user._id.toString());
  if (!member) { res.status(403).json({ error: 'Not a project member' }); return null; }

  const roles = ['viewer', 'editor', 'admin'];
  if (roles.indexOf(member.role) < roles.indexOf(minRole)) {
    res.status(403).json({ error: `${minRole} access required` }); return null;
  }
  return project;
}

// ─── GET /api/tasks?projectId=&status=&priority=&assignee=&page=&limit= ───────
router.get(
  '/',
  [
    query('projectId').notEmpty().withMessage('projectId is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });

    const { projectId, status, priority, assignee, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const project = await checkProjectAccess(req, res, projectId);
    if (!project) return;

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (search) filter.$text = { $search: search };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    res.json({ tasks, total, page, pages: Math.ceil(total / limit) });
  })
);

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('projectId').notEmpty().withMessage('projectId is required'),
    body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });

    const { title, description, status, priority, projectId, assignee, dueDate, tags } = req.body;

    const project = await checkProjectAccess(req, res, projectId, 'editor');
    if (!project) return;

    // Set order to end of the column
    const colCount = await Task.countDocuments({ project: projectId, status: status || 'todo' });

    const task = await Task.create({
      title, description, status, priority, tags,
      project: projectId,
      reporter: req.user._id,
      assignee: assignee || null,
      dueDate: dueDate || null,
      order: colCount,
    });

    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    res.status(201).json({ task });
  })
);

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
router.get('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('project', 'name color emoji');

  if (!task) return res.status(404).json({ error: 'Task not found' });

  const project = await checkProjectAccess(req, res, task.project._id);
  if (!project) return;

  res.json({ task });
}));

// ─── PATCH /api/tasks/:id ─────────────────────────────────────────────────────
router.patch(
  '/:id',
  [
    body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = await checkProjectAccess(req, res, task.project, 'editor');
    if (!project) return;

    const allowed = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'tags', 'order'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    res.json({ task });
  })
);

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
router.delete('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const project = await checkProjectAccess(req, res, task.project, 'editor');
  if (!project) return;

  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted' });
}));

// ─── PATCH /api/tasks/bulk/status ─────────────────────────────────────────────
router.patch('/bulk/status', asyncHandler(async (req, res) => {
  const { taskIds, status, projectId } = req.body;
  if (!taskIds?.length || !status || !projectId) {
    return res.status(400).json({ error: 'taskIds, status, and projectId required' });
  }

  const project = await checkProjectAccess(req, res, projectId, 'editor');
  if (!project) return;

  await Task.updateMany(
    { _id: { $in: taskIds }, project: projectId },
    { $set: { status, ...(status === 'done' ? { completedAt: new Date() } : { completedAt: null }) } }
  );

  res.json({ message: `${taskIds.length} tasks updated to "${status}"` });
}));

// ─── GET /api/tasks/my/assigned ───────────────────────────────────────────────
router.get('/my/assigned', asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignee: req.user._id })
    .populate('project', 'name color emoji')
    .sort({ dueDate: 1, createdAt: -1 })
    .limit(50);
  res.json({ tasks });
}));

module.exports = router;

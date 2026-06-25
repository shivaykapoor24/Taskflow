const express = require('express');
const User = require('../models/User');
const { protect, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.use(protect);

// ─── GET /api/users/search?q= ─────────────────────────────────────────────────
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ users: [] });

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
    _id: { $ne: req.user._id },
  })
    .select('name email avatar')
    .limit(10);

  res.json({ users });
}));

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name email avatar role createdAt');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
}));

// ─── Admin: GET /api/users (list all) ────────────────────────────────────────
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users });
}));

// ─── Admin: PATCH /api/users/:id/role ────────────────────────────────────────
router.patch('/:id/role', requireAdmin, asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['member', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be member or admin' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
}));

module.exports = router;

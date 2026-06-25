const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorised — no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired — please log in again' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check user is owner or member of a project (used in project routes)
const requireProjectAccess = (minRole = 'viewer') => async (req, res, next) => {
  const Project = require('../models/Project');
  const roles = ['viewer', 'editor', 'admin'];

  try {
    const project = await Project.findById(req.params.projectId || req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (isOwner) {
      req.project = project;
      return next();
    }

    const membership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }
    if (roles.indexOf(membership.role) < roles.indexOf(minRole)) {
      return res.status(403).json({ error: `${minRole} access required` });
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect, requireAdmin, requireProjectAccess };

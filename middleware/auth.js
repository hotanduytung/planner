const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-planner-key-999';

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to require one of the specified global roles
const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Requires one of: ${allowedRoles.join(', ')} (Your role: ${req.user.role})` 
      });
    }

    next();
  };
};

// Middleware to verify a user is member of a project (or is an Admin)
const requireProjectAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // Extract project ID from request params
    const projectId = req.params.projectId || req.params.id;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Admins bypass project-membership checks
    if (req.user.role === 'CEO_ADMIN') {
      return next();
    }

    // Check if user is a member of this project
    const member = await db.get(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (!member) {
      return res.status(403).json({ error: 'Access denied: You are not a member of this project.' });
    }

    next();
  } catch (error) {
    console.error('Error checking project access:', error);
    res.status(500).json({ error: 'Internal server error while verifying access privileges.' });
  }
};

module.exports = {
  authenticateToken,
  requireRoles,
  requireProjectAccess,
  JWT_SECRET
};

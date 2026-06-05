const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to get taskId
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

// Helper to check if a user has access to a task's project and verify task assignment for team members
const verifyTaskAccess = async (req, res, taskId) => {
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return null;
  }

  // Admins bypass project membership check
  if (req.user.role === 'CEO') {
    return task;
  }

  // Check project membership
  const member = await db.get(
    'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
    [task.project_id, req.user.id]
  );

  if (!member) {
    res.status(403).json({ error: 'Access denied: You are not a member of the project containing this task.' });
    return null;
  }

  return task;
};

// GET /api/tasks/:taskId/comments - Get comments for a task
router.get('/', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    
    // Verify access
    const task = await verifyTaskAccess(req, res, taskId);
    if (!task) return; // Response is already handled

    const comments = await db.query(
      `SELECT c.*, u.name as user_name, u.role as user_role 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.task_id = ? 
       ORDER BY c.created_at ASC`,
      [taskId]
    );

    res.json(comments);
  } catch (error) {
    console.error('List comments error:', error);
    res.status(500).json({ error: 'Server error retrieving comments' });
  }
});

// POST /api/tasks/:taskId/comments - Add a comment to a task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { content, is_report } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    // Verify task existence and project membership
    const task = await verifyTaskAccess(req, res, taskId);
    if (!task) return; // Response is already handled

    const role = req.user.role;

    // Insert comment
    await db.run(
      'INSERT INTO comments (task_id, user_id, content, is_report) VALUES (?, ?, ?, ?)',
      [taskId, req.user.id, content, is_report ? 1 : 0]
    );

    // Log activity
    const activityType = is_report ? 'ADD_REPORT' : 'ADD_COMMENT';
    const logDesc = is_report 
      ? `${req.user.name} reported progress on task "${task.title}": "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}".`
      : `${req.user.name} commented on task "${task.title}": "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}".`;

    await logActivity(
      task.project_id,
      taskId,
      req.user.id,
      activityType,
      logDesc
    );

    res.status(201).json({ message: is_report ? 'Progress report added successfully' : 'Comment added successfully' });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error adding comment' });
  }
});

module.exports = router;

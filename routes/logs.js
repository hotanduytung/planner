const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to get projectId
const db = require('../db');
const { authenticateToken, requireProjectAccess } = require('../middleware/auth');

// GET /api/projects/:projectId/logs - Fetch audit trail for a project
router.get('/', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    let logs;

    if (req.user.role === 'TEAM_MEMBER') {
      // Team members only see project-level logs (task_id IS NULL) or logs for tasks assigned to them
      logs = await db.query(
        `SELECT al.*, u.name as user_name, u.role as user_role 
         FROM activity_logs al
         JOIN users u ON al.user_id = u.id
         WHERE al.project_id = ? 
           AND (al.task_id IS NULL OR al.task_id IN (SELECT id FROM tasks WHERE assignee_id = ?))
         ORDER BY al.created_at DESC`,
        [projectId, req.user.id]
      );
    } else {
      // Admins, PMs, and Viewers see all activity logs for the project
      logs = await db.query(
        `SELECT al.*, u.name as user_name, u.role as user_role 
         FROM activity_logs al
         JOIN users u ON al.user_id = u.id
         WHERE al.project_id = ?
         ORDER BY al.created_at DESC`,
        [projectId]
      );
    }

    res.json(logs);
  } catch (error) {
    console.error('List activity logs error:', error);
    res.status(500).json({ error: 'Server error retrieving activity logs' });
  }
});

module.exports = router;

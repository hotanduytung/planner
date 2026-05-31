const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to get projectId
const db = require('../db');
const { authenticateToken, requireProjectAccess } = require('../middleware/auth');

// GET /api/projects/:projectId/dashboard - Get metrics for a single project
router.get('/', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const isTeamMember = req.user.role === 'TEAM_MEMBER';
    
    let sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'REVIEW' THEN 1 ELSE 0 END) as review,
        SUM(CASE WHEN status = 'TO_DO' THEN 1 ELSE 0 END) as to_do,
        SUM(CASE WHEN status != 'DONE' AND deadline IS NOT NULL AND datetime('now') > datetime(deadline) THEN 1 ELSE 0 END) as delayed
      FROM tasks
      WHERE project_id = ?
    `;
    
    let params = [projectId];
    if (isTeamMember) {
      sql += ' AND assignee_id = ?';
      params.push(req.user.id);
    }

    const metrics = await db.get(sql, params);
    
    // Format values since SUM might return null if count is 0
    const result = {
      total: metrics.total || 0,
      done: metrics.done || 0,
      in_progress: metrics.in_progress || 0,
      review: metrics.review || 0,
      to_do: metrics.to_do || 0,
      delayed: metrics.delayed || 0,
      completion_rate: metrics.total > 0 ? Math.round((metrics.done || 0) / metrics.total * 100) : 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get project dashboard metrics error:', error);
    res.status(500).json({ error: 'Server error retrieving dashboard metrics' });
  }
});

module.exports = router;

const db = require('../db');

/**
 * Helper to log actions into the audit trail (activity_logs table)
 * @param {number|null} projectId 
 * @param {number|null} taskId 
 * @param {number} userId 
 * @param {string} actionType 
 * @param {string} description 
 */
const logActivity = async (projectId, taskId, userId, actionType, description) => {
  try {
    await db.run(
      `INSERT INTO activity_logs (project_id, task_id, user_id, action_type, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [projectId, taskId, userId, actionType, description]
    );
    console.log(`[Activity Logged] User ${userId}: ${actionType} - ${description}`);
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
};

module.exports = {
  logActivity
};

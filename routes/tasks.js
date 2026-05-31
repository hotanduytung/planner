const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access projectId
const db = require('../db');
const { authenticateToken, requireProjectAccess } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

// Helper to format date strings for readability in logs
const formatDate = (isoString) => {
  if (!isoString) return 'none';
  try {
    return new Date(isoString).toLocaleDateString();
  } catch (e) {
    return isoString;
  }
};

// GET /api/projects/:projectId/tasks - Get tasks for a project
router.get('/', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    let tasks;

    if (req.user.role === 'TEAM_MEMBER') {
      // Team members only see tasks assigned to them
      tasks = await db.query(
        `SELECT t.*, u.name as assignee_name, u.email as assignee_email,
         (t.status != 'DONE' AND t.deadline IS NOT NULL AND datetime('now') > datetime(t.deadline)) as is_delayed
         FROM tasks t 
         LEFT JOIN users u ON t.assignee_id = u.id 
         WHERE t.project_id = ? AND t.assignee_id = ?
         ORDER BY t.created_at ASC`,
        [projectId, req.user.id]
      );
    } else {
      // Admins, PMs, and Viewers see all tasks
      tasks = await db.query(
        `SELECT t.*, u.name as assignee_name, u.email as assignee_email,
         (t.status != 'DONE' AND t.deadline IS NOT NULL AND datetime('now') > datetime(t.deadline)) as is_delayed
         FROM tasks t 
         LEFT JOIN users u ON t.assignee_id = u.id 
         WHERE t.project_id = ?
         ORDER BY t.created_at ASC`,
        [projectId]
      );
    }

    res.json(tasks);
  } catch (error) {
    console.error('List tasks error:', error);
    res.status(500).json({ error: 'Server error retrieving tasks' });
  }
});

// POST /api/projects/:projectId/tasks - Create a task (Admins and PMs only)
router.post('/', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Check role (Only Admin and PM can create tasks)
    if (!['CEO_ADMIN', 'PROJECT_MANAGER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Only Admins and Project Managers can create tasks.' });
    }

    const { title, description, status, priority, deadline, assigneeId, checklist } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Validate status and priority
    const validStatuses = ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    const taskStatus = status || 'TO_DO';
    const taskPriority = priority || 'MEDIUM';

    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    if (!validPriorities.includes(taskPriority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    // Validate assignee is a project member
    let verifiedAssigneeId = assigneeId || null;
    if (verifiedAssigneeId) {
      const isMember = await db.get(
        'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, verifiedAssigneeId]
      );
      if (!isMember) {
        return res.status(400).json({ error: 'Assignee must be a member of the project' });
      }
    }

    const serializedChecklist = checklist ? (typeof checklist === 'string' ? checklist : JSON.stringify(checklist)) : '[]';

    const result = await db.run(
      `INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, title, description || '', taskStatus, taskPriority, deadline || null, verifiedAssigneeId, serializedChecklist]
    );

    const taskId = result.id;
    let assigneeText = 'Unassigned';
    if (verifiedAssigneeId) {
      const assigneeUser = await db.get('SELECT name FROM users WHERE id = ?', [verifiedAssigneeId]);
      assigneeText = assigneeUser.name;
    }

    // Log the activity
    await logActivity(
      projectId,
      taskId,
      req.user.id,
      'CREATE_TASK',
      `${req.user.name} created task "${title}" (Status: ${taskStatus}, Assignee: ${assigneeText}).`
    );

    res.status(201).json({
      message: 'Task created successfully',
      taskId
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error creating task' });
  }
});

// PUT /api/projects/:projectId/tasks/:taskId - Update a task
router.put('/:taskId', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    
    // Fetch current task state
    const task = await db.get('SELECT * FROM tasks WHERE id = ? AND project_id = ?', [taskId, projectId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const role = req.user.role;
    
    // Block Viewer/Client
    if (role === 'VIEWER_CLIENT') {
      return res.status(403).json({ error: 'Access denied: Viewers have read-only access.' });
    }

    // Enforce Team Member restrictions
    if (role === 'TEAM_MEMBER') {
      if (task.assignee_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied: You can only update tasks assigned to you.' });
      }

      // Check if trying to edit fields other than status and checklist
      const forbiddenFields = Object.keys(req.body).filter(key => key !== 'status' && key !== 'checklist');
      if (forbiddenFields.length > 0) {
        return res.status(403).json({ 
          error: 'Access denied: Team Members are only authorized to update the task status and checklist.' 
        });
      }
    }

    // Process update
    if (role === 'TEAM_MEMBER') {
      // ONLY update status and/or checklist
      const { status, checklist } = req.body;
      if (status === undefined && checklist === undefined) {
        return res.status(400).json({ error: 'Status or checklist is required' });
      }

      let updatedFields = [];
      let params = [];
      let logDescriptions = [];

      if (status !== undefined) {
        const validStatuses = ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status value' });
        }
        if (task.status !== status) {
          updatedFields.push('status = ?');
          params.push(status);
          logDescriptions.push(`changed status from ${task.status} to ${status}`);
        }
      }

      if (checklist !== undefined) {
        const serializedChecklist = typeof checklist === 'string' ? checklist : JSON.stringify(checklist);
        if (task.checklist !== serializedChecklist) {
          updatedFields.push('checklist = ?');
          params.push(serializedChecklist);
          logDescriptions.push('updated the checklist');
        }
      }

      if (updatedFields.length > 0) {
        params.push(taskId);
        await db.run(
          `UPDATE tasks SET ${updatedFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          params
        );

        if (logDescriptions.length > 0) {
          const fullDesc = `${req.user.name} updated task "${task.title}": ${logDescriptions.join(', ')}.`;
          await logActivity(projectId, taskId, req.user.id, 'UPDATE_TASK', fullDesc);
        }
      }

      return res.json({ message: 'Task updated successfully' });
    } else {
      // CEO_ADMIN or PROJECT_MANAGER - can update everything
      const { title, description, status, priority, deadline, assigneeId, checklist } = req.body;
      
      const newTitle = title !== undefined ? title : task.title;
      const newDescription = description !== undefined ? description : task.description;
      const newStatus = status !== undefined ? status : task.status;
      const newPriority = priority !== undefined ? priority : task.priority;
      const newDeadline = deadline !== undefined ? deadline : task.deadline;
      const newAssigneeId = assigneeId !== undefined ? assigneeId : task.assignee_id;
      let newChecklist = task.checklist;
      if (checklist !== undefined) {
        newChecklist = typeof checklist === 'string' ? checklist : JSON.stringify(checklist);
      }

      // Basic validations
      if (!newTitle) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      
      const validStatuses = ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
      if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(newPriority)) {
        return res.status(400).json({ error: 'Invalid priority value' });
      }

      // Validate assignee membership if changed
      if (newAssigneeId !== task.assignee_id && newAssigneeId !== null) {
        const isMember = await db.get(
          'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
          [projectId, newAssigneeId]
        );
        if (!isMember) {
          return res.status(400).json({ error: 'Assignee must be a member of the project' });
        }
      }

      // Track changes for granular logs
      let logDescriptions = [];
      if (task.title !== newTitle) {
        logDescriptions.push(`renamed task to "${newTitle}"`);
      }
      if (task.status !== newStatus) {
        logDescriptions.push(`changed status from ${task.status} to ${newStatus}`);
      }
      if (task.priority !== newPriority) {
        logDescriptions.push(`changed priority from ${task.priority} to ${newPriority}`);
      }
      if (task.deadline !== newDeadline) {
        logDescriptions.push(`changed deadline from ${formatDate(task.deadline)} to ${formatDate(newDeadline)}`);
      }
      if (task.assignee_id !== newAssigneeId) {
        let oldAssigneeName = 'Unassigned';
        let newAssigneeName = 'Unassigned';
        if (task.assignee_id) {
          const oldUser = await db.get('SELECT name FROM users WHERE id = ?', [task.assignee_id]);
          if (oldUser) oldAssigneeName = oldUser.name;
        }
        if (newAssigneeId) {
          const newUser = await db.get('SELECT name FROM users WHERE id = ?', [newAssigneeId]);
          if (newUser) newAssigneeName = newUser.name;
        }
        logDescriptions.push(`reassigned from ${oldAssigneeName} to ${newAssigneeName}`);
      }
      if (checklist !== undefined && task.checklist !== newChecklist) {
        logDescriptions.push('updated the checklist');
      }

      await db.run(
        `UPDATE tasks 
         SET title = ?, description = ?, status = ?, priority = ?, deadline = ?, assignee_id = ?, checklist = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newTitle, newDescription, newStatus, newPriority, newDeadline, newAssigneeId, newChecklist, taskId]
      );

      // Log activity if there was any change
      if (logDescriptions.length > 0) {
        const fullDesc = `${req.user.name} updated task "${task.title}": ${logDescriptions.join(', ')}.`;
        await logActivity(projectId, taskId, req.user.id, 'UPDATE_TASK', fullDesc);
      }

      return res.json({ message: 'Task updated successfully' });
    }
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error updating task' });
  }
});

// DELETE /api/projects/:projectId/tasks/:taskId - Delete a task (Admins and PMs only)
router.delete('/:taskId', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Check role (Only Admin and PM can delete tasks)
    if (!['CEO_ADMIN', 'PROJECT_MANAGER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Only Admins and Project Managers can delete tasks.' });
    }

    const task = await db.get('SELECT title FROM tasks WHERE id = ? AND project_id = ?', [taskId, projectId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await db.run('DELETE FROM tasks WHERE id = ?', [taskId]);

    await logActivity(
      projectId,
      null,
      req.user.id,
      'DELETE_TASK',
      `${req.user.name} deleted task "${task.title}" (ID: ${taskId}).`
    );

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error deleting task' });
  }
});

module.exports = router;

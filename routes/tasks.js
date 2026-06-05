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
        `SELECT t.*, u.name as assignee_name, u.email as assignee_email, u.designation as assignee_designation,
         (t.status != 'DONE' AND t.deadline IS NOT NULL AND datetime('now') > datetime(t.deadline)) as is_delayed,
         (SELECT COUNT(*) FROM tasks WHERE parent_id = t.id) as subtask_total,
         (SELECT COUNT(*) FROM tasks WHERE parent_id = t.id AND status = 'DONE') as subtask_completed
         FROM tasks t 
         LEFT JOIN users u ON t.assignee_id = u.id 
         WHERE t.project_id = ? AND t.assignee_id = ? AND t.parent_id IS NULL
         ORDER BY t.position ASC, t.created_at ASC`,
        [projectId, req.user.id]
      );
    } else {
      // Admins, PMs, and Viewers see all tasks
      tasks = await db.query(
        `SELECT t.*, u.name as assignee_name, u.email as assignee_email, u.designation as assignee_designation,
         (t.status != 'DONE' AND t.deadline IS NOT NULL AND datetime('now') > datetime(t.deadline)) as is_delayed,
         (SELECT COUNT(*) FROM tasks WHERE parent_id = t.id) as subtask_total,
         (SELECT COUNT(*) FROM tasks WHERE parent_id = t.id AND status = 'DONE') as subtask_completed
         FROM tasks t 
         LEFT JOIN users u ON t.assignee_id = u.id 
         WHERE t.project_id = ? AND t.parent_id IS NULL
         ORDER BY t.position ASC, t.created_at ASC`,
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
    const { title, description, status, priority, deadline, assigneeId, checklist, start_date, parent_id, position, labels } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Role check and parent task permission logic
    if (parent_id) {
      const parentTask = await db.get('SELECT * FROM tasks WHERE id = ? AND project_id = ?', [parent_id, projectId]);
      if (!parentTask) {
        return res.status(404).json({ error: 'Parent task not found' });
      }
      if (req.user.role === 'TEAM_MEMBER' && parentTask.assignee_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied: You can only add sub-tasks to tasks assigned to you.' });
      }
    } else {
      // Top level task requires CEO or PM
      if (!['CEO', 'PM'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied: Only CEO and Project Managers can create top-level tasks.' });
      }
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
      `INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist, start_date, parent_id, position, labels) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, title, description || '', taskStatus, taskPriority, deadline || null, verifiedAssigneeId, serializedChecklist, start_date || null, parent_id || null, position || 0, labels || '']
    );

    const taskId = result.id;
    let assigneeText = 'Unassigned';
    if (verifiedAssigneeId) {
      const assigneeUser = await db.get('SELECT name FROM users WHERE id = ?', [verifiedAssigneeId]);
      assigneeText = assigneeUser.name;
    }

    // Log the activity
    const actionDesc = parent_id 
      ? `${req.user.name} created sub-task "${title}" under parent task (ID: ${parent_id}).`
      : `${req.user.name} created task "${title}" (Status: ${taskStatus}, Assignee: ${assigneeText}).`;

    await logActivity(
      projectId,
      taskId,
      req.user.id,
      parent_id ? 'CREATE_SUBTASK' : 'CREATE_TASK',
      actionDesc
    );

    res.status(201).json({
      message: parent_id ? 'Sub-task created successfully' : 'Task created successfully',
      taskId
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error creating task' });
  }
});

// PUT /api/projects/:projectId/tasks/reorder - Reorder tasks in a project
router.put('/reorder', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { taskIds, status } = req.body;

    if (!Array.isArray(taskIds)) {
      return res.status(400).json({ error: 'taskIds array is required' });
    }

    const role = req.user.role;
    if (role === 'TEAM_MEMBER') {
      for (const id of taskIds) {
        const task = await db.get('SELECT assignee_id FROM tasks WHERE id = ?', [id]);
        if (!task || task.assignee_id !== req.user.id) {
          return res.status(403).json({ error: 'Access denied: You can only reorder tasks assigned to you.' });
        }
      }
    }

    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      if (status) {
        await db.run(
          'UPDATE tasks SET position = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?',
          [i, status, taskId, projectId]
        );
      } else {
        await db.run(
          'UPDATE tasks SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?',
          [i, taskId, projectId]
        );
      }
    }

    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: 'Server error reordering tasks' });
  }
});

// GET /api/projects/:projectId/tasks/:taskId/subtasks - Get sub-tasks of a task
router.get('/:taskId/subtasks', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const subtasks = await db.query(
      `SELECT t.*, u.name as assignee_name, u.email as assignee_email, u.designation as assignee_designation,
       (t.status != 'DONE' AND t.deadline IS NOT NULL AND datetime('now') > datetime(t.deadline)) as is_delayed
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.project_id = ? AND t.parent_id = ?
       ORDER BY t.position ASC, t.created_at ASC`,
      [projectId, taskId]
    );
    res.json(subtasks);
  } catch (error) {
    console.error('List subtasks error:', error);
    res.status(500).json({ error: 'Server error retrieving subtasks' });
  }
});

// GET /api/projects/:projectId/tasks/:taskId - Get details of a single task
router.get('/:taskId', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const task = await db.get(
      `SELECT t.*, u.name as assignee_name, u.email as assignee_email, u.designation as assignee_designation,
       (t.status != 'DONE' AND t.deadline IS NOT NULL AND datetime('now') > datetime(t.deadline)) as is_delayed
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.id = ? AND t.project_id = ?`,
      [taskId, projectId]
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error retrieving task details' });
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
    


    // Enforce Team Member restrictions
    if (role === 'TEAM_MEMBER') {
      let isAllowed = task.assignee_id === req.user.id;
      if (!isAllowed && task.parent_id) {
        const parentTask = await db.get('SELECT assignee_id FROM tasks WHERE id = ?', [task.parent_id]);
        if (parentTask && parentTask.assignee_id === req.user.id) {
          isAllowed = true;
        }
      }
      if (!isAllowed) {
        return res.status(403).json({ error: 'Access denied: You can only update tasks assigned to you.' });
      }

      // If it is a main task, they can only edit status and checklist.
      if (!task.parent_id) {
        const forbiddenFields = Object.keys(req.body).filter(key => key !== 'status' && key !== 'checklist');
        if (forbiddenFields.length > 0) {
          return res.status(403).json({ 
            error: 'Access denied: Team Members are only authorized to update status and checklist on top-level tasks.' 
          });
        }
      }
    }

    // Process update
    if (role === 'TEAM_MEMBER' && !task.parent_id) {
      // ONLY update status and/or checklist for top-level tasks
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
      // CEO or PM - can update everything
      const { title, description, status, priority, deadline, assigneeId, checklist, start_date, labels } = req.body;
      
      const newTitle = title !== undefined ? title : task.title;
      const newDescription = description !== undefined ? description : task.description;
      const newStatus = status !== undefined ? status : task.status;
      const newPriority = priority !== undefined ? priority : task.priority;
      const newDeadline = deadline !== undefined ? deadline : task.deadline;
      const newAssigneeId = assigneeId !== undefined ? assigneeId : task.assignee_id;
      const newStartDate = start_date !== undefined ? start_date : task.start_date;
      const newLabels = labels !== undefined ? labels : task.labels;
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
      if (task.start_date !== newStartDate) {
        logDescriptions.push(`changed start date from ${formatDate(task.start_date)} to ${formatDate(newStartDate)}`);
      }
      if (task.labels !== newLabels) {
        logDescriptions.push(`changed labels to "${newLabels}"`);
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
         SET title = ?, description = ?, status = ?, priority = ?, deadline = ?, assignee_id = ?, checklist = ?, start_date = ?, labels = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newTitle, newDescription, newStatus, newPriority, newDeadline, newAssigneeId, newChecklist, newStartDate, newLabels, taskId]
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

    // Check role (Only CEO and PM can delete tasks)
    if (!['CEO', 'PM'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Only CEO and Project Managers can delete tasks.' });
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

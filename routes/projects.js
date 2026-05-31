const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRoles, requireProjectAccess } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

// GET /api/projects - List accessible projects based on user role
router.get('/', authenticateToken, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'CEO_ADMIN') {
      // Admins see all projects
      projects = await db.query(`
        SELECT p.*, u.name as creator_name 
        FROM projects p 
        LEFT JOIN users u ON p.creator_id = u.id 
        ORDER BY p.created_at DESC
      `);
    } else {
      // PMs, Team Members, and Viewers see only projects they are members of
      projects = await db.query(`
        SELECT p.*, u.name as creator_name 
        FROM projects p 
        LEFT JOIN users u ON p.creator_id = u.id
        JOIN project_members pm ON p.id = pm.project_id 
        WHERE pm.user_id = ? 
        ORDER BY p.created_at DESC
      `, [req.user.id]);
    }
    res.json(projects);
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: 'Server error retrieving projects' });
  }
});

// POST /api/projects - Create a new project (Admins and PMs only)
router.post('/', authenticateToken, requireRoles(['CEO_ADMIN', 'PROJECT_MANAGER']), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Insert project
    const result = await db.run(
      'INSERT INTO projects (name, description, creator_id) VALUES (?, ?, ?)',
      [name, description || '', req.user.id]
    );

    const projectId = result.id;

    // Automatically add the creator as a project member
    await db.run(
      'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
      [projectId, req.user.id]
    );

    // Log the activity
    await logActivity(
      projectId, 
      null, 
      req.user.id, 
      'CREATE_PROJECT', 
      `${req.user.name} (${req.user.role === 'CEO_ADMIN' ? 'Admin' : 'PM'}) created project "${name}".`
    );

    res.status(201).json({
      message: 'Project created successfully',
      projectId,
      name,
      description
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error creating project' });
  }
});

// GET /api/projects/:id - Get details of a single project
router.get('/:id', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const project = await db.get(`
      SELECT p.*, u.name as creator_name 
      FROM projects p 
      LEFT JOIN users u ON p.creator_id = u.id 
      WHERE p.id = ?
    `, [req.params.id]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error retrieving project details' });
  }
});

// PUT /api/projects/:id - Update a project (Admins and PMs only)
router.put('/:id', authenticateToken, requireProjectAccess, requireRoles(['CEO_ADMIN', 'PROJECT_MANAGER']), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await db.get('SELECT name FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await db.run(
      'UPDATE projects SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description || '', req.params.id]
    );

    await logActivity(
      req.params.id, 
      null, 
      req.user.id, 
      'UPDATE_PROJECT', 
      `${req.user.name} updated project details (Name: "${name}").`
    );

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error updating project' });
  }
});

// DELETE /api/projects/:id - Delete a project (Admins and PMs only)
router.delete('/:id', authenticateToken, requireProjectAccess, requireRoles(['CEO_ADMIN', 'PROJECT_MANAGER']), async (req, res) => {
  try {
    const project = await db.get('SELECT name FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);

    await logActivity(
      null, 
      null, 
      req.user.id, 
      'DELETE_PROJECT', 
      `${req.user.name} deleted project "${project.name}" (ID: ${req.params.id}).`
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error deleting project' });
  }
});

// MEMBERSHIP ENDPOINTS

// GET /api/projects/:id/members - List members of a project
router.get('/:id/members', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const members = await db.query(`
      SELECT u.id, u.name, u.email, u.role, pm.created_at as joined_at 
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      ORDER BY u.name ASC
    `, [req.params.id]);
    res.json(members);
  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({ error: 'Server error retrieving project members' });
  }
});

// POST /api/projects/:id/members - Add user to project (Admins and PMs only)
router.post('/:id/members', authenticateToken, requireProjectAccess, requireRoles(['CEO_ADMIN', 'PROJECT_MANAGER']), async (req, res) => {
  try {
    const { userId } = req.body;
    const projectId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify user exists
    const userToAdd = await db.get('SELECT name, role FROM users WHERE id = ?', [userId]);
    if (!userToAdd) {
      return res.status(404).json({ error: 'User to add does not exist' });
    }

    // Check if user is already a member
    const existing = await db.get(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (existing) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    // Add member
    await db.run(
      'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
      [projectId, userId]
    );

    const project = await db.get('SELECT name FROM projects WHERE id = ?', [projectId]);

    await logActivity(
      projectId, 
      null, 
      req.user.id, 
      'ADD_MEMBER', 
      `${req.user.name} added ${userToAdd.name} (${userToAdd.role}) to project "${project.name}".`
    );

    res.json({ message: 'User added to project successfully' });
  } catch (error) {
    console.error('Add project member error:', error);
    res.status(500).json({ error: 'Server error adding member' });
  }
});

// DELETE /api/projects/:id/members/:userId - Remove member from project (Admins and PMs only)
router.delete('/:id/members/:userId', authenticateToken, requireProjectAccess, requireRoles(['CEO_ADMIN', 'PROJECT_MANAGER']), async (req, res) => {
  try {
    const projectId = req.params.id;
    const userIdToRemove = req.params.userId;

    // Verify membership exists
    const member = await db.get(
      'SELECT pm.id, u.name, u.role FROM project_members pm JOIN users u ON pm.user_id = u.id WHERE pm.project_id = ? AND pm.user_id = ?',
      [projectId, userIdToRemove]
    );

    if (!member) {
      return res.status(404).json({ error: 'User is not a member of this project' });
    }

    // Prevent removing the project creator if they are the only PM (soft rule, but let's just let it happen or log it)
    await db.run(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userIdToRemove]
    );

    const project = await db.get('SELECT name FROM projects WHERE id = ?', [projectId]);

    await logActivity(
      projectId, 
      null, 
      req.user.id, 
      'REMOVE_MEMBER', 
      `${req.user.name} removed ${member.name} (${member.role}) from project "${project.name}".`
    );

    res.json({ message: 'User removed from project successfully' });
  } catch (error) {
    console.error('Remove project member error:', error);
    res.status(500).json({ error: 'Server error removing member' });
  }
});

module.exports = router;

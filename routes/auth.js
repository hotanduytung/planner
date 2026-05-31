const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields (email, password, name, role) are required' });
    }

    const validRoles = ['CEO_ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'VIEWER_CLIENT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid user role specified' });
    }

    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.run(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, role]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Sign JWT with user credentials
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login: ' + error.message });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
});

// List all users (useful for dropdown assignments and project managers)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await db.query('SELECT id, email, name, role FROM users ORDER BY name ASC');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error listing users' });
  }
});

module.exports = router;

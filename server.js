const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');

// Import routers
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const commentsRouter = require('./routes/comments');
const dashboardRouter = require('./routes/dashboard');
const logsRouter = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Register modular API routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);

// Nested routes
app.use('/api/projects/:projectId/tasks', tasksRouter);
app.use('/api/tasks/:taskId/comments', commentsRouter);
app.use('/api/projects/:projectId/dashboard', dashboardRouter);
app.use('/api/projects/:projectId/logs', logsRouter);

// Fallback for SPA routing to serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start the server
const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`  Microsoft Planner Clone Server running locally  `);
      console.log(`  URL: http://localhost:${PORT}                    `);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

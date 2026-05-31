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

// Database initialization wrapper (avoids race conditions)
let dbInitPromise = null;
const initDatabaseIfNeeded = () => {
  if (!dbInitPromise) {
    dbInitPromise = initDb().catch((err) => {
      dbInitPromise = null; // reset to allow retry on subsequent requests
      throw err;
    });
  }
  return dbInitPromise;
};

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to ensure DB is initialized in serverless contexts (like Vercel)
app.use(async (req, res, next) => {
  try {
    await initDatabaseIfNeeded();
    next();
  } catch (error) {
    console.error('Failed to initialize database on request:', error);
    res.status(500).json({ error: 'Database initialization failed: ' + error.message });
  }
});

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

// Start listening locally if not on Vercel
if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      await initDatabaseIfNeeded();
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
}

// Export app for Vercel Serverless Function deployment
module.exports = app;

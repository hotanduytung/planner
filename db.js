const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.VERCEL 
  ? '/tmp/database.db'
  : path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Helper to run queries with promises
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const initDb = async () => {
  try {
    await run('PRAGMA foreign_keys = ON;');

    // Detect and drop old tables to recreate with new 3-role schemas
    let needReset = false;
    try {
      const checkRole = await get("SELECT 1 FROM users WHERE role IN ('CEO_ADMIN', 'PROJECT_MANAGER', 'VIEWER_CLIENT') LIMIT 1");
      if (checkRole) {
        needReset = true;
      }
    } catch (e) {
      // Table might not exist yet
    }

    if (needReset) {
      console.log('Detected old roles. Dropping tables to recreate database with new CEO, PM, Team Member roles...');
      await run('PRAGMA foreign_keys = OFF;');
      await run('DROP TABLE IF EXISTS comments;');
      await run('DROP TABLE IF EXISTS activity_logs;');
      await run('DROP TABLE IF EXISTS tasks;');
      await run('DROP TABLE IF EXISTS project_members;');
      await run('DROP TABLE IF EXISTS projects;');
      await run('DROP TABLE IF EXISTS users;');
      await run('PRAGMA foreign_keys = ON;');
    }

    // 1. Create Users Table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('CEO', 'PM', 'TEAM_MEMBER')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try {
      await run('ALTER TABLE users ADD COLUMN designation TEXT;');
      console.log('Migration: Added designation column to users table');
    } catch (e) {
      // Ignored if column already exists
    }

    // 2. Create Projects Table
    await run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        creator_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    try {
      await run('ALTER TABLE projects ADD COLUMN bucket_names TEXT;');
      console.log('Migration: Added bucket_names column to projects table');
    } catch (e) {
      // Ignored if column already exists
    }
    try {
      await run('ALTER TABLE projects ADD COLUMN custom_buckets TEXT DEFAULT \'[]\'');
      console.log('Migration: Added custom_buckets column to projects table');
    } catch (e) {
      // Ignored if column already exists
    }

    // 3. Create Project Members Table
    await run(`
      CREATE TABLE IF NOT EXISTS project_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(project_id, user_id)
      );
    `);

    // 4. Create Tasks Table (status is stored as flexible TEXT to support custom buckets)
    await run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'TO_DO',
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        deadline DATETIME,
        assignee_id INTEGER,
        checklist TEXT DEFAULT '[]',
        position INTEGER DEFAULT 0,
        parent_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        start_date DATETIME,
        labels TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    try {
      await run("ALTER TABLE tasks ADD COLUMN labels TEXT DEFAULT '';");
      console.log('Migration: Added labels column to tasks table');
    } catch (e) {
      // Ignored if column already exists
    }
    try {
      await run('ALTER TABLE tasks ADD COLUMN position INTEGER DEFAULT 0;');
      console.log('Migration: Added position column to tasks table');
    } catch (e) {
      // Ignored if column already exists
    }
    try {
      await run('ALTER TABLE tasks ADD COLUMN parent_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE;');
      console.log('Migration: Added parent_id column to tasks table');
    } catch (e) {
      // Ignored if column already exists
    }

    // 5. Create Task Comments Table
    await run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_report INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    try {
      await run('ALTER TABLE comments ADD COLUMN is_report INTEGER DEFAULT 0;');
      console.log('Migration: Added is_report column to comments table');
    } catch (e) {
      // Ignored if column already exists
    }

    // 6. Create Activity Logs Table
    await run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        task_id INTEGER,
        user_id INTEGER NOT NULL,
        action_type TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('Tables initialized successfully.');

    // Seed Data if empty
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      console.log('Database empty. Seeding initial data...');
      
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('123456', salt);

      // Seed Users
      const adminRes = await run(
        'INSERT INTO users (email, password_hash, name, role, designation) VALUES (?, ?, ?, ?, ?)',
        ['tom@example.com', passwordHash, 'Tom', 'CEO', 'CEO']
      );
      const pmRes = await run(
        'INSERT INTO users (email, password_hash, name, role, designation) VALUES (?, ?, ?, ?, ?)',
        ['alice@example.com', passwordHash, 'Alice', 'PM', 'PM']
      );
      const memberRes = await run(
        'INSERT INTO users (email, password_hash, name, role, designation) VALUES (?, ?, ?, ?, ?)',
        ['rose@example.com', passwordHash, 'Rose', 'TEAM_MEMBER', 'UIUX Design']
      );
      const viewerRes = await run(
        'INSERT INTO users (email, password_hash, name, role, designation) VALUES (?, ?, ?, ?, ?)',
        ['charlie@example.com', passwordHash, 'Charlie', 'TEAM_MEMBER', 'Developer']
      );

      const adminId = adminRes.id;
      const pmId = pmRes.id;
      const memberId = memberRes.id;
      const viewerId = viewerRes.id;

      const defaultBuckets = JSON.stringify({
        'TO_DO': 'To do',
        'IN_PROGRESS': 'In progress',
        'REVIEW': 'Review',
        'DONE': 'Completed'
      });

      // Seed Projects (Created by CEO Tom)
      const proj1Res = await run(
        'INSERT INTO projects (name, description, creator_id, bucket_names) VALUES (?, ?, ?, ?)',
        ['Work Management Application', 'Full-featured work management application development project (Microsoft Planner Clone).', adminId, defaultBuckets]
      );
      const proj2Res = await run(
        'INSERT INTO projects (name, description, creator_id, bucket_names) VALUES (?, ?, ?, ?)',
        ['Mobile App Development', 'Building a native mobile application for iOS and Android platforms.', adminId, defaultBuckets]
      );

      const proj1Id = proj1Res.id;
      const proj2Id = proj2Res.id;

      // Seed Project Members (Project 1: CEO, PM, Members)
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj1Id, adminId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj1Id, pmId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj1Id, memberId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj1Id, viewerId]);

      // Project 2: CEO and PM Alice are members, Rose and Charlie are not
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj2Id, adminId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj2Id, pmId]);

      // Seed Tasks with Checklist JSON strings
      const now = new Date();
      
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(now.getDate() - 2);
      
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(now.getDate() - 3);

      const today = new Date();
      
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      // Task 1: Detailed Kanban Board Layout Design (To Do)
      const checklist1 = JSON.stringify([
        { text: 'Design interface Mockup', done: true },
        { text: 'Define color palette and CSS variables', done: false },
        { text: 'Program fixed sidebar', done: false }
      ]);
      const task1Res = await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist, labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Detailed Kanban Board Layout Design', 'Create column layouts, task cards with full checklist, and a progress bar.', 'TO_DO', 'HIGH', tomorrow.toISOString(), memberId, checklist1, 'PLANNING']
      );
      const task1Id = task1Res.id;
      
      // Task 2: Write Drag & Drop Sync Logic (In Progress)
      const checklist2 = JSON.stringify([
        { text: 'Create Event listeners for Drag/Drop', done: true },
        { text: 'Update status via API', done: true },
        { text: 'Synchronize card order', done: false }
      ]);
      const task2Res = await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist, labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Write Backend Drag & Drop Sync Logic', 'Synchronize Kanban card drag-and-drop actions with the SQLite database in real-time.', 'IN_PROGRESS', 'URGENT', tomorrow.toISOString(), memberId, checklist2, 'BUG FIX']
      );
      const task2Id = task2Res.id;

      // Task 3: Initialize Frontend & Backend Project Structure (Completed/Done)
      const checklist3 = JSON.stringify([
        { text: 'Install Express & SQLite3', done: true },
        { text: 'Create sample database and seeding script', done: true }
      ]);
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist, labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Initialize Frontend & Backend Project Structure', 'Set up directories, install npm modules, and run the test server.', 'DONE', 'LOW', twoDaysAgo.toISOString(), memberId, checklist3, 'FEATURE']
      );

      // Task 4: Research dnd-kit and hello-pangea/dnd documentation (To Do)
      const checklist4 = JSON.stringify([
        { text: 'Research dnd-kit', done: false },
        { text: 'Experiment with hello-pangea/dnd', done: false }
      ]);
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist, labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Research dnd-kit and hello-pangea/dnd documentation', 'Evaluate popular drag-and-drop libraries for project development.', 'TO_DO', 'MEDIUM', threeDaysAgo.toISOString(), pmId, checklist4, 'PLANNING']
      );

      // Task 5: Seeded in Project 2 (Mobile App Development)
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj2Id, 'Prepare App Store Assets', 'Generate icons and screenshots for app store submissions.', 'TO_DO', 'MEDIUM', tomorrow.toISOString(), pmId, 'PLANNING']
      );

      // Seed Relational Sub-tasks for Task 1
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Define color palette and CSS variables', 'Choose Hex, HSL colors for system tokens and import Outfit, Inter fonts.', 'DONE', 'LOW', tomorrow.toISOString(), memberId, task1Id]
      );
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Program Sidebar Navigation and Tabs', 'Create a collapsible sidebar, design link icons, and active tab logic.', 'IN_PROGRESS', 'MEDIUM', tomorrow.toISOString(), memberId, task1Id]
      );
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Design detail modal input fields', 'Layout two columns in the task detail modal, configure select dropdowns and inputs.', 'TO_DO', 'HIGH', tomorrow.toISOString(), memberId, task1Id]
      );

      // Seed Relational Sub-tasks for Task 2
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Create Frontend Drag/Drop Event Listeners', 'Capture dragstart, dragover, dragleave, drop events to create visual feedback.', 'DONE', 'URGENT', tomorrow.toISOString(), memberId, task2Id]
      );
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Update status and position via API', 'Send the reordered task list to the Backend reorder endpoint.', 'DONE', 'HIGH', tomorrow.toISOString(), viewerId, task2Id]
      );
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Sync card order and persist position on reload', 'Test saving data into SQLite table and showing correct positions after reload.', 'TO_DO', 'MEDIUM', tomorrow.toISOString(), viewerId, task2Id]
      );

      // Seed Comments & Reports on Task 2
      await run(
        'INSERT INTO comments (task_id, user_id, content, is_report) VALUES (?, ?, ?, ?)',
        [task2Id, viewerId, 'Optimized batch UPDATE queries, improving positioning updates speed by 50%.', 1]
      );
      await run(
        'INSERT INTO comments (task_id, user_id, content, is_report) VALUES (?, ?, ?, ?)',
        [task2Id, memberId, 'Great! I tested dragging 20 consecutive cards and it feels very smooth.', 0]
      );
      await run(
        'INSERT INTO comments (task_id, user_id, content, is_report) VALUES (?, ?, ?, ?)',
        [task2Id, memberId, 'Finished fixing drag slippage issue on Firefox.', 1]
      );
      await run(
        'INSERT INTO comments (task_id, user_id, content, is_report) VALUES (?, ?, ?, ?)',
        [task2Id, pmId, 'Good job, remember to check RBAC permissions during updates.', 0]
      );

      // Project 3: Marketing Campaign Q3
      const proj3Res = await run(
        'INSERT INTO projects (name, description, creator_id, bucket_names) VALUES (?, ?, ?, ?)',
        ['Q3/2026 Marketing Campaign', 'Media planning, content development, and running Facebook/Google Ads for the new product.', adminId, defaultBuckets]
      );
      const proj3Id = proj3Res.id;
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj3Id, adminId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj3Id, pmId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj3Id, memberId]);

      // Seed Tasks for Project 3
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj3Id, 'Set Budget and Marketing Channels', 'Allocate advertising budget and list core social media channels.', 'TO_DO', 'HIGH', tomorrow.toISOString(), pmId, 'PLANNING']
      );
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj3Id, 'Design Media Deliverables (Banners & Videos)', 'Create banners, posters, and short videos showcasing key features.', 'IN_PROGRESS', 'MEDIUM', nextWeek.toISOString(), memberId, 'MARKETING']
      );
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj3Id, 'Approve Brand PR Article on VnExpress', 'Write PR article, submit for content review, and schedule publishing.', 'REVIEW', 'MEDIUM', tomorrow.toISOString(), pmId, 'PLANNING']
      );

      // Seed Activity Logs
      await run(
        'INSERT INTO activity_logs (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
        [proj1Id, adminId, 'CREATE_PROJECT', 'Tom (CEO) created project "Work Management Application".']
      );
      await run(
        'INSERT INTO activity_logs (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
        [proj1Id, adminId, 'ADD_MEMBER', 'Tom (CEO) added Alice (PM) to project.']
      );
      await run(
        'INSERT INTO activity_logs (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
        [proj3Id, pmId, 'CREATE_TASK', 'Alice (PM) created task "Set Budget and Marketing Channels".']
      );
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};

module.exports = {
  query,
  get,
  run,
  initDb,
  db
};

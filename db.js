const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.db');
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

    // 1. Create Users Table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('CEO_ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'VIEWER_CLIENT')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

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

    // 4. Create Tasks Table (with checklist JSON column)
    await run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK(status IN ('TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE')),
        priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')) DEFAULT 'MEDIUM',
        deadline DATETIME,
        assignee_id INTEGER,
        checklist TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // 5. Create Task Comments Table
    await run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

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
      const passwordHash = await bcrypt.hash('password123', salt);

      // Seed Users
      const adminRes = await run(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        ['admin@example.com', passwordHash, 'Alice CEO (Admin)', 'CEO_ADMIN']
      );
      const pmRes = await run(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        ['pm@example.com', passwordHash, 'Bob Manager (PM)', 'PROJECT_MANAGER']
      );
      const memberRes = await run(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        ['member@example.com', passwordHash, 'Charlie Developer (Member)', 'TEAM_MEMBER']
      );
      const viewerRes = await run(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        ['viewer@example.com', passwordHash, 'Diana Client (Viewer)', 'VIEWER_CLIENT']
      );

      const adminId = adminRes.id;
      const pmId = pmRes.id;
      const memberId = memberRes.id;
      const viewerId = viewerRes.id;

      // Seed Projects
      const proj1Res = await run(
        'INSERT INTO projects (name, description, creator_id) VALUES (?, ?, ?)',
        ['Xây Dựng Ứng Dụng Quản Lý Công Việc', 'Dự án phát triển ứng dụng quản lý công việc (Microsoft Planner Clone) đầy đủ tính năng.', pmId]
      );
      const proj2Res = await run(
        'INSERT INTO projects (name, description, creator_id) VALUES (?, ?, ?)',
        ['Mobile App Development', 'Building a native mobile application for iOS and Android platforms.', pmId]
      );

      const proj1Id = proj1Res.id;
      const proj2Id = proj2Res.id;

      // Seed Project Members (Project 1: PM, Member, Viewer, Admin)
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj1Id, pmId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj1Id, memberId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj1Id, viewerId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj1Id, adminId]);

      // Project 2: Mobile App has PM and Admin
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj2Id, pmId]);
      await run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [proj2Id, adminId]);

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

      // Task 1: Thiết kế Layout Kanban (To Do)
      const checklist1 = JSON.stringify([
        { text: 'Thiết kế Mockup giao diện', done: true },
        { text: 'Xác định bảng màu và CSS variables', done: false },
        { text: 'Lập trình sidebar cố định', done: false }
      ]);
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Thiết kế Layout chi tiết Kanban Board', 'Tạo cấu trúc layout cột, thẻ công việc với đầy đủ checklist và thanh tiến độ.', 'TO_DO', 'HIGH', tomorrow.toISOString(), memberId, checklist1]
      );
      
      // Task 2: Viết logic Drag & Drop (In Progress)
      const checklist2 = JSON.stringify([
        { text: 'Tạo Event listeners cho Drag/Drop', done: true },
        { text: 'Cập nhật trạng thái qua API', done: true },
        { text: 'Đồng bộ hóa thứ tự thẻ', done: false }
      ]);
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Viết logic Drag & Drop đồng bộ database phía Backend', 'Đồng bộ hóa kéo thả thẻ Kanban với cơ sở dữ liệu SQLite theo thời gian thực.', 'IN_PROGRESS', 'URGENT', tomorrow.toISOString(), memberId, checklist2]
      );

      // Task 3: Khởi tạo cấu trúc dự án (Completed/Done)
      const checklist3 = JSON.stringify([
        { text: 'Cài đặt Express & SQLite3', done: true },
        { text: 'Tạo cơ sở dữ liệu mẫu và Seeding script', done: true }
      ]);
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Khởi tạo cấu trúc dự án Frontend & Backend', 'Thiết lập thư mục, cài đặt npm modules và chạy thử server kiểm thử.', 'DONE', 'LOW', twoDaysAgo.toISOString(), memberId, checklist3]
      );

      // Task 4: Nghiên cứu tài liệu (To Do)
      const checklist4 = JSON.stringify([
        { text: 'Nghiên cứu dnd-kit', done: false },
        { text: 'Thử nghiệm hello-pangea/dnd', done: false }
      ]);
      await run(
        'INSERT INTO tasks (project_id, title, description, status, priority, deadline, assignee_id, checklist) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj1Id, 'Nghiên cứu tài liệu dnd-kit và hello-pangea/dnd', 'Đánh giá các thư viện kéo thả phổ biến phục vụ cho phát triển dự án.', 'TO_DO', 'MEDIUM', threeDaysAgo.toISOString(), pmId, checklist4]
      );

      // Seed Comments on Task 2
      await run(
        'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
        [2, memberId, 'Đã hoàn thành phần bắt sự kiện DragOver và DragLeave. Đang test API cập nhật db.']
      );
      await run(
        'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
        [2, pmId, 'Tốt lắm, nhớ kiểm tra cả quyền RBAC khi cập nhật nhé.']
      );

      // Seed Activity Logs
      await run(
        'INSERT INTO activity_logs (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
        [proj1Id, pmId, 'CREATE_PROJECT', 'Bob Manager (PM) created project "Xây Dựng Ứng Dụng Quản Lý Công Việc".']
      );
      await run(
        'INSERT INTO activity_logs (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
        [proj1Id, pmId, 'ADD_MEMBER', 'Bob Manager (PM) added Charlie Developer (Member) to project.']
      );
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
};

module.exports = {
  query,
  get,
  run,
  initDb,
  db
};

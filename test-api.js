const { initDb, db } = require('./db');
const express = require('express');
const cors = require('cors');

// Import routers for the test server
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const commentsRouter = require('./routes/comments');
const dashboardRouter = require('./routes/dashboard');
const logsRouter = require('./routes/logs');

const setupTestServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/projects/:projectId/tasks', tasksRouter);
  app.use('/api/tasks/:taskId/comments', commentsRouter);
  app.use('/api/projects/:projectId/dashboard', dashboardRouter);
  app.use('/api/projects/:projectId/logs', logsRouter);
  
  return app;
};

const runTests = async () => {
  console.log('==================================================');
  console.log('         Running Backend Integration Tests        ');
  console.log('==================================================');

  await initDb(); // Ensure db is initialized/seeded

  const app = setupTestServer();
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const PORT = server.address().port;
  const BASE_URL = `http://localhost:${PORT}/api`;

  let tokens = {
    admin: '',
    pm: '',
    member: '',
    viewer: ''
  };

  let testProjectId = 1; // "Website Redesign" (from seeds)
  let testProject2Id = 2; // "Mobile App Development" (only PM & Admin are members, Charlie Developer is not)
  let charlieTaskId = 2; // "Develop Frontend Layout" (assigned to Charlie)
  let delayedTaskId = 4; // "Nghiên cứu tài liệu dnd-kit và hello-pangea/dnd" (assigned to PM Bob, deadline past)
  let pmTaskId = 5; // "Prepare App Store Assets" (Project 2, assigned to PM Bob)

  const assert = (condition, message) => {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      server.close();
      process.exit(1);
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  };

  try {
    // 1. Test Login & Role Assignment
    console.log('\n--- 1. Testing Authentication & JWT Generation ---');
    
    const loginRole = async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await res.json();
    };

    const adminLogin = await loginRole('tom@example.com', '123456');
    assert(adminLogin.token && adminLogin.user.role === 'CEO', 'CEO Tom can log in and receives correct role');
    tokens.admin = adminLogin.token;

    const pmLogin = await loginRole('alice@example.com', '123456');
    assert(pmLogin.token && pmLogin.user.role === 'PM', 'Project Manager Alice can log in and receives correct role');
    tokens.pm = pmLogin.token;

    const memberLogin = await loginRole('rose@example.com', '123456');
    assert(memberLogin.token && memberLogin.user.role === 'TEAM_MEMBER', 'Team Member Rose can log in and receives correct role');
    tokens.member = memberLogin.token;

    const viewerLogin = await loginRole('charlie@example.com', '123456');
    assert(viewerLogin.token && viewerLogin.user.role === 'TEAM_MEMBER', 'Team Member Charlie can log in and receives correct role');
    tokens.viewer = viewerLogin.token;

    // 2. Test Project Access Control (Least Privilege)
    console.log('\n--- 2. Testing Project Access Policies ---');
    
    // PM attempts to create a project (Should fail / 403)
    const pmCreateProjectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.pm}`
      },
      body: JSON.stringify({ name: 'PM Violating Project', description: 'Should fail' })
    });
    assert(pmCreateProjectRes.status === 403, 'Project Manager Alice is BLOCKED from creating projects');

    // CEO Tom creates a project
    const createProjectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.admin}`
      },
      body: JSON.stringify({ name: 'Integration Test Project', description: 'Testing creation' })
    });
    const createProjectData = await createProjectRes.json();
    assert(createProjectRes.status === 201, 'CEO Tom can create new projects');
    const newProjectId = createProjectData.projectId;

    // Team Member attempts to create a project
    const memberCreateProjectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.member}`
      },
      body: JSON.stringify({ name: 'Member Violating Project', description: 'Should fail' })
    });
    assert(memberCreateProjectRes.status === 403, 'Team Member Rose is BLOCKED from creating projects');

    // Access restricted projects (Project 2: Mobile App has Tom and Alice, Rose is not in it)
    const memberGetProject2 = await fetch(`${BASE_URL}/projects/${testProject2Id}`, {
      headers: { 'Authorization': `Bearer ${tokens.member}` }
    });
    assert(memberGetProject2.status === 403, 'Team Member Rose is BLOCKED from retrieving a project they are not a member of');

    const adminGetProject2 = await fetch(`${BASE_URL}/projects/${testProject2Id}`, {
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    assert(adminGetProject2.status === 200, 'CEO can bypass project membership checks to access any project');

    // 3. Test Task Visibility Rules
    console.log('\n--- 3. Testing Task Listing Visibility Filters ---');
    
    // CEO lists tasks for Project 1 (Website Redesign)
    const adminGetTasks = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks`, {
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    const adminTasks = await adminGetTasks.json();
    assert(adminTasks.length >= 3, 'CEO Tom sees all tasks in the project');

    // Team Member lists tasks (Should only see tasks assigned to them)
    const memberGetTasks = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks`, {
      headers: { 'Authorization': `Bearer ${tokens.member}` }
    });
    const memberTasks = await memberGetTasks.json();
    const allAssigned = memberTasks.every(t => t.assignee_id === 3); // 3 is Rose's ID
    assert(allAssigned, 'Team Member Rose sees ONLY tasks assigned directly to them');

    // 4. Test Task Modification Safeguards
    console.log('\n--- 4. Testing Task Editing Restrictions ---');
    
    // Team member updates status of task assigned to them
    const memberUpdateStatus = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks/${charlieTaskId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.member}`
      },
      body: JSON.stringify({ status: 'REVIEW' })
    });
    assert(memberUpdateStatus.status === 200, 'Team Member can update status of task assigned to them');

    // Team member tries to update title of task assigned to them
    const memberUpdateTitle = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks/${charlieTaskId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.member}`
      },
      body: JSON.stringify({ title: 'Hacked Title' })
    });
    assert(memberUpdateTitle.status === 403, 'Team Member is BLOCKED from editing task details other than status');

    // Team member tries to update a task assigned to PM (Project 2, which they aren't even a member of)
    const memberUpdatePMTask = await fetch(`${BASE_URL}/projects/${testProject2Id}/tasks/${pmTaskId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.member}`
      },
      body: JSON.stringify({ status: 'DONE' })
    });
    assert(memberUpdatePMTask.status === 403, 'Team Member is BLOCKED from editing tasks in projects they do not belong to');

    // Team Member who is not assignee tries to update status of a task
    const viewerUpdateTask = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks/${charlieTaskId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.viewer}`
      },
      body: JSON.stringify({ status: 'DONE' })
    });
    assert(viewerUpdateTask.status === 403, 'Team Member is BLOCKED from editing task status on tasks not assigned to them');

    // 5. Test Delay Flag
    console.log('\n--- 5. Testing Delay Flag Query Logic ---');
    
    const pmGetTasks = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks`, {
      headers: { 'Authorization': `Bearer ${tokens.pm}` }
    });
    const pmTasks = await pmGetTasks.json();
    
    const delayedTask = pmTasks.find(t => t.id === delayedTaskId);
    assert(delayedTask.is_delayed === 1, 'Delay Flag is correctly active (is_delayed = 1) for incomplete task past deadline');
    
    const completedTask = pmTasks.find(t => t.status === 'DONE');
    assert(completedTask ? completedTask.is_delayed === 0 : true, 'Delay Flag is NOT active (is_delayed = 0) for completed tasks regardless of deadline');

    // 6. Test Dashboard Analytics
    console.log('\n--- 6. Testing Dashboard Analytics ---');
    
    const pmDashboard = await fetch(`${BASE_URL}/projects/${testProjectId}/dashboard`, {
      headers: { 'Authorization': `Bearer ${tokens.pm}` }
    });
    const pmDashboardData = await pmDashboard.json();
    assert(
      pmDashboardData.total > 0 && 
      'delayed' in pmDashboardData && 
      'completion_rate' in pmDashboardData, 
      'Dashboard calculations return valid analytics, including delayed count'
    );

    // 7. Test Comments & Activity Logs
    console.log('\n--- 7. Testing Comment Restrictions & Activity Audit Trail ---');
    
    // Member comments on their task
    const memberComment = await fetch(`${BASE_URL}/tasks/${charlieTaskId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.member}`
      },
      body: JSON.stringify({ content: 'API integration testing comment' })
    });
    assert(memberComment.status === 201, 'Team Member Rose can add comments to Project 1 tasks');

    // Member Rose tries to comment on a task in Project 2 (which she is not a member of)
    const unauthorizedComment = await fetch(`${BASE_URL}/tasks/${pmTaskId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.member}`
      },
      body: JSON.stringify({ content: 'Unauthorized hacker comment' })
    });
    assert(unauthorizedComment.status === 403, 'Team Member Rose is BLOCKED from commenting on tasks in projects they do not belong to');

    // Check activity log contains entries
    const logRes = await fetch(`${BASE_URL}/projects/${testProjectId}/logs`, {
      headers: { 'Authorization': `Bearer ${tokens.pm}` }
    });
    const logData = await logRes.json();
    assert(logData.length > 0, 'Activity Log returns valid audit records');

    // 8. Testing Custom Task Labels
    console.log('\n--- 8. Testing Custom Task Labels ---');
    // CEO creates task with labels
    const createLabelsRes = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.admin}`
      },
      body: JSON.stringify({ 
        title: 'Task with labels', 
        status: 'TO_DO', 
        labels: 'TEST LABEL, ANOTHER ONE' 
      })
    });
    assert(createLabelsRes.status === 201, 'CEO can create task with labels');
    const createLabelsData = await createLabelsRes.json();
    const testTaskId = createLabelsData.taskId;

    // Get task and verify labels
    const getTaskRes = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks/${testTaskId}`, {
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    const testTask = await getTaskRes.json();
    assert(testTask.labels === 'TEST LABEL, ANOTHER ONE', 'Task details returns correct labels');

    // PM updates labels
    const updateLabelsRes = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks/${testTaskId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.pm}`
      },
      body: JSON.stringify({ 
        title: 'Task with labels',
        labels: 'UPDATED LABEL' 
      })
    });
    assert(updateLabelsRes.status === 200, 'PM can update task labels');

    // Get task and verify updated labels
    const getTaskRes2 = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks/${testTaskId}`, {
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    const testTask2 = await getTaskRes2.json();
    assert(testTask2.labels === 'UPDATED LABEL', 'Task details returns updated labels');

    // CEO removes labels
    const removeLabelsRes = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks/${testTaskId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.admin}`
      },
      body: JSON.stringify({ 
        title: 'Task with labels',
        labels: '' 
      })
    });
    assert(removeLabelsRes.status === 200, 'CEO can remove task labels');

    // Get task and verify labels are empty
    const getTaskRes3 = await fetch(`${BASE_URL}/projects/${testProjectId}/tasks/${testTaskId}`, {
      headers: { 'Authorization': `Bearer ${tokens.admin}` }
    });
    const testTask3 = await getTaskRes3.json();
    assert(testTask3.labels === '', 'Task details returns empty labels when removed');
    console.log('✅ PASS: Custom task labels creation, update, and removal verified');

    console.log('\n==================================================');
    console.log('     🎉 ALL BACKEND RBAC INTEGRATION TESTS PASSED 🎉    ');
    console.log('==================================================');
    
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('Integration test crashed with error:', error);
    server.close();
    process.exit(1);
  }
};

runTests();

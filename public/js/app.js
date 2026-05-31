// App State Management
const State = {
  currentUser: null,
  projects: [],
  selectedProjectId: null,
  tasks: [],
  users: [], // System users
  currentTab: 'tab-board',
  projectMembers: [],
  chartInstance: null,
  currentChecklist: [], // Active checklist items being edited in task modal
  boardViewMode: 'board', // 'board' or 'grid'
  gridSortColumn: 'title',
  gridSortDirection: 'asc',
  gridSearchQuery: ''
};

// UI Elements mapping
const DOM = {
  authView: document.getElementById('auth-view'),
  appView: document.getElementById('app-view'),
  authForm: document.getElementById('auth-form'),
  authTitle: document.getElementById('auth-title'),
  authSubtitle: document.getElementById('auth-subtitle'),
  authSubmitBtn: document.getElementById('auth-submit-btn'),
  authToggleText: document.getElementById('auth-toggle-text'),
  authToggleLink: document.getElementById('auth-toggle-link'),
  authEmail: document.getElementById('auth-email'),
  authPassword: document.getElementById('auth-password'),
  regName: document.getElementById('reg-name'),
  regRole: document.getElementById('reg-role'),
  
  headerUserName: document.getElementById('user-display-name'),
  headerUserInitials: document.getElementById('user-avatar-initials'),
  headerUserInitialsBadge: document.getElementById('header-user-initials-badge'),
  logoutBtn: document.getElementById('logout-btn'),
  devRoleSelect: document.getElementById('dev-role-select'),
  taskSearch: document.getElementById('task-search'),
  
  projectSelector: document.getElementById('project-selector'),
  createProjectBtn: document.getElementById('create-project-btn'),
  editProjectBtn: document.getElementById('edit-project-btn'),
  projectAvatarGroup: document.getElementById('project-avatar-group'),
  
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  
  createTaskBtn: document.getElementById('create-task-btn'),
  
  // Kanban Columns
  listTodo: document.getElementById('list-todo'),
  listProgress: document.getElementById('list-progress'),
  listReview: document.getElementById('list-review'),
  listDone: document.getElementById('list-done'),
  badgeTodo: document.getElementById('badge-todo'),
  badgeProgress: document.getElementById('badge-progress'),
  badgeReview: document.getElementById('badge-review'),
  badgeDone: document.getElementById('badge-done'),
  
  // Modals
  projectModal: document.getElementById('project-modal'),
  projectForm: document.getElementById('project-form'),
  projectFormId: document.getElementById('project-form-id'),
  projectNameInput: document.getElementById('project-name'),
  projectDescInput: document.getElementById('project-desc'),
  projectModalTitle: document.getElementById('project-modal-title'),
  projectModalCancel: document.getElementById('project-modal-cancel'),
  projectModalClose: document.getElementById('project-modal-close'),
  deleteProjectBtn: document.getElementById('delete-project-btn'),
  
  // Project Members inside modal
  projectMembersSection: document.getElementById('project-members-section'),
  modalMembersList: document.getElementById('modal-members-list'),
  projectMemberSelect: document.getElementById('project-member-select'),
  addMemberBtn: document.getElementById('add-member-btn'),
  
  // Workspace Members Tab
  tabMembersListContainer: document.getElementById('tab-members-list-container'),
  
  // Project Settings Tab
  projectSettingsForm: document.getElementById('project-settings-form'),
  settingsProjectName: document.getElementById('settings-project-name'),
  settingsProjectDesc: document.getElementById('settings-project-desc'),
  settingsDeleteProjectBtn: document.getElementById('settings-delete-project-btn'),
  
  // Task Modal
  taskModal: document.getElementById('task-modal'),
  taskForm: document.getElementById('task-form'),
  taskFormId: document.getElementById('task-form-id'),
  taskTitleInput: document.getElementById('task-title'),
  taskDescInput: document.getElementById('task-desc'),
  taskStatusSelect: document.getElementById('task-status'),
  taskPrioritySelect: document.getElementById('task-priority'),
  taskAssigneeSelect: document.getElementById('task-assignee'),
  taskDeadlineInput: document.getElementById('task-deadline'),
  taskModalTitle: document.getElementById('task-modal-title'),
  taskModalCancel: document.getElementById('task-modal-cancel'),
  taskModalClose: document.getElementById('task-modal-close'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  saveTaskBtn: document.getElementById('save-task-btn'),
  modalDelayFlagContainer: document.getElementById('modal-delay-flag-container'),
  
  // Modal Checklist Components
  modalChecklistItems: document.getElementById('modal-checklist-items'),
  modalChecklistProgress: document.getElementById('modal-checklist-progress'),
  modalChecklistProgressBar: document.getElementById('modal-checklist-progress-bar'),
  newChecklistItemInput: document.getElementById('new-checklist-item-input'),
  addChecklistItemBtn: document.getElementById('add-checklist-item-btn'),
  addChecklistItemRow: document.getElementById('add-checklist-item-row'),
  
  // My Tasks list
  mytasksListContainer: document.getElementById('mytasks-list-container'),
  
  // Board View Mode Switcher & Content
  viewModeBoard: document.getElementById('view-mode-board'),
  viewModeGrid: document.getElementById('view-mode-grid'),
  kanbanViewContent: document.getElementById('kanban-view-content'),
  gridViewContent: document.getElementById('grid-view-content'),
  gridTableBody: document.getElementById('grid-table-body'),
  
  // Comments
  commentsContainer: document.getElementById('modal-comments-container'),
  commentForm: document.getElementById('comment-form'),
  commentInput: document.getElementById('comment-input'),
  
  // Dashboard Metrics
  metricTotal: document.getElementById('metric-total-val'),
  metricCompleted: document.getElementById('metric-completed-val'),
  metricProgress: document.getElementById('metric-progress-val'),
  metricDelayed: document.getElementById('metric-delayed-val'),
  healthPercentage: document.getElementById('health-percentage-val'),
  healthLabel: document.getElementById('health-label-text'),
  
  // Activity Log
  logsListContainer: document.getElementById('logs-list-container'),
  toastContainer: document.getElementById('toast-container')
};

// UI Notification Helper
function showToast(message, type = 'info') {
  const toastEl = document.createElement('div');
  toastEl.innerHTML = Components.toast(message, type);
  const element = toastEl.firstElementChild;
  DOM.toastContainer.appendChild(element);
  
  // Auto remove toast after 4s
  setTimeout(() => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    setTimeout(() => element.remove(), 300);
  }, 4000);
}

// Check for existing session on page load
async function checkAuth() {
  const token = API.getToken();
  if (token) {
    try {
      State.currentUser = await API.getMe();
      showApp();
    } catch (e) {
      showToast('Session expired. Please log in again.', 'error');
      logout();
    }
  } else {
    showAuth();
  }
}

// Toggle Auth mode (Login <-> Register)
let isRegisterMode = false;
function toggleAuthMode(e) {
  e.preventDefault();
  isRegisterMode = !isRegisterMode;
  
  if (isRegisterMode) {
    DOM.authTitle.innerText = 'Create Account';
    DOM.authSubtitle.innerText = 'Sign up to configure your task board';
    DOM.authSubmitBtn.innerText = 'Register';
    DOM.authToggleText.innerText = 'Already have an account?';
    DOM.authToggleLink.innerText = 'Sign In';
    document.querySelectorAll('.register-only').forEach(el => el.style.display = 'block');
    DOM.regName.required = true;
  } else {
    DOM.authTitle.innerText = 'Welcome Back';
    DOM.authSubtitle.innerText = 'Sign in to manage your tasks and projects';
    DOM.authSubmitBtn.innerText = 'Sign In';
    DOM.authToggleText.innerText = "Don't have an account?";
    DOM.authToggleLink.innerText = 'Create one';
    document.querySelectorAll('.register-only').forEach(el => el.style.display = 'none');
    DOM.regName.required = false;
  }
}

// Show Authentication card
function showAuth() {
  DOM.authView.style.display = 'flex';
  DOM.appView.style.display = 'none';
}

// Show Application panel and initialize workspace
async function showApp() {
  DOM.authView.style.display = 'none';
  DOM.appView.style.display = 'flex';
  
  // Set User Badge
  const user = State.currentUser;
  DOM.headerUserName.innerText = user.name.toUpperCase();
  
  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  DOM.headerUserInitials.innerText = initials;
  if (DOM.headerUserInitialsBadge) {
    DOM.headerUserInitialsBadge.innerText = initials;
  }
  
  DOM.devRoleSelect.value = '';

  // Apply Least Privilege CSS constraints to Creator elements
  const isCreatorRole = ['CEO_ADMIN', 'PROJECT_MANAGER'].includes(user.role);
  document.querySelectorAll('.creator-only').forEach(el => {
    if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      el.style.display = isCreatorRole ? 'inline-flex' : 'none';
    } else {
      el.style.display = isCreatorRole ? 'block' : 'none';
    }
  });
  
  const settingsLink = document.getElementById('project-settings-sidebar-link');
  if (settingsLink) {
    settingsLink.style.display = isCreatorRole ? 'flex' : 'none';
  }

  // Fetch initial project data
  await loadProjects();
  await loadSystemUsers();
}

// Load project selector options
async function loadProjects() {
  try {
    State.projects = await API.getProjects();
    DOM.projectSelector.innerHTML = '';
    
    if (State.projects.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.innerText = 'NO PROJECTS AVAILABLE';
      DOM.projectSelector.appendChild(option);
      clearBoard();
      return;
    }
    
    State.projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.innerText = project.name.toUpperCase();
      DOM.projectSelector.appendChild(option);
    });

    if (!State.selectedProjectId || !State.projects.some(p => p.id === Number(State.selectedProjectId))) {
      State.selectedProjectId = State.projects[0].id;
    }
    
    DOM.projectSelector.value = State.selectedProjectId;
    await selectProject(State.selectedProjectId);
  } catch (error) {
    showToast('Failed to load projects: ' + error.message, 'error');
  }
}

// Clear board cards
function clearBoard() {
  DOM.listTodo.innerHTML = '';
  DOM.listProgress.innerHTML = '';
  DOM.listReview.innerHTML = '';
  DOM.listDone.innerHTML = '';
  DOM.badgeTodo.innerText = '0';
  DOM.badgeProgress.innerText = '0';
  DOM.badgeReview.innerText = '0';
  DOM.badgeDone.innerText = '0';
}

// Select active project and load corresponding tabs
async function selectProject(projectId) {
  if (!projectId) {
    clearBoard();
    return;
  }
  
  State.selectedProjectId = Number(projectId);
  DOM.projectSelector.value = projectId;

  // Clear search field on project switch
  if (DOM.taskSearch) DOM.taskSearch.value = '';

  await refreshActiveTab();
}

// Refresh active tab
async function refreshActiveTab() {
  if (!State.selectedProjectId) return;
  
  await loadProjectHeaderAvatars();
  
  // Show or hide View Switcher pill depending on if we are in Board tab
  const switcher = document.querySelector('.view-switcher-pill');
  if (switcher) {
    switcher.style.display = (State.currentTab === 'tab-board') ? 'flex' : 'none';
  }
  
  if (State.currentTab === 'tab-board') {
    await loadTasks();
  } else if (State.currentTab === 'tab-dashboard') {
    await loadDashboard();
  } else if (State.currentTab === 'tab-logs') {
    await loadActivityLogs();
  } else if (State.currentTab === 'tab-mytasks') {
    await loadMyTasks();
  } else if (State.currentTab === 'tab-members') {
    await loadWorkspaceMembersTab();
  } else if (State.currentTab === 'tab-settings') {
    await loadSettingsTab();
  }
}

// Populate the top header with member initials avatars
async function loadProjectHeaderAvatars() {
  try {
    const members = await API.getProjectMembers(State.selectedProjectId);
    if (DOM.projectAvatarGroup) {
      DOM.projectAvatarGroup.innerHTML = '';
      members.slice(0, 5).forEach(m => {
        const initials = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const cssClass = Components.getAssigneeClass(initials);
        const avatarHtml = `<div class="avatar-group-member ${cssClass}" title="${m.name} (${m.role.replace('_', ' ')})">${initials}</div>`;
        DOM.projectAvatarGroup.insertAdjacentHTML('beforeend', avatarHtml);
      });
    }
  } catch (e) {
    // Fail silently
  }
}

// Load tasks
async function loadTasks() {
  try {
    State.tasks = await API.getTasks(State.selectedProjectId);
    
    // Update view mode display classes
    if (State.boardViewMode === 'grid') {
      if (DOM.kanbanViewContent) DOM.kanbanViewContent.style.display = 'none';
      if (DOM.gridViewContent) DOM.gridViewContent.style.display = 'block';
      
      // Update switcher active states
      if (DOM.viewModeGrid) {
        DOM.viewModeGrid.classList.add('active');
        DOM.viewModeGrid.style.background = 'var(--colors-card-bg)';
        DOM.viewModeGrid.style.color = 'var(--colors-primary)';
      }
      if (DOM.viewModeBoard) {
        DOM.viewModeBoard.classList.remove('active');
        DOM.viewModeBoard.style.background = 'transparent';
        DOM.viewModeBoard.style.color = 'var(--colors-slate)';
      }
      
      renderGridViewTable();
    } else {
      if (DOM.kanbanViewContent) DOM.kanbanViewContent.style.display = 'block';
      if (DOM.gridViewContent) DOM.gridViewContent.style.display = 'none';
      
      // Update switcher active states
      if (DOM.viewModeBoard) {
        DOM.viewModeBoard.classList.add('active');
        DOM.viewModeBoard.style.background = 'var(--colors-card-bg)';
        DOM.viewModeBoard.style.color = 'var(--colors-primary)';
      }
      if (DOM.viewModeGrid) {
        DOM.viewModeGrid.classList.remove('active');
        DOM.viewModeGrid.style.background = 'transparent';
        DOM.viewModeGrid.style.color = 'var(--colors-slate)';
      }
      
      renderKanbanBoard();
    }
  } catch (error) {
    showToast('Failed to load tasks: ' + error.message, 'error');
  }
}

// Render task items in Grid (Data Table) View
function renderGridViewTable(tasksList = State.tasks) {
  if (!DOM.gridTableBody) return;
  DOM.gridTableBody.innerHTML = '';

  let filteredTasks = [...tasksList];
  
  // Apply Search query (from top-header search box query)
  const query = (DOM.taskSearch ? DOM.taskSearch.value : '').toLowerCase().trim();
  if (query) {
    filteredTasks = filteredTasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const descMatch = (task.description || '').toLowerCase().includes(query);
      const assigneeMatch = (task.assignee_name || '').toLowerCase().includes(query);
      return titleMatch || descMatch || assigneeMatch;
    });
  }

  // Apply Sorting
  filteredTasks.sort((a, b) => {
    let valA, valB;
    if (State.gridSortColumn === 'title') {
      valA = a.title || '';
      valB = b.title || '';
      return State.gridSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else if (State.gridSortColumn === 'assignee') {
      valA = a.assignee_name || '';
      valB = b.assignee_name || '';
      return State.gridSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else if (State.gridSortColumn === 'status') {
      const statusOrder = { 'TO_DO': 1, 'IN_PROGRESS': 2, 'REVIEW': 3, 'DONE': 4 };
      valA = statusOrder[a.status] || 0;
      valB = statusOrder[b.status] || 0;
      return State.gridSortDirection === 'asc' ? valA - valB : valB - valA;
    } else if (State.gridSortColumn === 'deadline') {
      const timeA = a.deadline ? new Date(a.deadline).getTime() : (State.gridSortDirection === 'asc' ? Infinity : -Infinity);
      const timeB = b.deadline ? new Date(b.deadline).getTime() : (State.gridSortDirection === 'asc' ? Infinity : -Infinity);
      return State.gridSortDirection === 'asc' ? timeA - timeB : timeB - timeA;
    }
    return 0;
  });

  // Update header icons for sorting
  document.querySelectorAll('.sortable-header').forEach(header => {
    const col = header.dataset.sort;
    const icon = header.querySelector('i');
    if (!icon) return;
    if (col === State.gridSortColumn) {
      if (State.gridSortDirection === 'asc') {
        icon.className = 'fa-solid fa-sort-up';
        icon.style.color = 'var(--colors-primary)';
      } else {
        icon.className = 'fa-solid fa-sort-down';
        icon.style.color = 'var(--colors-primary)';
      }
    } else {
      icon.className = 'fa-solid fa-sort';
      icon.style.color = 'var(--colors-slate)';
    }
  });

  if (filteredTasks.length === 0) {
    DOM.gridTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--colors-slate); padding: 32px; font-style: italic;">
          Không tìm thấy task nào.
        </td>
      </tr>
    `;
    return;
  }

  filteredTasks.forEach(task => {
    const initials = task.assignee_name 
      ? task.assignee_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
      : 'U';
    const assigneeClass = Components.getAssigneeClass(initials);
    
    const assigneeHtml = task.assignee_name 
      ? `<div style="display: flex; align-items: center; gap: 8px;">
           <div class="assignee-avatar-bubble ${assigneeClass}">${initials}</div>
           <span>${task.assignee_name}</span>
         </div>`
      : `<span style="color: var(--colors-slate); font-style: italic;">Chưa phân công</span>`;

    // Status Badges
    let statusHtml = '';
    if (task.status === 'TO_DO') {
      statusHtml = `<span class="badge" style="background: var(--priority-low-bg); color: var(--priority-low-text); padding: 4px 10px; border-radius: var(--rounded-md); font-weight: 600; font-size: 11px;">To Do</span>`;
    } else if (task.status === 'IN_PROGRESS') {
      statusHtml = `<span class="badge" style="background: var(--tag-feature-bg); color: var(--tag-feature-text); padding: 4px 10px; border-radius: var(--rounded-md); font-weight: 600; font-size: 11px;">In Progress</span>`;
    } else if (task.status === 'REVIEW') {
      statusHtml = `<span class="badge" style="background: var(--priority-high-bg); color: var(--priority-high-text); padding: 4px 10px; border-radius: var(--rounded-md); font-weight: 600; font-size: 11px;">Review</span>`;
    } else if (task.status === 'DONE') {
      statusHtml = `<span class="badge" style="background: var(--tag-marketing-bg); color: var(--tag-marketing-text); padding: 4px 10px; border-radius: var(--rounded-md); font-weight: 600; font-size: 11px;">Completed</span>`;
    }

    // Deadline formatting and delay flags
    const isOverdue = !!task.is_delayed;
    const dateText = task.deadline ? Components.formatDate(task.deadline) : 'Không có hạn chót';
    const deadlineHtml = isOverdue
      ? `<span style="color: #a80000; font-weight: 600; display: flex; align-items: center; gap: 6px;" title="Overdue (Delayed)">
           <i class="fa-solid fa-triangle-exclamation"></i> ${dateText}
         </span>`
      : `<span style="color: var(--colors-slate);"><i class="fa-regular fa-calendar" style="margin-right: 6px;"></i>${dateText}</span>`;

    // Priority badge
    const priorityHtml = `<span class="task-card-priority priority-badge-${task.priority.toLowerCase()}" style="margin: 0; padding: 2px 6px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;" title="Priority: ${task.priority}">
      <i class="fa-solid fa-flag"></i> ${task.priority}
    </span>`;

    const rowHtml = `
      <tr class="grid-row-item" data-id="${task.id}" style="border-bottom: 1px solid var(--colors-hairline);">
        <td style="padding: 14px 20px; font-weight: 600; color: var(--colors-ink-deep);">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${priorityHtml}
            <span>${task.title}</span>
          </div>
        </td>
        <td style="padding: 14px 20px;">${assigneeHtml}</td>
        <td style="padding: 14px 20px;">${statusHtml}</td>
        <td style="padding: 14px 20px;">${deadlineHtml}</td>
      </tr>
    `;
    DOM.gridTableBody.insertAdjacentHTML('beforeend', rowHtml);
  });

  // Attach Row Click event listener
  DOM.gridTableBody.querySelectorAll('.grid-row-item').forEach(row => {
    row.addEventListener('click', () => {
      openTaskModal(row.dataset.id);
    });
  });
}

// Redraw task cards in columns (optionally using a custom/filtered list)
function renderKanbanBoard(tasksList = State.tasks) {
  clearBoard();
  
  let todoCount = 0, progressCount = 0, reviewCount = 0, doneCount = 0;
  
  tasksList.forEach(task => {
    const cardHtml = Components.taskCard(task, State.currentUser.role, State.currentUser.id);
    
    if (task.status === 'TO_DO') {
      DOM.listTodo.insertAdjacentHTML('beforeend', cardHtml);
      todoCount++;
    } else if (task.status === 'IN_PROGRESS') {
      DOM.listProgress.insertAdjacentHTML('beforeend', cardHtml);
      progressCount++;
    } else if (task.status === 'REVIEW') {
      DOM.listReview.insertAdjacentHTML('beforeend', cardHtml);
      reviewCount++;
    } else if (task.status === 'DONE') {
      DOM.listDone.insertAdjacentHTML('beforeend', cardHtml);
      doneCount++;
    }
  });
  
  DOM.badgeTodo.innerText = todoCount;
  DOM.badgeProgress.innerText = progressCount;
  DOM.badgeReview.innerText = reviewCount;
  DOM.badgeDone.innerText = doneCount;
  
  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dblclick', () => openTaskModal(card.dataset.id));
  });

  setupDragAndDrop();
}

// Drag & drop handlers (No shadows, pure mechanical transitions)
function setupDragAndDrop() {
  const cards = document.querySelectorAll('.task-card[draggable="true"]');
  const columns = document.querySelectorAll('.kanban-column');
  
  let draggedCardId = null;

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedCardId = card.dataset.id;
      card.style.opacity = '0.3';
      e.dataTransfer.setData('text/plain', draggedCardId);
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      columns.forEach(col => col.classList.remove('drag-over'));
    });
  });

  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    column.addEventListener('dragenter', (e) => {
      e.preventDefault();
      column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('drag-over');
    });

    column.addEventListener('drop', async (e) => {
      e.preventDefault();
      column.classList.remove('drag-over');
      
      const taskId = e.dataTransfer.getData('text/plain');
      const newStatus = column.dataset.status;

      if (!taskId) return;

      const task = State.tasks.find(t => t.id === Number(taskId));
      if (!task || task.status === newStatus) return;

      const oldStatus = task.status;
      task.status = newStatus;
      renderKanbanBoard();

      try {
        await API.updateTask(State.selectedProjectId, taskId, { status: newStatus });
        showToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'success');
      } catch (error) {
        task.status = oldStatus;
        renderKanbanBoard();
        showToast('Access denied: ' + error.message, 'error');
      }
    });
  });
}

// Fetch users
async function loadSystemUsers() {
  try {
    State.users = await API.getUsers();
    
    DOM.taskAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
    State.users.forEach(user => {
      const option = `<option value="${user.id}">${user.name} (${user.role.replace('_', ' ')})</option>`;
      DOM.taskAssigneeSelect.insertAdjacentHTML('beforeend', option);
    });
  } catch (error) {
    showToast('Failed to load members dropdown: ' + error.message, 'error');
  }
}

// Load dashboard
async function loadDashboard() {
  try {
    const data = await API.getProjectDashboard(State.selectedProjectId);
    
    DOM.metricTotal.innerText = data.total;
    DOM.metricCompleted.innerText = data.done;
    DOM.metricProgress.innerText = data.in_progress;
    DOM.metricDelayed.innerText = data.delayed;
    
    DOM.healthPercentage.innerText = `${data.completion_rate}%`;
    
    if (data.total === 0) {
      DOM.healthLabel.innerText = 'NO DATA';
      DOM.healthLabel.style.color = 'var(--colors-muted)';
    } else if (data.delayed > 0) {
      DOM.healthLabel.innerText = 'WARNING: DELAYED';
      DOM.healthLabel.style.color = '#a80000';
    } else if (data.completion_rate >= 80) {
      DOM.healthLabel.innerText = 'EXCELLENT PROGRESS';
      DOM.healthLabel.style.color = '#107c41';
    } else {
      DOM.healthLabel.innerText = 'STABLE PROGRESS';
      DOM.healthLabel.style.color = 'var(--colors-primary)';
    }

    renderCharts(data);
  } catch (error) {
    showToast('Failed to load metrics: ' + error.message, 'error');
  }
}

// Render Slices in Chart.js
function renderCharts(metrics) {
  const ctx = document.getElementById('statusChart').getContext('2d');
  
  if (State.chartInstance) {
    State.chartInstance.destroy();
  }

  const totalCount = metrics.total;
  const chartData = totalCount > 0 
    ? [metrics.to_do, metrics.in_progress, metrics.review, metrics.done]
    : [1, 0, 0, 0];

  // Microsoft Planner Colors
  const bgColors = totalCount > 0 
    ? ['#a19f9d', '#0078d4', '#ff8c00', '#107c41']
    : ['#f3f2f1', 'transparent', 'transparent', 'transparent'];
    
  const borderColors = totalCount > 0 
    ? ['#ffffff', '#ffffff', '#ffffff', '#ffffff']
    : ['#d2d0ce', 'transparent', 'transparent', 'transparent'];

  State.chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: totalCount > 0 ? ['To Do', 'In Progress', 'Review', 'Completed'] : ['No tasks'],
      datasets: [{
        data: chartData,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#323130',
            padding: 14,
            font: { family: 'Inter', size: 12, weight: '500' }
          }
        }
      },
      cutout: '75%'
    }
  });
}

// Fetch logs
async function loadActivityLogs() {
  try {
    const logs = await API.getProjectLogs(State.selectedProjectId);
    DOM.logsListContainer.innerHTML = '';
    
    if (logs.length === 0) {
      DOM.logsListContainer.innerHTML = '<div style="color: var(--colors-muted); text-align: center; padding: 2rem;">No logs recorded yet.</div>';
      return;
    }
    
    logs.forEach(log => {
      const logHtml = Components.activityLogItem(log);
      DOM.logsListContainer.insertAdjacentHTML('beforeend', logHtml);
    });
  } catch (error) {
    showToast('Failed to load activity logs: ' + error.message, 'error');
  }
}

// Render user tasks in My Tasks tab
async function loadMyTasks() {
  try {
    const tasks = await API.getTasks(State.selectedProjectId);
    const myTasks = tasks.filter(t => t.assignee_id === State.currentUser.id);
    
    if (!DOM.mytasksListContainer) return;
    DOM.mytasksListContainer.innerHTML = '';
    
    if (myTasks.length === 0) {
      DOM.mytasksListContainer.innerHTML = '<div style="color: var(--colors-slate); text-align: center; padding: 2rem;">You do not have any tasks assigned in this project.</div>';
      return;
    }
    
    myTasks.forEach(task => {
      const isDone = task.status === 'DONE';
      const checkboxIcon = isDone 
        ? '<i class="fa-solid fa-circle-check mytask-checkbox-icon completed"></i>'
        : '<i class="fa-regular fa-circle mytask-checkbox-icon"></i>';
      const titleClass = isDone ? 'mytask-title-text completed' : 'mytask-title-text';
      const dateText = task.deadline ? Components.formatDate(task.deadline) : 'No deadline';
      const dateClass = task.is_delayed ? 'task-card-date delayed' : 'task-card-date';
      
      const rowHtml = `
        <div class="mytask-row-item" data-id="${task.id}">
          <div class="mytask-row-left">
            ${checkboxIcon}
            <span class="${titleClass}">${task.title}</span>
          </div>
          <div class="mytask-row-right">
            <span class="task-card-priority priority-badge-${task.priority.toLowerCase()}">${task.priority}</span>
            <span class="${dateClass}"><i class="fa-regular fa-calendar"></i> ${dateText}</span>
          </div>
        </div>
      `;
      DOM.mytasksListContainer.insertAdjacentHTML('beforeend', rowHtml);
    });
    
    DOM.mytasksListContainer.querySelectorAll('.mytask-row-item').forEach(item => {
      item.addEventListener('click', () => openTaskModal(item.dataset.id));
    });
  } catch (error) {
    showToast('Failed to load your tasks: ' + error.message, 'error');
  }
}

// Render workspace members inside Tab
async function loadWorkspaceMembersTab() {
  try {
    const project = await API.getProject(State.selectedProjectId);
    const members = await API.getProjectMembers(State.selectedProjectId);
    if (!DOM.tabMembersListContainer) return;
    DOM.tabMembersListContainer.innerHTML = '';
    
    members.forEach(member => {
      const html = Components.projectMemberItem(
        member,
        State.currentUser.role,
        State.currentUser.id,
        project.creator_id
      );
      DOM.tabMembersListContainer.insertAdjacentHTML('beforeend', html);
    });
    
    DOM.tabMembersListContainer.querySelectorAll('.remove-member-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await removeMember(btn.dataset.userId);
        await loadWorkspaceMembersTab();
      });
    });
  } catch (error) {
    showToast('Failed to load workspace members: ' + error.message, 'error');
  }
}

// Render project settings tab
async function loadSettingsTab() {
  try {
    const project = await API.getProject(State.selectedProjectId);
    if (DOM.settingsProjectName) DOM.settingsProjectName.value = project.name;
    if (DOM.settingsProjectDesc) DOM.settingsProjectDesc.value = project.description || '';
  } catch (e) {
    // Fail silently
  }
}

// PROJECT MODAL
function openCreateProjectModal() {
  DOM.projectFormId.value = '';
  DOM.projectNameInput.value = '';
  DOM.projectDescInput.value = '';
  DOM.projectModalTitle.innerText = 'New Project';
  DOM.projectMembersSection.style.display = 'none';
  DOM.deleteProjectBtn.style.display = 'none';
  
  DOM.projectModal.classList.add('active');
}

async function openEditProjectModal() {
  try {
    const project = await API.getProject(State.selectedProjectId);
    
    DOM.projectFormId.value = project.id;
    DOM.projectNameInput.value = project.name;
    DOM.projectDescInput.value = project.description || '';
    DOM.projectModalTitle.innerText = 'Edit Project Details';
    DOM.deleteProjectBtn.style.display = 'inline-flex';
    
    await loadProjectMembers(project.id, project.creator_id);
    
    DOM.projectMembersSection.style.display = 'block';
    DOM.projectModal.classList.add('active');
  } catch (error) {
    showToast('Failed to load project: ' + error.message, 'error');
  }
}

async function loadProjectMembers(projectId, creatorId) {
  try {
    State.projectMembers = await API.getProjectMembers(projectId);
    DOM.modalMembersList.innerHTML = '';
    
    State.projectMembers.forEach(member => {
      const itemHtml = Components.projectMemberItem(
        member, 
        State.currentUser.role, 
        State.currentUser.id, 
        creatorId
      );
      DOM.modalMembersList.insertAdjacentHTML('beforeend', itemHtml);
    });
    
    document.querySelectorAll('.remove-member-btn').forEach(btn => {
      btn.addEventListener('click', () => removeMember(btn.dataset.userId));
    });

    DOM.projectMemberSelect.innerHTML = '<option value="">Choose member to add...</option>';
    State.users.forEach(user => {
      const isAlreadyMember = State.projectMembers.some(m => m.id === user.id);
      if (!isAlreadyMember) {
        const opt = `<option value="${user.id}">${user.name} (${user.role.replace('_', ' ')})</option>`;
        DOM.projectMemberSelect.insertAdjacentHTML('beforeend', opt);
      }
    });
  } catch (error) {
    showToast('Failed to load project members: ' + error.message, 'error');
  }
}

async function addMember() {
  const userId = DOM.projectMemberSelect.value;
  if (!userId) return;

  try {
    await API.addProjectMember(State.selectedProjectId, userId);
    showToast('Project member added successfully', 'success');
    
    const project = await API.getProject(State.selectedProjectId);
    await loadProjectMembers(State.selectedProjectId, project.creator_id);
    await loadActivityLogs();
  } catch (error) {
    showToast('Failed to add member: ' + error.message, 'error');
  }
}

async function removeMember(userId) {
  if (!confirm('Are you sure you want to remove this user from the project?')) return;

  try {
    await API.removeProjectMember(State.selectedProjectId, userId);
    showToast('Project member removed successfully', 'success');
    
    const project = await API.getProject(State.selectedProjectId);
    await loadProjectMembers(State.selectedProjectId, project.creator_id);
    await loadActivityLogs();
  } catch (error) {
    showToast('Failed to remove member: ' + error.message, 'error');
  }
}

// TASK MODAL CHECKLIST RENDERING
function renderModalChecklist() {
  if (!DOM.modalChecklistItems) return;
  DOM.modalChecklistItems.innerHTML = '';
  
  const checklist = State.currentChecklist || [];
  const total = checklist.length;
  const completed = checklist.filter(c => c.done).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  if (DOM.modalChecklistProgress) {
    DOM.modalChecklistProgress.innerText = `${percent}%`;
  }
  if (DOM.modalChecklistProgressBar) {
    DOM.modalChecklistProgressBar.style.width = `${percent}%`;
  }
  
  const role = State.currentUser.role;
  const taskId = DOM.taskFormId.value;
  const task = taskId ? State.tasks.find(t => t.id === Number(taskId)) : null;
  
  // Determine checklist edit authorization
  let canEditChecklist = false;
  if (['CEO_ADMIN', 'PROJECT_MANAGER'].includes(role)) {
    canEditChecklist = true;
  } else if (role === 'TEAM_MEMBER' && task && task.assignee_id === State.currentUser.id) {
    canEditChecklist = true;
  }
  
  // If creating new task, PM & Admin can edit it
  if (!taskId && ['CEO_ADMIN', 'PROJECT_MANAGER'].includes(role)) {
    canEditChecklist = true;
  }
  
  if (DOM.addChecklistItemRow) {
    DOM.addChecklistItemRow.style.display = canEditChecklist ? 'flex' : 'none';
  }
  
  if (total === 0) {
    DOM.modalChecklistItems.innerHTML = '<div style="color: var(--colors-slate); font-size: 12px; text-align: center; padding: 4px 0;">No checklist items added yet.</div>';
    return;
  }
  
  checklist.forEach((item, index) => {
    const itemClass = item.done ? 'modal-checklist-item-text completed' : 'modal-checklist-item-text';
    const checkedAttr = item.done ? 'checked' : '';
    const disabledAttr = canEditChecklist ? '' : 'disabled';
    
    const deleteBtnHtml = canEditChecklist 
      ? `<button type="button" class="remove-checklist-item-btn" data-index="${index}" title="Delete item"><i class="fa-regular fa-trash-can"></i></button>`
      : '';
      
    const html = `
      <div class="modal-checklist-item">
        <div class="modal-checklist-item-left">
          <input type="checkbox" class="modal-checklist-item-checkbox" data-index="${index}" ${checkedAttr} ${disabledAttr}>
          <span class="${itemClass}">${item.text}</span>
        </div>
        ${deleteBtnHtml}
      </div>
    `;
    DOM.modalChecklistItems.insertAdjacentHTML('beforeend', html);
  });
  
  // Checklist event listeners
  DOM.modalChecklistItems.querySelectorAll('.modal-checklist-item-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const idx = Number(e.target.dataset.index);
      State.currentChecklist[idx].done = e.target.checked;
      renderModalChecklist();
    });
  });
  
  DOM.modalChecklistItems.querySelectorAll('.remove-checklist-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      State.currentChecklist.splice(idx, 1);
      renderModalChecklist();
    });
  });
}

function addChecklistItem() {
  if (!DOM.newChecklistItemInput) return;
  const text = DOM.newChecklistItemInput.value.trim();
  if (!text) return;
  
  if (!State.currentChecklist) {
    State.currentChecklist = [];
  }
  
  State.currentChecklist.push({ text, done: false });
  DOM.newChecklistItemInput.value = '';
  renderModalChecklist();
}

// TASK MODAL
function openAddTaskModal() {
  DOM.taskFormId.value = '';
  DOM.taskTitleInput.value = '';
  DOM.taskDescInput.value = '';
  DOM.taskStatusSelect.value = 'TO_DO';
  DOM.taskPrioritySelect.value = 'MEDIUM';
  DOM.taskAssigneeSelect.value = '';
  DOM.taskDeadlineInput.value = '';
  
  DOM.taskModalTitle.innerText = 'Add New Task';
  DOM.deleteTaskBtn.style.display = 'none';
  DOM.modalDelayFlagContainer.style.display = 'none';
  
  document.querySelectorAll('.task-detail-field').forEach(el => el.disabled = false);
  DOM.saveTaskBtn.style.display = 'inline-flex';

  DOM.taskAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
  API.getProjectMembers(State.selectedProjectId).then(members => {
    members.forEach(member => {
      const opt = `<option value="${member.id}">${member.name} (${member.role.replace('_', ' ')})</option>`;
      DOM.taskAssigneeSelect.insertAdjacentHTML('beforeend', opt);
    });
  }).catch(() => {
    loadSystemUsers();
  });

  State.currentChecklist = [];
  renderModalChecklist();

  DOM.taskModal.classList.add('active');
  DOM.commentsContainer.innerHTML = '<div style="color: var(--colors-muted); font-size: 0.8rem; text-align: center;">Comments will be available after creating the task.</div>';
  DOM.commentForm.style.display = 'none';
}

async function openTaskModal(taskId) {
  try {
    const task = State.tasks.find(t => t.id === Number(taskId));
    if (!task) return;

    DOM.taskFormId.value = task.id;
    DOM.taskTitleInput.value = task.title;
    DOM.taskDescInput.value = task.description || '';
    DOM.taskStatusSelect.value = task.status;
    DOM.taskPrioritySelect.value = task.priority;
    
    DOM.taskAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
    const members = await API.getProjectMembers(State.selectedProjectId);
    members.forEach(member => {
      const opt = `<option value="${member.id}">${member.name} (${member.role.replace('_', ' ')})</option>`;
      DOM.taskAssigneeSelect.insertAdjacentHTML('beforeend', opt);
    });
    DOM.taskAssigneeSelect.value = task.assignee_id || '';

    if (task.deadline) {
      const d = new Date(task.deadline);
      const tzoffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
      DOM.taskDeadlineInput.value = localISOTime;
    } else {
      DOM.taskDeadlineInput.value = '';
    }

    DOM.taskModalTitle.innerText = 'Task Details';
    DOM.modalDelayFlagContainer.style.display = task.is_delayed ? 'block' : 'none';

    const role = State.currentUser.role;
    const isPMOrAdmin = ['CEO_ADMIN', 'PROJECT_MANAGER'].includes(role);
    const isAssignedMember = role === 'TEAM_MEMBER' && task.assignee_id === State.currentUser.id;

    if (isPMOrAdmin) {
      document.querySelectorAll('.task-detail-field').forEach(el => el.disabled = false);
      DOM.taskStatusSelect.disabled = false;
      DOM.deleteTaskBtn.style.display = 'inline-flex';
      DOM.saveTaskBtn.style.display = 'inline-flex';
      DOM.commentForm.style.display = 'flex';
    } else if (isAssignedMember) {
      document.querySelectorAll('.task-detail-field').forEach(el => el.disabled = true);
      DOM.taskStatusSelect.disabled = false;
      DOM.deleteTaskBtn.style.display = 'none';
      DOM.saveTaskBtn.style.display = 'inline-flex';
      DOM.commentForm.style.display = 'flex';
    } else {
      document.querySelectorAll('.task-detail-field').forEach(el => el.disabled = true);
      DOM.taskStatusSelect.disabled = true;
      DOM.deleteTaskBtn.style.display = 'none';
      DOM.saveTaskBtn.style.display = 'none';
      DOM.commentForm.style.display = 'none';
    }

    // Load checklist
    try {
      State.currentChecklist = task.checklist ? (typeof task.checklist === 'string' ? JSON.parse(task.checklist) : task.checklist) : [];
    } catch (e) {
      State.currentChecklist = [];
    }
    renderModalChecklist();

    await loadTaskComments(task.id);
    DOM.taskModal.classList.add('active');
  } catch (error) {
    showToast('Failed to load task details: ' + error.message, 'error');
  }
}

async function loadTaskComments(taskId) {
  try {
    const comments = await API.getComments(taskId);
    DOM.commentsContainer.innerHTML = '';
    
    if (comments.length === 0) {
      DOM.commentsContainer.innerHTML = '<div style="color: var(--colors-muted); font-size: 0.8rem; text-align: center; padding: 1rem 0;">No comments yet.</div>';
      return;
    }

    comments.forEach(comment => {
      const commentHtml = Components.commentBubble(comment);
      DOM.commentsContainer.insertAdjacentHTML('beforeend', commentHtml);
    });

    DOM.commentsContainer.scrollTop = DOM.commentsContainer.scrollHeight;
  } catch (error) {
    DOM.commentsContainer.innerHTML = '<div style="color: var(--colors-urgent-text); font-size: 0.8rem; text-align: center; padding: 1rem 0;">Failed to load discussions.</div>';
  }
}

// FORM SUBMISSIONS

DOM.authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = DOM.authEmail.value;
  const password = DOM.authPassword.value;
  
  try {
    if (isRegisterMode) {
      const name = DOM.regName.value;
      const role = DOM.regRole.value;
      
      await API.register(email, password, name, role);
      showToast('Registration successful! Logging in...', 'success');
      await API.login(email, password);
    } else {
      await API.login(email, password);
      showToast('Welcome to Planify Enterprise!', 'success');
    }
    
    State.currentUser = API.getUser();
    await showApp();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

DOM.projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const projectId = DOM.projectFormId.value;
  const name = DOM.projectNameInput.value;
  const description = DOM.projectDescInput.value;
  
  try {
    if (projectId) {
      await API.updateProject(projectId, name, description);
      showToast('Project details updated', 'success');
    } else {
      const res = await API.createProject(name, description);
      showToast('Project created successfully', 'success');
      State.selectedProjectId = res.projectId;
    }
    
    DOM.projectModal.classList.remove('active');
    await loadProjects();
  } catch (error) {
    showToast('Failed to save project: ' + error.message, 'error');
  }
});

DOM.taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const taskId = DOM.taskFormId.value;
  const status = DOM.taskStatusSelect.value;
  
  try {
    if (taskId) {
      const role = State.currentUser.role;
      const task = State.tasks.find(t => t.id === Number(taskId));
      let payload = { status, checklist: State.currentChecklist };
      
      if (['CEO_ADMIN', 'PROJECT_MANAGER'].includes(role)) {
        payload = {
          title: DOM.taskTitleInput.value,
          description: DOM.taskDescInput.value,
          status,
          priority: DOM.taskPrioritySelect.value,
          assigneeId: DOM.taskAssigneeSelect.value ? Number(DOM.taskAssigneeSelect.value) : null,
          deadline: DOM.taskDeadlineInput.value ? new Date(DOM.taskDeadlineInput.value).toISOString() : null,
          checklist: State.currentChecklist
        };
      } else if (role === 'TEAM_MEMBER' && task && task.assignee_id === State.currentUser.id) {
        payload = {
          status,
          checklist: State.currentChecklist
        };
      }
      
      await API.updateTask(State.selectedProjectId, taskId, payload);
      showToast('Task updated successfully', 'success');
    } else {
      const payload = {
        title: DOM.taskTitleInput.value,
        description: DOM.taskDescInput.value,
        status,
        priority: DOM.taskPrioritySelect.value,
        assigneeId: DOM.taskAssigneeSelect.value ? Number(DOM.taskAssigneeSelect.value) : null,
        deadline: DOM.taskDeadlineInput.value ? new Date(DOM.taskDeadlineInput.value).toISOString() : null,
        checklist: State.currentChecklist
      };
      
      await API.createTask(State.selectedProjectId, payload);
      showToast('Task created successfully', 'success');
    }
    
    DOM.taskModal.classList.remove('active');
    await refreshActiveTab();
  } catch (error) {
    showToast('Failed to save task: ' + error.message, 'error');
  }
});

DOM.commentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const taskId = DOM.taskFormId.value;
  const content = DOM.commentInput.value;
  
  if (!taskId || !content.trim()) return;
  
  try {
    await API.addComment(taskId, content);
    DOM.commentInput.value = '';
    
    await loadTaskComments(taskId);
    await loadActivityLogs();
  } catch (error) {
    showToast('Failed to post comment: ' + error.message, 'error');
  }
});

// Settings Tab Form Submission
if (DOM.projectSettingsForm) {
  DOM.projectSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = DOM.settingsProjectName.value;
    const description = DOM.settingsProjectDesc.value;
    
    try {
      await API.updateProject(State.selectedProjectId, name, description);
      showToast('Project settings updated successfully', 'success');
      await loadProjects();
    } catch (error) {
      showToast('Failed to update settings: ' + error.message, 'error');
    }
  });
}

// DELETIONS

DOM.deleteProjectBtn.addEventListener('click', async () => {
  const projectId = DOM.projectFormId.value;
  if (!projectId) return;
  
  if (!confirm('WARNING: Deleting this project will erase all tasks, comments, and project associations permanently. Continue?')) {
    return;
  }
  
  try {
    await API.deleteProject(projectId);
    showToast('Project deleted successfully', 'success');
    DOM.projectModal.classList.remove('active');
    State.selectedProjectId = null;
    await loadProjects();
  } catch (error) {
    showToast('Failed to delete project: ' + error.message, 'error');
  }
});

if (DOM.settingsDeleteProjectBtn) {
  DOM.settingsDeleteProjectBtn.addEventListener('click', async () => {
    if (!confirm('WARNING: Deleting this project will erase all tasks, comments, and project associations permanently. Continue?')) {
      return;
    }
    
    try {
      await API.deleteProject(State.selectedProjectId);
      showToast('Project deleted successfully', 'success');
      State.selectedProjectId = null;
      await loadProjects();
    } catch (error) {
      showToast('Failed to delete project: ' + error.message, 'error');
    }
  });
}

DOM.deleteTaskBtn.addEventListener('click', async () => {
  const taskId = DOM.taskFormId.value;
  if (!taskId) return;
  
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    await API.deleteTask(State.selectedProjectId, taskId);
    showToast('Task deleted successfully', 'success');
    DOM.taskModal.classList.remove('active');
    await refreshActiveTab();
  } catch (error) {
    showToast('Failed to delete task: ' + error.message, 'error');
  }
});

// TAB VIEW NAVIGATION
DOM.tabBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    DOM.tabBtns.forEach(b => b.classList.remove('active'));
    DOM.tabPanes.forEach(p => p.classList.remove('active'));
    
    btn.classList.add('active');
    const paneId = btn.dataset.tab;
    document.getElementById(paneId).classList.add('active');
    
    State.currentTab = paneId;
    await refreshActiveTab();
  });
});

// REAL-TIME SEARCH BOX FILTERING
if (DOM.taskSearch) {
  DOM.taskSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      if (State.boardViewMode === 'grid') {
        renderGridViewTable();
      } else {
        renderKanbanBoard();
      }
      return;
    }
    
    const filtered = State.tasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const descMatch = (task.description || '').toLowerCase().includes(query);
      const assigneeMatch = (task.assignee_name || '').toLowerCase().includes(query);
      return titleMatch || descMatch || assigneeMatch;
    });
    
    if (State.boardViewMode === 'grid') {
      renderGridViewTable(filtered);
    } else {
      renderKanbanBoard(filtered);
    }
  });
}

// VIEW SWITCHER HANDLERS
if (DOM.viewModeBoard && DOM.viewModeGrid) {
  DOM.viewModeBoard.addEventListener('click', () => {
    State.boardViewMode = 'board';
    DOM.viewModeBoard.classList.add('active');
    DOM.viewModeBoard.style.background = 'var(--colors-card-bg)';
    DOM.viewModeBoard.style.color = 'var(--colors-primary)';
    
    DOM.viewModeGrid.classList.remove('active');
    DOM.viewModeGrid.style.background = 'transparent';
    DOM.viewModeGrid.style.color = 'var(--colors-slate)';
    
    if (DOM.kanbanViewContent) DOM.kanbanViewContent.style.display = 'block';
    if (DOM.gridViewContent) DOM.gridViewContent.style.display = 'none';
    
    renderKanbanBoard();
  });

  DOM.viewModeGrid.addEventListener('click', () => {
    State.boardViewMode = 'grid';
    DOM.viewModeGrid.classList.add('active');
    DOM.viewModeGrid.style.background = 'var(--colors-card-bg)';
    DOM.viewModeGrid.style.color = 'var(--colors-primary)';
    
    DOM.viewModeBoard.classList.remove('active');
    DOM.viewModeBoard.style.background = 'transparent';
    DOM.viewModeBoard.style.color = 'var(--colors-slate)';
    
    if (DOM.kanbanViewContent) DOM.kanbanViewContent.style.display = 'none';
    if (DOM.gridViewContent) DOM.gridViewContent.style.display = 'block';
    
    renderGridViewTable();
  });
}

// GRID SORTING HEADERS HANDLERS
document.querySelectorAll('.sortable-header').forEach(header => {
  header.addEventListener('click', () => {
    const col = header.dataset.sort;
    if (State.gridSortColumn === col) {
      State.gridSortDirection = State.gridSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      State.gridSortColumn = col;
      State.gridSortDirection = 'asc';
    }
    renderGridViewTable();
  });
});

// TRIGGERS AND SHORTCUTS
DOM.createProjectBtn.addEventListener('click', openCreateProjectModal);
DOM.editProjectBtn.addEventListener('click', openEditProjectModal);
DOM.createTaskBtn.addEventListener('click', openAddTaskModal);
DOM.projectSelector.addEventListener('change', (e) => selectProject(e.target.value));

DOM.addMemberBtn.addEventListener('click', addMember);

DOM.projectModalCancel.addEventListener('click', () => DOM.projectModal.classList.remove('active'));
DOM.projectModalClose.addEventListener('click', () => DOM.projectModal.classList.remove('active'));
DOM.taskModalCancel.addEventListener('click', () => DOM.taskModal.classList.remove('active'));
DOM.taskModalClose.addEventListener('click', () => DOM.taskModal.classList.remove('active'));

if (DOM.addChecklistItemBtn) {
  DOM.addChecklistItemBtn.addEventListener('click', addChecklistItem);
}
if (DOM.newChecklistItemInput) {
  DOM.newChecklistItemInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChecklistItem();
    }
  });
}

// Quick status board creation button hooks
function registerColumnCreateBtn(btnId, statusVal) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddTaskModal();
      DOM.taskStatusSelect.value = statusVal;
    });
  }
}
registerColumnCreateBtn('create-task-todo-btn', 'TO_DO');
registerColumnCreateBtn('create-task-progress-btn', 'IN_PROGRESS');
registerColumnCreateBtn('create-task-review-btn', 'REVIEW');
registerColumnCreateBtn('create-task-done-btn', 'DONE');

// Logout
function logout() {
  API.clearAuth();
  State.currentUser = null;
  State.selectedProjectId = null;
  if (State.chartInstance) {
    State.chartInstance.destroy();
    State.chartInstance = null;
  }
  showAuth();
}

DOM.logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});
DOM.authToggleLink.addEventListener('click', toggleAuthMode);

// QUICK SWITCHER
DOM.devRoleSelect.addEventListener('change', async (e) => {
  const chosenRole = e.target.value;
  if (!chosenRole) return;
  
  let email = '';
  if (chosenRole === 'admin') email = 'admin@example.com';
  else if (chosenRole === 'pm') email = 'pm@example.com';
  else if (chosenRole === 'member') email = 'member@example.com';
  else if (chosenRole === 'viewer') email = 'viewer@example.com';
  
  try {
    showToast(`Switching role to ${chosenRole.toUpperCase()}...`, 'info');
    await API.login(email, 'password123');
    State.currentUser = API.getUser();
    await showApp();
    showToast(`Logged in as ${State.currentUser.name}.`, 'success');
  } catch (error) {
    showToast('Switch failed: ' + error.message, 'error');
  }
});

// Demo credentials buttons auto-fill and submit
document.querySelectorAll('.copy-cred-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = btn.dataset.email;
    if (DOM.authEmail) DOM.authEmail.value = email;
    if (DOM.authPassword) DOM.authPassword.value = 'password123';
    showToast(`Autofilled credentials for ${email}`, 'success');
    
    // Automatically trigger form submit for seamless demo login!
    if (DOM.authForm) {
      DOM.authForm.dispatchEvent(new Event('submit'));
    }
  });
});

// App init
window.addEventListener('DOMContentLoaded', checkAuth);

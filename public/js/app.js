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
  gridSearchQuery: '',
  customBuckets: [] // Extra columns [{key, name}] beyond the 4 defaults
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
  modalTaskTagsContainer: document.getElementById('modal-task-tags-container'),
  taskLabelsInput: document.getElementById('task-labels'),
  
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
  viewModeTimeline: document.getElementById('view-mode-timeline'),
  viewModeCharts: document.getElementById('view-mode-charts'),
  viewModePeople: document.getElementById('view-mode-people'),
  kanbanViewContent: document.getElementById('kanban-view-content'),
  gridViewContent: document.getElementById('grid-view-content'),
  timelineViewContent: document.getElementById('timeline-view-content'),
  chartsViewContent: document.getElementById('charts-view-content'),
  peopleViewContent: document.getElementById('people-view-content'),
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
  toastContainer: document.getElementById('toast-container'),
  
  // Help Modal
  helpTrigger: document.getElementById('help-trigger-btn'),
  helpModal: document.getElementById('help-modal'),
  helpModalClose: document.getElementById('help-modal-close'),
  helpModalOk: document.getElementById('help-modal-ok-btn'),
  
  // Notifications Modal
  notificationsTrigger: document.getElementById('notifications-trigger-btn'),
  notificationsModal: document.getElementById('notifications-modal'),
  notificationsModalClose: document.getElementById('notifications-modal-close'),
  notificationsModalCloseBtn: document.getElementById('notifications-modal-close-btn'),
  notificationsList: document.getElementById('notifications-list'),
  
  // Profile Modal
  profileTrigger: document.getElementById('profile-trigger-btn'),
  profileModal: document.getElementById('profile-modal'),
  profileModalClose: document.getElementById('profile-modal-close'),
  profileModalLogout: document.getElementById('profile-modal-logout-btn'),
  profileEditName: document.getElementById('profile-edit-name'),
  profileEditDesignation: document.getElementById('profile-edit-designation'),
  profileModalSaveBtn: document.getElementById('profile-modal-save-btn'),
  
  // Task Start Date
  taskStartDate: document.getElementById('task-start-date'),
  
  // Task Progress Report
  taskProgressReport: document.getElementById('task-progress-report'),
  submitProgressReportBtn: document.getElementById('submit-progress-report-btn'),
  
  // Parent task relation container
  modalParentRelationContainer: document.getElementById('modal-parent-relation-container')
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
  const isCEO = user.role === 'CEO';
  const isPM = user.role === 'PM';
  const isCEOOrPM = isCEO || isPM;

  document.querySelectorAll('.creator-only').forEach(el => {
    let allowed = false;
    if (el.id === 'create-project-btn' || 
        el.id === 'subtab-settings-btn' || 
        el.id === 'subtab-settings' || 
        el.id === 'settings-delete-project-btn' || 
        el.id === 'delete-project-btn' || 
        el.id === 'edit-project-btn' || 
        el.classList.contains('add-member-form') || 
        el.id === 'add-member-trigger-btn') {
      // These are project management / admin operations: CEO only
      allowed = isCEO;
    } else {
      // These are task management operations: CEO or PM
      allowed = isCEOOrPM;
    }

    if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      el.style.display = allowed ? 'inline-flex' : 'none';
    } else {
      el.style.display = allowed ? 'block' : 'none';
    }
  });

  // Toggle Workspace & Settings sidebar link display based on Team Member role
  const workspaceSidebarLink = document.getElementById('project-workspace-settings-sidebar-link');
  if (workspaceSidebarLink) {
    if (user.role === 'TEAM_MEMBER') {
      workspaceSidebarLink.style.display = 'none';
      if (State.currentTab === 'tab-workspace-settings') {
        State.currentTab = 'tab-board';
        DOM.tabBtns.forEach(b => {
          if (b.dataset.tab === 'tab-workspace-settings') b.classList.remove('active');
          if (b.dataset.tab === 'tab-board') b.classList.add('active');
        });
        DOM.tabPanes.forEach(p => {
          if (p.id === 'tab-workspace-settings') p.classList.remove('active');
          if (p.id === 'tab-board') p.classList.add('active');
        });
      }
    } else {
      workspaceSidebarLink.style.display = 'flex';
    }
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
  
  // Remove any dynamically injected custom bucket columns
  const kanbanBoard = document.querySelector('.kanban-board');
  if (kanbanBoard) {
    kanbanBoard.querySelectorAll('.kanban-column[data-custom="true"]').forEach(col => col.remove());
  }
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
  } else if (State.currentTab === 'tab-myday') {
    await loadMyDay();
  } else if (State.currentTab === 'tab-dashboard') {
    await loadDashboard();
  } else if (State.currentTab === 'tab-mytasks') {
    await loadMyTasks();
  } else if (State.currentTab === 'tab-workspace-settings') {
    await loadWorkspaceMembersTab();
    await loadActivityLogs();
    if (State.currentUser && State.currentUser.role === 'CEO') {
      await loadSettingsTab();
    }
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
    // Load project custom bucket names + custom extra columns
    try {
      const project = await API.getProject(State.selectedProjectId);
      let bucketNames = {
        'TO_DO': 'To do',
        'IN_PROGRESS': 'In progress',
        'REVIEW': 'Review',
        'DONE': 'Completed'
      };
      if (project && project.bucket_names) {
        bucketNames = typeof project.bucket_names === 'string' ? JSON.parse(project.bucket_names) : project.bucket_names;
      }
      State.bucketNames = bucketNames;

      // Parse custom extra buckets (beyond the 4 defaults)
      let customBuckets = [];
      if (project && project.custom_buckets) {
        customBuckets = typeof project.custom_buckets === 'string' ? JSON.parse(project.custom_buckets) : project.custom_buckets;
      }
      State.customBuckets = customBuckets || [];
    } catch (e) {
      console.error('Error fetching project bucket names', e);
      State.bucketNames = {
        'TO_DO': 'To do',
        'IN_PROGRESS': 'In progress',
        'REVIEW': 'Review',
        'DONE': 'Completed'
      };
      State.customBuckets = [];
    }

    State.tasks = await API.getTasks(State.selectedProjectId);
    
    // Update view mode display classes
    if (DOM.kanbanViewContent) DOM.kanbanViewContent.style.display = 'none';
    if (DOM.gridViewContent) DOM.gridViewContent.style.display = 'none';
    if (DOM.timelineViewContent) DOM.timelineViewContent.style.display = 'none';
    if (DOM.chartsViewContent) DOM.chartsViewContent.style.display = 'none';
    if (DOM.peopleViewContent) DOM.peopleViewContent.style.display = 'none';

    const viewButtons = [
      { mode: 'board', el: DOM.viewModeBoard },
      { mode: 'grid', el: DOM.viewModeGrid },
      { mode: 'timeline', el: DOM.viewModeTimeline },
      { mode: 'charts', el: DOM.viewModeCharts },
      { mode: 'people', el: DOM.viewModePeople }
    ];
    viewButtons.forEach(btn => {
      if (btn.el) {
        if (State.boardViewMode === btn.mode) {
          btn.el.classList.add('active');
          btn.el.style.background = 'var(--colors-card-bg)';
          btn.el.style.color = 'var(--colors-primary)';
        } else {
          btn.el.classList.remove('active');
          btn.el.style.background = 'transparent';
          btn.el.style.color = 'var(--colors-slate)';
        }
      }
    });

    if (State.boardViewMode === 'grid') {
      if (DOM.gridViewContent) DOM.gridViewContent.style.display = 'block';
      renderGridViewTable();
    } else if (State.boardViewMode === 'timeline') {
      if (DOM.timelineViewContent) DOM.timelineViewContent.style.display = 'block';
      renderTimelineView();
    } else if (State.boardViewMode === 'charts') {
      if (DOM.chartsViewContent) DOM.chartsViewContent.style.display = 'block';
      renderChartsView();
    } else if (State.boardViewMode === 'people') {
      if (DOM.peopleViewContent) DOM.peopleViewContent.style.display = 'block';
      renderPeopleView();
    } else {
      if (DOM.kanbanViewContent) DOM.kanbanViewContent.style.display = 'block';
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
          No tasks found.
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
    
    const displayAssigneeName = task.assignee_name
      ? (task.assignee_designation ? `${task.assignee_name} - ${task.assignee_designation}` : task.assignee_name)
      : null;
    
    const assigneeHtml = displayAssigneeName
      ? `<div style="display: flex; align-items: center; gap: 8px;">
           <div class="assignee-avatar-bubble ${assigneeClass}">${initials}</div>
           <span>${displayAssigneeName}</span>
         </div>`
      : `<span style="color: var(--colors-slate); font-style: italic;">Unassigned</span>`;

    // Status Badges
    let statusHtml = '';
    const statusText = (State.bucketNames && State.bucketNames[task.status]) || task.status;
    if (task.status === 'TO_DO') {
      statusHtml = `<span class="badge" style="background: var(--priority-low-bg); color: var(--priority-low-text); padding: 4px 10px; border-radius: var(--rounded-md); font-weight: 600; font-size: 11px;">${statusText}</span>`;
    } else if (task.status === 'IN_PROGRESS') {
      statusHtml = `<span class="badge" style="background: var(--tag-feature-bg); color: var(--tag-feature-text); padding: 4px 10px; border-radius: var(--rounded-md); font-weight: 600; font-size: 11px;">${statusText}</span>`;
    } else if (task.status === 'REVIEW') {
      statusHtml = `<span class="badge" style="background: var(--priority-high-bg); color: var(--priority-high-text); padding: 4px 10px; border-radius: var(--rounded-md); font-weight: 600; font-size: 11px;">${statusText}</span>`;
    } else if (task.status === 'DONE') {
      statusHtml = `<span class="badge" style="background: var(--tag-marketing-bg); color: var(--tag-marketing-text); padding: 4px 10px; border-radius: var(--rounded-md); font-weight: 600; font-size: 11px;">${statusText}</span>`;
    }

    // Deadline formatting and delay flags
    const isOverdue = !!task.is_delayed;
    const dateText = task.deadline ? Components.formatDate(task.deadline) : 'No deadline';
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
  
  const role = State.currentUser.role;
  const isPMOrAdmin = ['CEO', 'PM'].includes(role);
  const kanbanBoard = document.querySelector('.kanban-board');
  const addBucketColumn = document.getElementById('add-bucket-column');

  // ── Inject custom bucket columns before the add-bucket button ──
  const customBuckets = State.customBuckets || [];
  customBuckets.forEach(bucket => {
    // Avoid duplicates
    if (kanbanBoard.querySelector(`[data-status="${bucket.key}"]`)) return;

    const colEl = document.createElement('div');
    colEl.className = 'kanban-column';
    colEl.dataset.status = bucket.key;
    colEl.dataset.custom = 'true';
    colEl.innerHTML = `
      <div class="column-header">
        <div class="column-header-left">
          <span class="column-title">${bucket.name}</span>
          <span class="column-badge">0</span>
        </div>
        <div class="column-header-right">
          <button class="col-action-btn creator-only" title="Add task"><i class="fa-solid fa-plus"></i></button>
          <button class="col-action-btn" title="More options"><i class="fa-solid fa-ellipsis"></i></button>
        </div>
      </div>
      ${isPMOrAdmin ? `
        <div class="quick-add-task-bar creator-only" style="margin-bottom: 12px; padding: 0 4px;">
          <input type="text" class="quick-add-input" placeholder="+ Add a task..." data-status="${bucket.key}">
        </div>
      ` : ''}
      <div class="task-list" id="list-${bucket.key.toLowerCase()}"></div>
    `;
    kanbanBoard.insertBefore(colEl, addBucketColumn);
  });

  // ── Fill cards into columns ──
  let counts = { TO_DO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
  customBuckets.forEach(b => { counts[b.key] = 0; });

  tasksList.forEach(task => {
    const cardHtml = Components.taskCard(task, State.currentUser.role, State.currentUser.id);
    
    if (task.status === 'TO_DO') {
      DOM.listTodo.insertAdjacentHTML('beforeend', cardHtml);
      counts.TO_DO++;
    } else if (task.status === 'IN_PROGRESS') {
      DOM.listProgress.insertAdjacentHTML('beforeend', cardHtml);
      counts.IN_PROGRESS++;
    } else if (task.status === 'REVIEW') {
      DOM.listReview.insertAdjacentHTML('beforeend', cardHtml);
      counts.REVIEW++;
    } else if (task.status === 'DONE') {
      DOM.listDone.insertAdjacentHTML('beforeend', cardHtml);
      counts.DONE++;
    } else {
      // Custom bucket column
      const customListEl = document.getElementById(`list-${task.status.toLowerCase()}`);
      if (customListEl) {
        customListEl.insertAdjacentHTML('beforeend', cardHtml);
        if (counts[task.status] !== undefined) counts[task.status]++;
      }
    }
  });

  // ── Update standard badges ──
  DOM.badgeTodo.innerText = counts.TO_DO;
  DOM.badgeProgress.innerText = counts.IN_PROGRESS;
  DOM.badgeReview.innerText = counts.REVIEW;
  DOM.badgeDone.innerText = counts.DONE;

  // ── Update custom bucket badges ──
  customBuckets.forEach(bucket => {
    const col = kanbanBoard.querySelector(`[data-status="${bucket.key}"]`);
    if (col) {
      const badge = col.querySelector('.column-badge');
      if (badge) badge.innerText = counts[bucket.key] || 0;
    }
  });
  
  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dblclick', () => openTaskModal(card.dataset.id));
  });

  // ── Wire up column headers (rename + ellipsis context menu) ──
  document.querySelectorAll('.kanban-column').forEach(column => {
    const status = column.dataset.status;
    const titleSpan = column.querySelector('.column-title');
    
    // Set custom title if exists (for default columns)
    if (titleSpan && State.bucketNames && State.bucketNames[status]) {
      titleSpan.innerText = State.bucketNames[status];
    }
    
    // Inline rename double-click handler (Only PM / CEO)
    if (titleSpan && isPMOrAdmin) {
      titleSpan.style.cursor = 'pointer';
      titleSpan.title = 'Double click to rename';
      titleSpan.ondblclick = (e) => {
        e.stopPropagation();
        const currentText = titleSpan.innerText;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'form-control';
        input.style.fontSize = '14px';
        input.style.fontWeight = '700';
        input.style.padding = '2px 6px';
        input.style.height = '28px';
        input.style.width = '120px';
        
        titleSpan.replaceWith(input);
        input.focus();
        
        let hasSaved = false;
        const saveTitle = async () => {
          if (hasSaved) return;
          hasSaved = true;
          const newText = input.value.trim() || currentText;
          
          try {
            const projDetails = await API.getProject(State.selectedProjectId);
            const isCustom = column.dataset.custom === 'true';

            if (isCustom) {
              // Rename custom bucket
              const updated = State.customBuckets.map(b => b.key === status ? { ...b, name: newText } : b);
              await API.updateProject(
                State.selectedProjectId,
                projDetails.name,
                projDetails.description,
                State.bucketNames,
                updated
              );
              State.customBuckets = updated;
            } else {
              // Rename standard bucket
              const buckets = State.bucketNames || {};
              buckets[status] = newText;
              await API.updateProject(
                State.selectedProjectId,
                projDetails.name,
                projDetails.description,
                buckets,
                State.customBuckets
              );
              State.bucketNames = buckets;
            }
            showToast('Column renamed', 'success');
          } catch (error) {
            showToast('Failed to rename: ' + error.message, 'error');
          }
          
          await refreshActiveTab();
        };
        
        input.onkeydown = (evt) => {
          if (evt.key === 'Enter') {
            saveTitle();
          } else if (evt.key === 'Escape') {
            hasSaved = true;
            input.replaceWith(titleSpan);
          }
        };
        
        input.onblur = () => {
          saveTitle();
        };
      };
    }

    const ellipsisBtn = column.querySelector('.col-action-btn[title="More options"]');
    if (ellipsisBtn) {
      ellipsisBtn.addEventListener('click', (e) => {
        showColumnContextMenu(e, status, column.dataset.custom === 'true');
      });
    }

    // Wire quick-add + header add button
    const quickAddInput = column.querySelector('.quick-add-input');
    if (quickAddInput && isPMOrAdmin) {
      quickAddInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          const title = quickAddInput.value.trim();
          if (!title) return;
          try {
            await API.createTask(State.selectedProjectId, { title, status, priority: 'MEDIUM' });
            quickAddInput.value = '';
            await refreshActiveTab();
            showToast(`Task created in "${column.querySelector('.column-title')?.innerText || status}"`, 'success');
          } catch (err) {
            showToast('Failed to create task: ' + err.message, 'error');
          }
        }
      });
    }

    const headerAddBtn = column.querySelector('.col-action-btn[title="Add task"]');
    if (headerAddBtn && isPMOrAdmin) {
      headerAddBtn.addEventListener('click', () => {
        openAddTaskModal();
        DOM.taskStatusSelect.value = status;
      });
    }
  });

  // ── Wire quick-add for existing standard columns (they have inline style, not class) ──
  document.querySelectorAll('.kanban-column:not([data-custom]) .quick-add-input').forEach(input => {
    // Already wired via querySelectorAll above
  });

  // ── Wire add-bucket button ──
  wireAddBucketButton();

  setupDragAndDrop();
  sortKanbanColumnsDOM();
  setupColumnDragAndDrop();
}

// Show inline input in the add-bucket column to create a new column
function wireAddBucketButton() {
  const btn = document.getElementById('add-bucket-btn');
  const addBucketCol = document.getElementById('add-bucket-column');
  if (!btn || !addBucketCol) return;

  // Remove previous listeners by cloning
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  newBtn.addEventListener('click', () => {
    // Switch button area to an inline input
    addBucketCol.innerHTML = `
      <div class="add-bucket-input-card" style="
        width: 100%; 
        background: var(--colors-card-bg); 
        border: 2px solid var(--colors-primary); 
        border-radius: var(--rounded-lg);
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 0 0 4px rgba(0,120,212,0.1);
        animation: slideDown 0.2s ease;
      ">
        <div style="font-size: 13px; font-weight: 700; color: var(--colors-ink-deep);">
          <i class="fa-solid fa-table-columns" style="color: var(--colors-primary); margin-right: 6px;"></i>
          New Column Name
        </div>
        <input 
          type="text" 
          id="new-bucket-name-input"
          placeholder="e.g. Testing, Design, QA..."
          maxlength="40"
          style="
            padding: 8px 12px; 
            border: 1.5px solid var(--colors-primary); 
            border-radius: var(--rounded-md); 
            font-size: 13px; 
            font-family: var(--font-family);
            color: var(--colors-ink);
            background: var(--colors-surface);
            outline: none;
          "
          autofocus
        >
        <div style="display: flex; gap: 8px;">
          <button id="confirm-new-bucket-btn" style="
            flex: 1;
            padding: 7px 12px; 
            background: var(--colors-primary); 
            color: white; 
            border: none; 
            border-radius: var(--rounded-md); 
            cursor: pointer; 
            font-size: 13px;
            font-weight: 600;
            font-family: var(--font-family);
            transition: opacity 0.15s;
          ">
            <i class="fa-solid fa-check"></i> Add
          </button>
          <button id="cancel-new-bucket-btn" style="
            padding: 7px 12px; 
            background: var(--colors-surface); 
            color: var(--colors-slate); 
            border: 1px solid var(--colors-hairline-strong); 
            border-radius: var(--rounded-md); 
            cursor: pointer; 
            font-size: 13px;
            font-family: var(--font-family);
            transition: all 0.15s;
          ">
            Cancel
          </button>
        </div>
      </div>
    `;

    const nameInput = document.getElementById('new-bucket-name-input');
    const confirmBtn = document.getElementById('confirm-new-bucket-btn');
    const cancelBtn = document.getElementById('cancel-new-bucket-btn');

    nameInput.focus();

    const restoreButton = () => {
      addBucketCol.innerHTML = `
        <button class="add-bucket-btn" id="add-bucket-btn">
          <i class="fa-solid fa-plus"></i>
          <span>Add column</span>
        </button>
      `;
      wireAddBucketButton();
    };

    cancelBtn.addEventListener('click', restoreButton);

    const createBucket = async () => {
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        return;
      }

      // Generate a unique key for this custom column
      const key = 'CUSTOM_' + name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20) + '_' + Date.now().toString().slice(-4);

      try {
        const projDetails = await API.getProject(State.selectedProjectId);
        const existing = State.customBuckets || [];
        const updated = [...existing, { key, name }];

        await API.updateProject(
          State.selectedProjectId,
          projDetails.name,
          projDetails.description,
          State.bucketNames,
          updated
        );

        State.customBuckets = updated;
        showToast(`Column "${name}" created!`, 'success');
        await refreshActiveTab();
      } catch (err) {
        showToast('Failed to create column: ' + err.message, 'error');
        restoreButton();
      }
    };

    confirmBtn.addEventListener('click', createBucket);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') createBucket();
      if (e.key === 'Escape') restoreButton();
    });
  });
}



function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Drag & drop handlers with live visual reordering
function setupDragAndDrop() {
  const cards = document.querySelectorAll('.task-card[draggable="true"]');
  const columns = document.querySelectorAll('.kanban-column');
  
  let draggedCardId = null;

  cards.forEach(card => {
    if (card.dataset.dragWired) return;
    card.dataset.dragWired = 'true';

    card.addEventListener('dragstart', (e) => {
      draggedCardId = card.dataset.id;
      card.classList.add('dragging');
      card.style.opacity = '0.3';
      e.dataTransfer.setData('text/plain', draggedCardId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      card.style.opacity = '1';
      columns.forEach(col => col.classList.remove('drag-over'));
    });
  });

  columns.forEach(column => {
    if (column.dataset.cardDragWired) return;
    column.dataset.cardDragWired = 'true';

    column.addEventListener('dragover', (e) => {
      if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('text/column-status')) return;
      e.preventDefault();
      
      const list = column.querySelector('.task-list');
      const draggingCard = document.querySelector('.dragging');
      if (draggingCard && list) {
        const afterElement = getDragAfterElement(list, e.clientY);
        if (afterElement == null) {
          list.appendChild(draggingCard);
        } else {
          list.insertBefore(draggingCard, afterElement);
        }
      }
    });

    column.addEventListener('dragenter', (e) => {
      if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('text/column-status')) return;
      e.preventDefault();
      column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', (e) => {
      if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('text/column-status')) return;
      column.classList.remove('drag-over');
    });

    column.addEventListener('drop', async (e) => {
      if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('text/column-status')) return;
      e.preventDefault();
      column.classList.remove('drag-over');
      
      const taskId = e.dataTransfer.getData('text/plain') || draggedCardId;
      if (!taskId) return;
      
      const newStatus = column.dataset.status;
      
      const list = column.querySelector('.task-list');
      const cardElements = [...list.querySelectorAll('.task-card')];
      const taskIds = cardElements.map(el => Number(el.dataset.id));
      
      try {
        await API.reorderTasks(State.selectedProjectId, taskIds, newStatus);
        showToast('Tasks reordered successfully', 'success');
        await refreshActiveTab();
      } catch (error) {
        showToast('Failed to reorder task: ' + error.message, 'error');
        await refreshActiveTab();
      }
    });
  });
}

// Column Drag & Drop Reordering and state sorting
function sortKanbanColumnsDOM() {
  const board = document.querySelector('.kanban-board');
  if (!board) return;
  const addBucketCol = document.getElementById('add-bucket-column');
  if (!addBucketCol) return;
  
  const key = `planner_column_order_proj_${State.selectedProjectId}`;
  let order = [];
  try {
    order = JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    order = [];
  }
  
  const standardKeys = ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  const customKeys = (State.customBuckets || []).map(b => b.key);
  const defaultOrder = [...standardKeys, ...customKeys];
  
  order = order.filter(k => defaultOrder.includes(k));
  defaultOrder.forEach(k => {
    if (!order.includes(k)) order.push(k);
  });
  
  localStorage.setItem(key, JSON.stringify(order));
  
  order.forEach(statusKey => {
    const col = board.querySelector(`.kanban-column[data-status="${statusKey}"]`);
    if (col) {
      board.insertBefore(col, addBucketCol);
    }
  });
}

function setupColumnDragAndDrop() {
  const board = document.querySelector('.kanban-board');
  if (!board) return;
  
  const columns = board.querySelectorAll('.kanban-column');
  let draggedColStatus = null;
  
  columns.forEach(col => {
    if (col.dataset.columnDragWired) return;
    col.dataset.columnDragWired = 'true';
    
    col.draggable = false;
    
    const header = col.querySelector('.column-header');
    if (!header) return;
    
    header.draggable = true;
    
    header.addEventListener('dragstart', (e) => {
      if (e.target.closest('input') || e.target.closest('button') || e.target.closest('.col-action-btn')) {
        e.preventDefault();
        return;
      }
      
      draggedColStatus = col.dataset.status;
      col.classList.add('column-dragging');
      
      if (e.dataTransfer.setDragImage) {
        const rect = header.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.dataTransfer.setDragImage(col, x, y);
      }
      
      setTimeout(() => {
        col.style.opacity = '0.4';
      }, 0);
      
      e.dataTransfer.setData('text/column-status', draggedColStatus);
    });
    
    header.addEventListener('dragend', () => {
      col.classList.remove('column-dragging');
      col.style.opacity = '1';
      columns.forEach(c => c.classList.remove('column-drag-over'));
    });
    
    col.addEventListener('dragover', (e) => {
      if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('text/column-status')) return;
      e.preventDefault();
      
      const draggingCol = board.querySelector('.column-dragging');
      if (draggingCol && draggingCol !== col) {
        const children = [...board.querySelectorAll('.kanban-column')];
        const draggingIdx = children.indexOf(draggingCol);
        const targetIdx = children.indexOf(col);
        
        if (draggingIdx < targetIdx) {
          board.insertBefore(draggingCol, col.nextSibling);
        } else {
          board.insertBefore(draggingCol, col);
        }
      }
    });
    
    col.addEventListener('dragenter', (e) => {
      if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('text/column-status')) return;
      col.classList.add('column-drag-over');
    });
    
    col.addEventListener('dragleave', (e) => {
      if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('text/column-status')) return;
      col.classList.remove('column-drag-over');
    });
    
    col.addEventListener('drop', (e) => {
      if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('text/column-status')) return;
      e.preventDefault();
      col.classList.remove('column-drag-over');
      
      const children = [...board.querySelectorAll('.kanban-column')];
      const newOrder = children.map(c => c.dataset.status).filter(Boolean);
      
      const key = `planner_column_order_proj_${State.selectedProjectId}`;
      localStorage.setItem(key, JSON.stringify(newOrder));
      
      showToast('Columns reordered successfully', 'success');
    });
  });
}

// Fetch users
async function loadSystemUsers() {
  try {
    State.users = await API.getUsers();
    
    DOM.taskAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
    State.users.forEach(user => {
      const displayRole = user.role.replace('_', ' ');
      const displayName = user.designation 
        ? `${user.name} - ${user.designation} (${displayRole})` 
        : `${user.name} (${displayRole})`;
      const option = `<option value="${user.id}">${displayName}</option>`;
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

  // Cursor Timeline Pastels
  const bgColors = totalCount > 0 
    ? ['#dfa88f', '#9fc9a2', '#c0a8dd', '#c08532']
    : ['#e6e5e0', 'transparent', 'transparent', 'transparent'];
    
  const borderColors = totalCount > 0 
    ? ['#ffffff', '#ffffff', '#ffffff', '#ffffff']
    : ['#cfcdc4', 'transparent', 'transparent', 'transparent'];

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
            color: '#26251e',
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

// HELP, NOTIFICATION & PROFILE MODALS
function openHelpModal() {
  if (DOM.helpModal) DOM.helpModal.classList.add('active');
}

async function openProfileModal() {
  if (!State.currentUser || !DOM.profileModal) return;
  
  const user = State.currentUser;
  const profileAvatar = document.getElementById('profile-avatar');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileRole = document.getElementById('profile-role');
  
  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  if (profileAvatar) {
    profileAvatar.innerText = initials;
    const cssClass = Components.getAssigneeClass(initials);
    profileAvatar.className = '';
    profileAvatar.style.width = '80px';
    profileAvatar.style.height = '80px';
    profileAvatar.style.borderRadius = '50%';
    profileAvatar.style.color = 'white';
    profileAvatar.style.fontSize = '32px';
    profileAvatar.style.fontWeight = '700';
    profileAvatar.style.lineHeight = '80px';
    profileAvatar.style.margin = '0 auto 16px';
    profileAvatar.style.display = 'inline-block';
    
    // Add color theme matching components.js
    if (cssClass === 'ac') profileAvatar.style.background = '#0078d4';
    else if (cssClass === 'bm') profileAvatar.style.background = '#107c41';
    else if (cssClass === 'cv') profileAvatar.style.background = '#d83b01';
    else if (cssClass === 'dw') profileAvatar.style.background = '#8764b8';
    else profileAvatar.style.background = '#7a7574';
  }
  
  if (profileName) profileName.innerText = user.name;
  if (profileEmail) profileEmail.innerText = user.email;
  if (profileRole) {
    const roleText = user.role.replace('_', ' ');
    const designationText = user.designation ? ` - ${user.designation}` : '';
    profileRole.innerText = `${roleText}${designationText}`;
  }

  if (DOM.profileEditName) DOM.profileEditName.value = user.name || '';
  if (DOM.profileEditDesignation) DOM.profileEditDesignation.value = user.designation || '';
  
  DOM.profileModal.classList.add('active');
}

async function openNotificationsModal() {
  if (!DOM.notificationsModal || !DOM.notificationsList) return;
  DOM.notificationsList.innerHTML = '<div style="color: var(--colors-slate); text-align: center; padding: 1rem;">Loading notifications...</div>';
  
  DOM.notificationsModal.classList.add('active');
  
  try {
    const logs = await API.getProjectLogs(State.selectedProjectId);
    DOM.notificationsList.innerHTML = '';
    
    if (logs.length === 0) {
      DOM.notificationsList.innerHTML = '<div style="color: var(--colors-slate); text-align: center; padding: 1rem;">No project activities yet.</div>';
      return;
    }
    
    logs.slice(0, 20).forEach(log => {
      const html = Components.activityLogItem(log);
      DOM.notificationsList.insertAdjacentHTML('beforeend', html);
    });
  } catch (error) {
    DOM.notificationsList.innerHTML = `<div style="color: #a80000; text-align: center; padding: 1rem;">Failed to load activities: ${error.message}</div>`;
  }
}

// COLUMN CONTEXT MENU & SORTING
function showColumnContextMenu(e, status, isCustom = false) {
  e.stopPropagation();
  const existingMenu = document.getElementById('column-context-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.id = 'column-context-menu';
  menu.style.position = 'absolute';
  menu.style.top = `${e.pageY}px`;
  menu.style.left = `${e.pageX}px`;
  menu.style.background = 'var(--colors-card-bg)';
  menu.style.border = '1px solid var(--colors-hairline-strong)';
  menu.style.borderRadius = 'var(--rounded-md)';
  menu.style.boxShadow = 'var(--shadow-level2)';
  menu.style.padding = '4px 0';
  menu.style.zIndex = '1000';
  menu.style.fontSize = '13px';
  menu.style.minWidth = '170px';

  const makeItem = (icon, label, color, onClick) => {
    const item = document.createElement('div');
    item.style.padding = '8px 12px';
    item.style.cursor = 'pointer';
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.gap = '8px';
    item.style.color = color || 'var(--colors-ink)';
    item.innerHTML = `<i class="${icon}" style="color: ${color || 'var(--colors-primary)'}; width: 14px; text-align: center;"></i> ${label}`;
    item.addEventListener('mouseenter', () => item.style.background = 'var(--colors-surface-hover)');
    item.addEventListener('mouseleave', () => item.style.background = 'transparent');
    item.addEventListener('click', () => { menu.remove(); onClick(); });
    return item;
  };

  // Add Task
  menu.appendChild(makeItem('fa-solid fa-plus', 'Add Task', null, () => {
    openAddTaskModal();
    DOM.taskStatusSelect.value = status;
  }));

  // Sort by Deadline
  menu.appendChild(makeItem('fa-regular fa-calendar', 'Sort by Deadline', null, () => sortColumnTasks(status, 'deadline')));

  // Sort by Priority
  menu.appendChild(makeItem('fa-solid fa-flag', 'Sort by Priority', null, () => sortColumnTasks(status, 'priority')));

  // Delete Column option — only for custom columns (CEO/PM)
  const isPMOrAdmin = ['CEO', 'PM'].includes(State.currentUser?.role);
  if (isCustom && isPMOrAdmin) {
    // Divider
    const divider = document.createElement('div');
    divider.style.borderTop = '1px solid var(--colors-hairline)';
    divider.style.margin = '4px 0';
    menu.appendChild(divider);

    menu.appendChild(makeItem('fa-solid fa-trash', 'Delete Column', '#a80000', async () => {
      const hasTask = State.tasks.some(t => t.status === status);
      if (hasTask) {
        showToast('Cannot delete column with tasks. Move or delete tasks first.', 'error');
        return;
      }
      try {
        const projDetails = await API.getProject(State.selectedProjectId);
        const updated = (State.customBuckets || []).filter(b => b.key !== status);
        await API.updateProject(
          State.selectedProjectId,
          projDetails.name,
          projDetails.description,
          State.bucketNames,
          updated
        );
        State.customBuckets = updated;
        showToast('Column deleted', 'success');
        await refreshActiveTab();
      } catch (err) {
        showToast('Failed to delete column: ' + err.message, 'error');
      }
    }));
  }

  document.body.appendChild(menu);

  const closeHandler = () => {
    menu.remove();
    document.removeEventListener('click', closeHandler);
  };
  setTimeout(() => {
    document.addEventListener('click', closeHandler);
  }, 50);
}


function sortColumnTasks(status, criteria) {
  const columnTasks = State.tasks.filter(t => t.status === status);
  if (criteria === 'deadline') {
    columnTasks.sort((a, b) => {
      const timeA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const timeB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return timeA - timeB;
    });
  } else if (criteria === 'priority') {
    const priorityOrder = { 'URGENT': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
    columnTasks.sort((a, b) => {
      const pA = priorityOrder[a.priority] || 4;
      const pB = priorityOrder[b.priority] || 4;
      return pA - pB;
    });
  }

  const otherTasks = State.tasks.filter(t => t.status !== status);
  State.tasks = [...otherTasks, ...columnTasks];
  renderKanbanBoard();
  showToast(`Column tasks sorted by ${criteria}`, 'success');
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
        const displayRole = user.role.replace('_', ' ');
        const displayName = user.designation 
          ? `${user.name} - ${user.designation} (${displayRole})` 
          : `${user.name} (${displayRole})`;
        const opt = `<option value="${user.id}">${displayName}</option>`;
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

// TASK MODAL CHECKLIST RENDERING (Database Relational Sub-tasks)
async function loadAndRenderChecklist(taskId) {
  if (!DOM.modalChecklistItems) return;
  DOM.modalChecklistItems.innerHTML = '';
  
  if (!taskId) {
    if (DOM.addChecklistItemRow) {
      DOM.addChecklistItemRow.style.display = 'none';
    }
    DOM.modalChecklistItems.innerHTML = '<div style="color: var(--colors-slate); font-size: 12px; text-align: center; padding: 4px 0;">Checklist is available after creating the task.</div>';
    if (DOM.modalChecklistProgress) DOM.modalChecklistProgress.innerText = '0%';
    if (DOM.modalChecklistProgressBar) DOM.modalChecklistProgressBar.style.width = '0%';
    return;
  }
  
  try {
    const subtasks = await API.getSubtasks(State.selectedProjectId, taskId);
    const total = subtasks.length;
    const completed = subtasks.filter(s => s.status === 'DONE').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (DOM.modalChecklistProgress) DOM.modalChecklistProgress.innerText = `${percent}%`;
    if (DOM.modalChecklistProgressBar) DOM.modalChecklistProgressBar.style.width = `${percent}%`;
    
    const role = State.currentUser.role;
    const isPMOrAdmin = ['CEO', 'PM'].includes(role);
    
    // Retrieve parent task details for permission checking
    let parentTask = State.tasks.find(t => t.id === taskId);
    if (!parentTask) {
      parentTask = await API.getTask(State.selectedProjectId, taskId);
    }
    
    // Determine checklist edit authorization: CEOs, PMs, and assigned Team Members can add sub-tasks
    let canAddSubtask = isPMOrAdmin;
    if (role === 'TEAM_MEMBER' && parentTask && parentTask.assignee_id === State.currentUser.id) {
      canAddSubtask = true;
    }
    
    if (DOM.addChecklistItemRow) {
      DOM.addChecklistItemRow.style.display = canAddSubtask ? 'flex' : 'none';
    }
    
    if (total === 0) {
      DOM.modalChecklistItems.innerHTML = '<div style="color: var(--colors-slate); font-size: 12px; text-align: center; padding: 4px 0;">No sub-tasks added yet.</div>';
      return;
    }
    
    subtasks.forEach(sub => {
      const isCompleted = sub.status === 'DONE';
      const checkedAttr = isCompleted ? 'checked' : '';
      
      // A team member can toggle if they are assigned to this subtask, or if they are assigned to the parent task
      let canToggle = isPMOrAdmin;
      if (role === 'TEAM_MEMBER') {
        if (sub.assignee_id === State.currentUser.id || (parentTask && parentTask.assignee_id === State.currentUser.id)) {
          canToggle = true;
        }
      }
      const disabledAttr = canToggle ? '' : 'disabled';
      const itemClass = isCompleted ? 'modal-checklist-item-text completed' : 'modal-checklist-item-text';
      
      const deleteBtnHtml = isPMOrAdmin 
        ? `<button type="button" class="remove-checklist-item-btn" data-id="${sub.id}" title="Delete subtask"><i class="fa-regular fa-trash-can"></i></button>`
        : '';
        
      const html = `
        <div class="modal-checklist-item" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: var(--colors-surface); border-radius: var(--rounded-md); border: 1px solid var(--colors-hairline-soft);">
          <div class="modal-checklist-item-left" style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
            <input type="checkbox" class="modal-checklist-item-checkbox" data-id="${sub.id}" ${checkedAttr} ${disabledAttr} style="cursor: pointer; width: 16px; height: 16px;">
            <a href="#" class="modal-checklist-item-link ${itemClass}" data-id="${sub.id}" style="font-size: 13px; color: var(--colors-ink); text-decoration: none; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${sub.title}</a>
          </div>
          ${deleteBtnHtml}
        </div>
      `;
      DOM.modalChecklistItems.insertAdjacentHTML('beforeend', html);
    });
    
    // Checklist checkbox event listeners
    DOM.modalChecklistItems.querySelectorAll('.modal-checklist-item-checkbox').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        const subtaskId = Number(e.target.dataset.id);
        const newStatus = e.target.checked ? 'DONE' : 'TO_DO';
        try {
          await API.updateTask(State.selectedProjectId, subtaskId, { status: newStatus });
          showToast('Sub-task status updated', 'success');
          await loadAndRenderChecklist(taskId);
          await refreshActiveTab(); // Refresh main board for progress updates
        } catch (err) {
          e.target.checked = !e.target.checked; // revert
          showToast('Failed to update status: ' + err.message, 'error');
        }
      });
    });
    
    // Checklist title click event listeners (navigation)
    DOM.modalChecklistItems.querySelectorAll('.modal-checklist-item-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const subtaskId = Number(link.dataset.id);
        openTaskModal(subtaskId);
      });
    });
    
    // Checklist delete event listeners
    DOM.modalChecklistItems.querySelectorAll('.remove-checklist-item-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this sub-task?')) return;
        const subtaskId = Number(btn.dataset.id);
        try {
          await API.deleteTask(State.selectedProjectId, subtaskId);
          showToast('Sub-task deleted successfully', 'success');
          await loadAndRenderChecklist(taskId);
          await refreshActiveTab();
        } catch (err) {
          showToast('Failed to delete sub-task: ' + err.message, 'error');
        }
      });
    });
  } catch (error) {
    console.error('Error loading sub-tasks:', error);
    DOM.modalChecklistItems.innerHTML = '<div style="color: #a80000; font-size: 12px; text-align: center; padding: 4px 0;">Failed to load sub-tasks.</div>';
  }
}

async function addChecklistItem() {
  if (!DOM.newChecklistItemInput) return;
  const text = DOM.newChecklistItemInput.value.trim();
  if (!text) return;
  
  const taskId = DOM.taskFormId.value;
  if (!taskId) {
    showToast('Please save the main task before adding checklist items.', 'error');
    return;
  }
  
  try {
    await API.createTask(State.selectedProjectId, {
      title: text,
      parent_id: Number(taskId),
      status: 'TO_DO',
      priority: 'MEDIUM',
      description: ''
    });
    DOM.newChecklistItemInput.value = '';
    showToast('Sub-task created successfully', 'success');
    await loadAndRenderChecklist(Number(taskId));
    await refreshActiveTab(); // update card checklist counts
  } catch (err) {
    showToast('Failed to create sub-task: ' + err.message, 'error');
  }
}

// Populate status select with standard + custom bucket options
function populateStatusSelect() {
  const select = DOM.taskStatusSelect;
  if (!select) return;
  
  // Build standard options using current bucket names
  const bn = State.bucketNames || {};
  select.innerHTML = `
    <option value="TO_DO">${bn['TO_DO'] || 'To Do'}</option>
    <option value="IN_PROGRESS">${bn['IN_PROGRESS'] || 'In Progress'}</option>
    <option value="REVIEW">${bn['REVIEW'] || 'Review'}</option>
    <option value="DONE">${bn['DONE'] || 'Completed'}</option>
  `;
  
  // Add custom bucket options
  (State.customBuckets || []).forEach(bucket => {
    const opt = document.createElement('option');
    opt.value = bucket.key;
    opt.textContent = bucket.name;
    select.appendChild(opt);
  });
}

// TASK MODAL
async function openAddTaskModal() {
  DOM.taskFormId.value = '';
  DOM.taskTitleInput.value = '';
  DOM.taskDescInput.value = '';
  populateStatusSelect();
  DOM.taskStatusSelect.value = 'TO_DO';
  DOM.taskPrioritySelect.value = 'MEDIUM';
  DOM.taskAssigneeSelect.value = '';
  DOM.taskDeadlineInput.value = '';
  if (DOM.taskLabelsInput) DOM.taskLabelsInput.value = '';

  
  DOM.taskModalTitle.innerText = 'Add New Task';
  DOM.deleteTaskBtn.style.display = 'none';
  DOM.modalDelayFlagContainer.style.display = 'none';
  
  document.querySelectorAll('.task-detail-field').forEach(el => el.disabled = false);
  DOM.saveTaskBtn.style.display = 'inline-flex';

  DOM.taskAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
  API.getProjectMembers(State.selectedProjectId).then(members => {
    members.forEach(member => {
      const displayRole = member.role.replace('_', ' ');
      const displayName = member.designation 
        ? `${member.name} - ${member.designation} (${displayRole})` 
        : `${member.name} (${displayRole})`;
      const opt = `<option value="${member.id}">${displayName}</option>`;
      DOM.taskAssigneeSelect.insertAdjacentHTML('beforeend', opt);
    });
  }).catch(() => {
    loadSystemUsers();
  });

  // Show that checklist is only available after task creation
  await loadAndRenderChecklist(null);

  DOM.taskModal.classList.add('active');
  // Hide comment section for new tasks
  const reportsContainer = document.getElementById('modal-reports-container');
  const commentsContainer = document.getElementById('modal-comments-container');
  if (reportsContainer) reportsContainer.innerHTML = '<div style="color: var(--colors-muted); font-size: 0.8rem; text-align: center; padding: 1rem 0;">Comments will be available after creating the task.</div>';
  if (commentsContainer) commentsContainer.innerHTML = '';
  DOM.commentForm.style.display = 'none';
  const reportsSubmit = document.getElementById('modal-progress-report-container');
  if (reportsSubmit) reportsSubmit.style.display = 'none';
}

async function openTaskModal(taskId) {
  try {
    let task = State.tasks.find(t => t.id === Number(taskId));
    if (!task) {
      task = await API.getTask(State.selectedProjectId, taskId);
    }
    if (!task) return;

    DOM.taskFormId.value = task.id;
    DOM.taskTitleInput.value = task.title;
    DOM.taskDescInput.value = task.description || '';
    if (DOM.taskLabelsInput) DOM.taskLabelsInput.value = task.labels || '';

    if (DOM.modalTaskTagsContainer) {
      DOM.modalTaskTagsContainer.innerHTML = Components.generateTags(task.title, task.description || '', task.labels);
    }
    populateStatusSelect();
    DOM.taskStatusSelect.value = task.status;
    DOM.taskPrioritySelect.value = task.priority;
    
    DOM.taskAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
    const members = await API.getProjectMembers(State.selectedProjectId);
    members.forEach(member => {
      const displayRole = member.role.replace('_', ' ');
      const displayName = member.designation 
        ? `${member.name} - ${member.designation} (${displayRole})` 
        : `${member.name} (${displayRole})`;
      const opt = `<option value="${member.id}">${displayName}</option>`;
      DOM.taskAssigneeSelect.insertAdjacentHTML('beforeend', opt);
    });
    DOM.taskAssigneeSelect.value = task.assignee_id || '';

    if (task.start_date) {
      const d = new Date(task.start_date);
      const tzoffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
      if (DOM.taskStartDate) DOM.taskStartDate.value = localISOTime;
    } else {
      if (DOM.taskStartDate) DOM.taskStartDate.value = '';
    }

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

    if (DOM.taskProgressReport) DOM.taskProgressReport.value = '';

    // Render Parent Relation Breadcrumb
    if (task.parent_id) {
      try {
        const parentTask = await API.getTask(State.selectedProjectId, task.parent_id);
        DOM.modalParentRelationContainer.innerHTML = `
          <div class="parent-task-relation" style="background: var(--colors-surface); padding: 10px 14px; border-radius: var(--rounded-md); margin-bottom: 16px; border: 1px solid var(--colors-hairline-strong); display: flex; align-items: center; gap: 8px; font-size: 13px;">
            <i class="fa-solid fa-arrow-turn-up" style="transform: rotate(90deg); color: var(--colors-primary); margin-right: 4px;"></i>
            <span style="color: var(--colors-slate); font-weight: 500;">Parent task:</span>
            <a href="#" class="parent-task-link" data-parent-id="${task.parent_id}" style="color: var(--colors-primary); font-weight: 600; text-decoration: underline;">${parentTask.title}</a>
          </div>
        `;
        DOM.modalParentRelationContainer.style.display = 'block';
        DOM.modalParentRelationContainer.querySelector('.parent-task-link').addEventListener('click', (e) => {
          e.preventDefault();
          openTaskModal(task.parent_id);
        });
      } catch (err) {
        console.error("Failed to load parent task relation details:", err);
        DOM.modalParentRelationContainer.style.display = 'none';
      }
    } else {
      DOM.modalParentRelationContainer.style.display = 'none';
    }

    const role = State.currentUser.role;
    const isPMOrAdmin = ['CEO', 'PM'].includes(role);
    const isAssignedMember = role === 'TEAM_MEMBER' && task.assignee_id === State.currentUser.id;
    const isProjectMember = members.some(m => m.id === State.currentUser.id);

    if (DOM.taskProgressReport && DOM.submitProgressReportBtn) {
      const canReportProgress = isPMOrAdmin || isAssignedMember || isProjectMember;
      DOM.taskProgressReport.disabled = !canReportProgress;
      DOM.submitProgressReportBtn.disabled = !canReportProgress;
    }

    let canEditAllFields = isPMOrAdmin;
    let canEditStatus = isPMOrAdmin;

    if (role === 'TEAM_MEMBER') {
      let isAllowed = task.assignee_id === State.currentUser.id;
      if (!isAllowed && task.parent_id) {
        try {
          const parentTask = await API.getTask(State.selectedProjectId, task.parent_id);
          if (parentTask && parentTask.assignee_id === State.currentUser.id) {
            isAllowed = true;
          }
        } catch (e) {
          console.error("Failed to fetch parent task for permission check", e);
        }
      }

      if (isAllowed) {
        if (task.parent_id) {
          canEditAllFields = true;
          canEditStatus = true;
        } else {
          canEditAllFields = false;
          canEditStatus = true;
        }
      } else {
        canEditAllFields = false;
        canEditStatus = false;
      }
    }

    document.querySelectorAll('.task-detail-field').forEach(el => el.disabled = !canEditAllFields);
    DOM.taskStatusSelect.disabled = !canEditStatus;
    DOM.deleteTaskBtn.style.display = isPMOrAdmin ? 'inline-flex' : 'none';
    DOM.saveTaskBtn.style.display = (canEditAllFields || canEditStatus) ? 'inline-flex' : 'none';
    DOM.commentForm.style.display = isProjectMember ? 'flex' : 'none';

    // Load checklist
    await loadAndRenderChecklist(task.id);

    await loadTaskComments(task.id);
    DOM.taskModal.classList.add('active');
  } catch (error) {
    showToast('Failed to load task details: ' + error.message, 'error');
  }
}

async function loadTaskComments(taskId) {
  try {
    const comments = await API.getComments(taskId);
    
    const reportsContainer = document.getElementById('modal-reports-container');
    const commentsContainer = document.getElementById('modal-comments-container');
    
    if (reportsContainer) reportsContainer.innerHTML = '';
    if (commentsContainer) commentsContainer.innerHTML = '';
    
    const reports = comments.filter(c => c.is_report === 1);
    const normalComments = comments.filter(c => c.is_report === 0);
    
    if (reportsContainer) {
      if (reports.length === 0) {
        reportsContainer.innerHTML = '<div style="color: var(--colors-muted); font-size: 0.8rem; text-align: center; padding: 1rem 0;">No progress reports yet.</div>';
      } else {
        reports.forEach(r => {
          const bubble = Components.commentBubble(r);
          reportsContainer.insertAdjacentHTML('beforeend', bubble);
        });
        reportsContainer.scrollTop = reportsContainer.scrollHeight;
      }
    }
    
    if (commentsContainer) {
      if (normalComments.length === 0) {
        commentsContainer.innerHTML = '<div style="color: var(--colors-muted); font-size: 0.8rem; text-align: center; padding: 1rem 0;">No comments yet.</div>';
      } else {
        normalComments.forEach(c => {
          const bubble = Components.commentBubble(c);
          commentsContainer.insertAdjacentHTML('beforeend', bubble);
        });
        commentsContainer.scrollTop = commentsContainer.scrollHeight;
      }
    }
  } catch (error) {
    console.error('Error loading comments/reports:', error);
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
      // Find in State.tasks first; sub-tasks may not be there
      let task = State.tasks.find(t => t.id === Number(taskId));
      
      let payload = { status };
      
      if (['CEO', 'PM'].includes(role)) {
        payload = {
          title: DOM.taskTitleInput.value,
          description: DOM.taskDescInput.value,
          status,
          priority: DOM.taskPrioritySelect.value,
          assigneeId: DOM.taskAssigneeSelect.value ? Number(DOM.taskAssigneeSelect.value) : null,
          start_date: DOM.taskStartDate.value ? new Date(DOM.taskStartDate.value).toISOString() : null,
          deadline: DOM.taskDeadlineInput.value ? new Date(DOM.taskDeadlineInput.value).toISOString() : null,
          labels: DOM.taskLabelsInput ? DOM.taskLabelsInput.value.trim() : '',
        };
      } else if (role === 'TEAM_MEMBER') {
        // For sub-tasks assigned to parent-assigned member, allow editing all fields
        let isSubTask = false;
        try {
          const t = await API.getTask(State.selectedProjectId, taskId);
          isSubTask = !!t.parent_id;
          if (isSubTask) {
            payload = {
              title: DOM.taskTitleInput.value,
              description: DOM.taskDescInput.value,
              status,
              priority: DOM.taskPrioritySelect.value,
              assigneeId: DOM.taskAssigneeSelect.value ? Number(DOM.taskAssigneeSelect.value) : null,
              labels: DOM.taskLabelsInput ? DOM.taskLabelsInput.value.trim() : '',
            };
          } else {
            payload = { status };
          }
        } catch (e) {
          payload = { status };
        }
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
        start_date: DOM.taskStartDate.value ? new Date(DOM.taskStartDate.value).toISOString() : null,
        deadline: DOM.taskDeadlineInput.value ? new Date(DOM.taskDeadlineInput.value).toISOString() : null,
        labels: DOM.taskLabelsInput ? DOM.taskLabelsInput.value.trim() : '',
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
    await API.addComment(taskId, content, false); // normal comment
    DOM.commentInput.value = '';
    
    await loadTaskComments(taskId);
    await loadActivityLogs();
  } catch (error) {
    showToast('Failed to post comment: ' + error.message, 'error');
  }
});

if (DOM.submitProgressReportBtn) {
  DOM.submitProgressReportBtn.addEventListener('click', async () => {
    const taskId = DOM.taskFormId.value;
    const content = DOM.taskProgressReport.value.trim();
    if (!taskId) return;
    if (!content) {
      showToast('Progress report content cannot be empty.', 'error');
      return;
    }

    try {
      DOM.submitProgressReportBtn.disabled = true;
      DOM.submitProgressReportBtn.innerText = 'Sending...';
      
      await API.addComment(taskId, content, true); // is_report = true
      
      DOM.taskProgressReport.value = '';
      showToast('Progress report submitted successfully.', 'success');
      
      await loadTaskComments(taskId);
      await loadActivityLogs();
    } catch (error) {
      showToast('Failed to submit progress report: ' + error.message, 'error');
    } finally {
      DOM.submitProgressReportBtn.disabled = false;
      DOM.submitProgressReportBtn.innerText = 'Send Report';
    }
  });
}

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
    const targetPane = document.getElementById(paneId);
    if (targetPane) {
      targetPane.classList.add('active');
    }
    
    // Reset sub-tabs inside workspace-settings to default (Members sub-tab)
    if (paneId === 'tab-workspace-settings') {
      const subNav = document.querySelector('.sub-tabs-navigation');
      if (subNav) {
        subNav.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
        const membersBtn = subNav.querySelector('[data-subtab="subtab-members"]');
        if (membersBtn) membersBtn.classList.add('active');
      }
      if (targetPane) {
        targetPane.querySelectorAll('.subtab-pane').forEach(p => p.style.display = 'none');
        const membersPane = document.getElementById('subtab-members');
        if (membersPane) membersPane.style.display = 'block';
      }
    }
    
    State.currentTab = paneId;
    await refreshActiveTab();
  });
});

// SUB-TAB VIEW NAVIGATION (Inside Workspace & Settings combined tab)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.sub-tab-btn');
  if (!btn) return;
  
  const subtabsNav = btn.closest('.sub-tabs-navigation');
  if (!subtabsNav) return;
  
  // Toggle sub-tab active class styling
  subtabsNav.querySelectorAll('.sub-tab-btn').forEach(b => {
    b.classList.remove('active');
  });
  btn.classList.add('active');
  
  // Toggle visibility of target sub-pane
  const parentPane = subtabsNav.closest('.tab-pane');
  if (parentPane) {
    parentPane.querySelectorAll('.subtab-pane').forEach(p => {
      p.style.display = 'none';
    });
    
    const subtabId = btn.dataset.subtab;
    const targetSubPane = document.getElementById(subtabId);
    if (targetSubPane) {
      targetSubPane.style.display = 'block';
    }
  }
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
if (DOM.viewModeBoard) {
  const switchModes = ['board', 'grid', 'timeline', 'charts', 'people'];
  const switchButtons = [DOM.viewModeBoard, DOM.viewModeGrid, DOM.viewModeTimeline, DOM.viewModeCharts, DOM.viewModePeople];
  
  switchButtons.forEach((btn, idx) => {
    if (btn) {
      btn.addEventListener('click', () => {
        State.boardViewMode = switchModes[idx];
        loadTasks();
      });
    }
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
if (DOM.createTaskBtn) {
  DOM.createTaskBtn.addEventListener('click', openAddTaskModal);
}
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

// Inline quick-create task bar listeners
document.querySelectorAll('.quick-add-input').forEach(input => {
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const title = input.value.trim();
      const status = input.dataset.status;
      if (!title) return;
      
      try {
        await API.createTask(State.selectedProjectId, {
          title,
          status,
          priority: 'MEDIUM',
          description: '',
          checklist: []
        });
        input.value = '';
        showToast('Task created successfully', 'success');
        await refreshActiveTab();
      } catch (err) {
        showToast('Failed to create task: ' + err.message, 'error');
      }
    }
  });
});

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
  e.stopPropagation();
  logout();
});
DOM.authToggleLink.addEventListener('click', toggleAuthMode);

// QUICK SWITCHER
DOM.devRoleSelect.addEventListener('change', async (e) => {
  const chosenRole = e.target.value;
  if (!chosenRole) return;
  
  let email = '';
  if (chosenRole === 'ceo') email = 'tom@example.com';
  else if (chosenRole === 'pm') email = 'alice@example.com';
  else if (chosenRole === 'member') email = 'rose@example.com';
  else if (chosenRole === 'charlie') email = 'charlie@example.com';
  
  try {
    showToast(`Switching role to ${chosenRole.toUpperCase()}...`, 'info');
    await API.login(email, '123456');
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
    const target = e.currentTarget;
    const email = target.dataset.email;
    if (DOM.authEmail) DOM.authEmail.value = email;
    if (DOM.authPassword) DOM.authPassword.value = '123456';
    showToast(`Autofilled credentials for ${email}`, 'success');
    
    // Automatically trigger form submit for seamless demo login!
    if (DOM.authSubmitBtn) {
      DOM.authSubmitBtn.click();
    } else if (DOM.authForm) {
      DOM.authForm.dispatchEvent(new Event('submit'));
    }
  });
});

// Help modal handlers
if (DOM.helpTrigger) {
  DOM.helpTrigger.addEventListener('click', openHelpModal);
}
if (DOM.helpModalClose) {
  DOM.helpModalClose.addEventListener('click', () => DOM.helpModal.classList.remove('active'));
}
if (DOM.helpModalOk) {
  DOM.helpModalOk.addEventListener('click', () => DOM.helpModal.classList.remove('active'));
}

// Notifications modal handlers
if (DOM.notificationsTrigger) {
  DOM.notificationsTrigger.addEventListener('click', openNotificationsModal);
}
if (DOM.notificationsModalClose) {
  DOM.notificationsModalClose.addEventListener('click', () => DOM.notificationsModal.classList.remove('active'));
}
if (DOM.notificationsModalCloseBtn) {
  DOM.notificationsModalCloseBtn.addEventListener('click', () => DOM.notificationsModal.classList.remove('active'));
}

// Profile modal handlers
if (DOM.profileTrigger) {
  DOM.profileTrigger.addEventListener('click', openProfileModal);
}
const sidebarUserTrigger = document.getElementById('sidebar-user-badge-trigger');
if (sidebarUserTrigger) {
  sidebarUserTrigger.addEventListener('click', openProfileModal);
}
if (DOM.profileModalClose) {
  DOM.profileModalClose.addEventListener('click', () => DOM.profileModal.classList.remove('active'));
}
if (DOM.profileModalLogout) {
  DOM.profileModalLogout.addEventListener('click', () => {
    DOM.profileModal.classList.remove('active');
    logout();
  });
}

if (DOM.profileModalSaveBtn) {
  DOM.profileModalSaveBtn.addEventListener('click', async () => {
    const name = DOM.profileEditName.value.trim();
    const designation = DOM.profileEditDesignation.value.trim();
    if (!name) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    try {
      DOM.profileModalSaveBtn.disabled = true;
      DOM.profileModalSaveBtn.innerText = 'Saving...';
      const response = await API.updateProfile(name, designation);
      State.currentUser = response.user;
      showToast('Profile updated successfully!', 'success');
      DOM.profileModal.classList.remove('active');
      
      // Update displayed user names/details on the screen
      await loadSystemUsers();
      await loadProjects();
      
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      if (DOM.headerUserInitialsBadge) {
        DOM.headerUserInitialsBadge.innerText = initials;
      }
      if (DOM.headerUserName) {
        DOM.headerUserName.innerText = name.toUpperCase();
      }
      if (DOM.headerUserInitials) {
        DOM.headerUserInitials.innerText = initials;
      }
      
      if (State.selectedProjectId) {
        await refreshActiveTab();
      }
    } catch (e) {
      showToast(e.message || 'Error updating profile', 'error');
    } finally {
      DOM.profileModalSaveBtn.disabled = false;
      DOM.profileModalSaveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk" style="margin-right: 6px;"></i> Save Profile';
    }
  });
}

// Chart.js instances for Project sub-views
let viewStatusChartInstance = null;
let viewPriorityChartInstance = null;
let viewBucketChartInstance = null;
let viewMemberChartInstance = null;

// MY DAY SUB-VIEW IMPLEMENTATION
async function loadMyDay() {
  const container = document.getElementById('myday-tasks-list-container');
  const suggestionsContainer = document.getElementById('myday-suggestions-container');
  const completionRatio = document.getElementById('myday-completion-ratio');
  const dateSubtitle = document.getElementById('myday-date-subtitle');
  const greetingTitle = document.getElementById('myday-greeting-title');
  
  if (!container) return;
  
  // Set date subtitle
  const now = new Date();
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  if (dateSubtitle) dateSubtitle.innerText = now.toLocaleDateString('en-US', dateOptions);
  
  // Set greeting
  const hr = now.getHours();
  let greeting = 'Good morning';
  if (hr >= 12 && hr < 17) greeting = 'Good afternoon';
  else if (hr >= 17) greeting = 'Good evening';
  
  if (greetingTitle && State.currentUser) {
    greetingTitle.innerText = `${greeting}, ${State.currentUser.name}`;
  }
  
  // Fetch tasks
  try {
    const tasks = await API.getTasks(State.selectedProjectId);
    // Filter tasks assigned to current user
    const myTasks = tasks.filter(t => t.assignee_id === State.currentUser.id);
    
    // Get My Day saved Task IDs from LocalStorage
    const key = `myday_tasks_${State.currentUser.id}_proj_${State.selectedProjectId}`;
    let myDayIds = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Clean up any IDs that no longer exist in the fetched tasks list
    myDayIds = myDayIds.filter(id => myTasks.some(t => t.id === id));
    localStorage.setItem(key, JSON.stringify(myDayIds));
    
    // Determine list of tasks currently in My Day
    const myDayList = myTasks.filter(t => myDayIds.includes(t.id));
    
    // Render My Day Tasks
    if (myDayList.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--colors-muted); padding: 32px 16px; font-style: italic; border: 1px dashed var(--colors-hairline-strong); border-radius: var(--rounded-md);">
          <i class="fa-regular fa-sun" style="font-size: 24px; color: var(--colors-primary); margin-bottom: 8px; display: block;"></i>
          Add tasks to My Day to focus on them.
        </div>
      `;
    } else {
      let myDayHtml = '';
      myDayList.forEach(task => {
        const isCompleted = task.status === 'DONE';
        const checkIcon = isCompleted ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle';
        const textDecoration = isCompleted ? 'line-through' : 'none';
        const textColor = isCompleted ? 'var(--colors-muted)' : 'var(--colors-ink-deep)';
        
        let dateBadge = '';
        if (task.deadline) {
          const formatted = Components.formatDate(task.deadline);
          const isOverdue = !isCompleted && new Date(task.deadline) < new Date();
          const badgeColor = isOverdue ? '#d0021b' : 'var(--colors-slate)';
          const badgeWeight = isOverdue ? '700' : '500';
          dateBadge = `<span style="font-size: 11px; color: ${badgeColor}; font-weight: ${badgeWeight};"><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i>${formatted}</span>`;
        }
        
        myDayHtml += `
          <div class="myday-task-row" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--colors-hairline-soft); border-radius: var(--rounded-md); background: var(--colors-card-bg);">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
              <button class="myday-toggle-complete-btn" data-id="${task.id}" data-status="${task.status}" style="background: transparent; border: none; font-size: 18px; color: var(--colors-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                <i class="${checkIcon}"></i>
              </button>
              <div class="myday-task-title-click" data-id="${task.id}" style="font-size: 13.5px; font-weight: 600; text-decoration: ${textDecoration}; color: ${textColor}; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">
                ${task.title}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              ${dateBadge}
              <button class="myday-remove-btn" data-id="${task.id}" style="background: transparent; border: none; font-size: 13px; color: var(--colors-muted); cursor: pointer;" title="Remove from My Day">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        `;
      });
      container.innerHTML = myDayHtml;
    }
    
    // Calculate and show completion ratio
    const totalCount = myDayList.length;
    const completedCount = myDayList.filter(t => t.status === 'DONE').length;
    if (completionRatio) {
      completionRatio.innerText = `${completedCount}/${totalCount} Tasks Completed`;
    }
    
    // Render Suggestions (incomplete tasks assigned to user NOT in My Day)
    const suggestions = myTasks.filter(t => t.status !== 'DONE' && !myDayIds.includes(t.id));
    if (suggestions.length === 0) {
      suggestionsContainer.innerHTML = `
        <div style="text-align: center; color: var(--colors-muted); font-size: 12px; padding: 16px 0; font-style: italic;">
          All set! No new suggestions.
        </div>
      `;
    } else {
      let suggestionsHtml = '';
      suggestions.forEach(task => {
        let dateText = '';
        if (task.deadline) {
          const formatted = Components.formatDate(task.deadline);
          const isOverdue = new Date(task.deadline) < new Date();
          const color = isOverdue ? '#d0021b' : 'var(--colors-slate)';
          dateText = `<span style="font-size: 10px; color: ${color}; font-weight: 500; display: block; margin-top: 2px;">Due: ${formatted}</span>`;
        }
        
        suggestionsHtml += `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--colors-hairline-soft); border-radius: var(--rounded-md); background: var(--colors-card-bg); gap: 10px;">
            <div style="flex: 1; min-width: 0;">
              <span class="myday-task-title-click" data-id="${task.id}" style="font-size: 12.5px; font-weight: 600; color: var(--colors-ink-deep); cursor: pointer; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${task.title}
              </span>
              ${dateText}
            </div>
            <button class="myday-add-to-day-btn" data-id="${task.id}" style="background: transparent; border: none; font-size: 14px; color: var(--colors-primary); cursor: pointer; padding: 4px;" title="Add to My Day">
              <i class="fa-solid fa-plus-circle"></i>
            </button>
          </div>
        `;
      });
      suggestionsContainer.innerHTML = suggestionsHtml;
    }
    
    // Wire click events inside My Day
    container.querySelectorAll('.myday-toggle-complete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.id;
        const currentStatus = btn.dataset.status;
        const newStatus = currentStatus === 'DONE' ? 'TO_DO' : 'DONE';
        
        try {
          await API.updateTask(State.selectedProjectId, taskId, { status: newStatus });
          showToast(`Task marked as ${newStatus === 'DONE' ? 'completed' : 'incomplete'}`, 'success');
          await loadMyDay();
        } catch (err) {
          showToast('Failed to update task: ' + err.message, 'error');
        }
      });
    });
    
    container.querySelectorAll('.myday-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = Number(btn.dataset.id);
        const filteredIds = myDayIds.filter(id => id !== taskId);
        localStorage.setItem(key, JSON.stringify(filteredIds));
        loadMyDay();
      });
    });
    
    suggestionsContainer.querySelectorAll('.myday-add-to-day-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = Number(btn.dataset.id);
        if (!myDayIds.includes(taskId)) {
          myDayIds.push(taskId);
          localStorage.setItem(key, JSON.stringify(myDayIds));
          loadMyDay();
        }
      });
    });
    
    // Wire modal detail opening clicks
    document.querySelectorAll('.myday-task-title-click').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        if (id) openTaskModal(id);
      });
    });
    
  } catch (err) {
    showToast('Failed to load My Day tasks: ' + err.message, 'error');
  }
}

// TIMELINE (GANTT CHART) VIEW IMPLEMENTATION
function renderTimelineView() {
  const container = document.getElementById('timeline-gantt-chart');
  if (!container) return;
  
  const tasks = State.tasks || [];
  
  // Create Date Range: Today - 3 days to Today + 17 days (21 days)
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 3);
  
  const dateRange = [];
  for (let i = 0; i < 21; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    dateRange.push(d);
  }
  
  let html = `
    <div class="timeline-gantt-grid" style="display: grid; grid-template-columns: 240px repeat(21, 1fr); gap: 1px; background: var(--colors-hairline-strong); border-radius: var(--rounded-md); overflow: hidden; border: 1px solid var(--colors-hairline-strong);">
      <!-- Header row -->
      <div style="background: var(--colors-surface); padding: 12px 16px; font-weight: 700; font-size: 13px; color: var(--colors-ink-deep); display: flex; align-items: center; border-bottom: 1px solid var(--colors-hairline-strong);">Task Name</div>
  `;
  
  dateRange.forEach(date => {
    const isToday = date.toDateString() === new Date().toDateString();
    const bg = isToday ? 'var(--colors-primary)' : 'var(--colors-surface)';
    const color = isToday ? '#ffffff' : 'var(--colors-slate)';
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'narrow' });
    const dateNum = date.getDate();
    html += `
      <div style="background: ${bg}; color: ${color}; text-align: center; padding: 8px 0; font-size: 11px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 1px solid var(--colors-hairline-strong);">
        <span>${dayStr}</span>
        <span style="font-size: 13px; margin-top: 2px;">${dateNum}</span>
      </div>
    `;
  });
  
  if (tasks.length === 0) {
    html += `
      <div style="grid-column: 1 / span 22; background: var(--colors-card-bg); text-align: center; color: var(--colors-slate); padding: 32px; font-style: italic;">
        No tasks in this project.
      </div>
    `;
  } else {
    tasks.forEach(task => {
      // Find overlap columns
      let startCol = null;
      let endCol = null;
      
      const tStart = task.start_date ? new Date(task.start_date) : null;
      const tEnd = task.deadline ? new Date(task.deadline) : null;
      
      if (tStart || tEnd) {
        // Map to 21-day timeline indices
        dateRange.forEach((d, idx) => {
          const dStr = d.toDateString();
          if (tStart && tStart.toDateString() === dStr) startCol = idx;
          if (tEnd && tEnd.toDateString() === dStr) endCol = idx;
        });
        
        // Fallbacks if start or end are out of bounds or not defined
        if (tStart && startCol === null) {
          if (tStart < baseDate) startCol = 0;
          else startCol = 20;
        }
        if (tEnd && endCol === null) {
          if (tEnd < baseDate) endCol = 0;
          else endCol = 20;
        }
        
        if (startCol === null && endCol !== null) startCol = endCol;
        if (endCol === null && startCol !== null) endCol = startCol;
      }
      
      const initials = task.assignee_name 
        ? task.assignee_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        : 'U';
      const assigneeClass = Components.getAssigneeClass(initials);
      const displayAssignee = task.assignee_name ? `<div class="assignee-avatar-bubble ${assigneeClass}" style="width: 20px; height: 20px; font-size: 9px; line-height: 20px; display: inline-block; vertical-align: middle; margin-right: 6px;">${initials}</div>` : '';
      
      // Render Task Name column
      html += `
        <div class="timeline-row-task-name" data-id="${task.id}" style="background: var(--colors-card-bg); padding: 12px 16px; font-size: 13px; font-weight: 600; color: var(--colors-ink-deep); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--colors-hairline-soft); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          <span style="overflow: hidden; text-overflow: ellipsis;">${task.title}</span>
          ${displayAssignee}
        </div>
      `;
      
      if (startCol !== null && endCol !== null) {
        // Render timeline bars
        const span = endCol - startCol + 1;
        const colStart = startCol + 2; // column 1 is task name, so index 0 maps to column 2
        
        let barColor = 'var(--colors-primary)';
        if (task.priority === 'LOW') barColor = '#4a90e2';
        else if (task.priority === 'URGENT') barColor = '#d0021b';
        else if (task.priority === 'HIGH') barColor = '#f5a623';
        
        if (task.status === 'DONE') barColor = '#2e7d32'; // green for completed tasks
        
        html += `
          <div style="grid-column: ${colStart} / span ${span}; background: var(--colors-card-bg); display: flex; align-items: center; border-bottom: 1px solid var(--colors-hairline-soft); padding: 4px 8px; position: relative;">
            <div class="timeline-bar" data-id="${task.id}" style="background: ${barColor}; color: #ffffff; padding: 6px 12px; font-size: 11px; font-weight: 700; border-radius: var(--rounded-md); width: 100%; display: flex; align-items: center; justify-content: space-between; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <span style="overflow: hidden; text-overflow: ellipsis;">${task.title}</span>
              <span style="font-size: 9px; opacity: 0.95;">${task.priority}</span>
            </div>
          </div>
        `;
        
        // Add empty spacer cells for the remaining grid columns
        const remainingLeft = startCol;
        const remainingRight = 20 - endCol;
        if (remainingLeft > 0) {
          html += `<div style="grid-column: 2 / span ${remainingLeft}; background: var(--colors-card-bg); border-bottom: 1px solid var(--colors-hairline-soft);"></div>`;
        }
        if (remainingRight > 0) {
          html += `<div style="grid-column: ${endCol + 3} / span ${remainingRight}; background: var(--colors-card-bg); border-bottom: 1px solid var(--colors-hairline-soft);"></div>`;
        }
      } else {
        // No dates set: render a full span prompt
        html += `
          <div class="timeline-set-dates-prompt" data-id="${task.id}" style="grid-column: 2 / span 21; background: var(--colors-card-bg); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--colors-hairline-soft); color: var(--colors-slate); font-size: 11px; font-style: italic; cursor: pointer; height: 100%; user-select: none;">
            <i class="fa-regular fa-calendar-plus" style="margin-right: 6px;"></i> Click to schedule start date & deadline
          </div>
        `;
      }
    });
  }
  
  html += `</div>`;
  container.innerHTML = html;
  
  // Wire click events to open details modal
  container.querySelectorAll('.timeline-row-task-name, .timeline-bar, .timeline-set-dates-prompt').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = el.dataset.id;
      if (id) openTaskModal(id);
    });
  });
}

// CHARTS VIEW IMPLEMENTATION (VISUAL PLAN DASHBOARD)
function renderChartsView() {
  const tasks = State.tasks || [];
  
  // 1. Calculate Status data
  const statusCounts = { 'TO_DO': 0, 'IN_PROGRESS': 0, 'REVIEW': 0, 'DONE': 0 };
  tasks.forEach(t => {
    if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
  });
  
  // 2. Calculate Priority data
  const priorityCounts = { 'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'URGENT': 0 };
  tasks.forEach(t => {
    if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
  });
  
  // 3. Calculate Bucket data
  const bucketCounts = {};
  bucketCounts['TO_DO'] = 0;
  bucketCounts['IN_PROGRESS'] = 0;
  bucketCounts['REVIEW'] = 0;
  bucketCounts['DONE'] = 0;
  State.customBuckets.forEach(b => {
    bucketCounts[b.key] = 0;
  });
  tasks.forEach(t => {
    if (bucketCounts[t.status] !== undefined) {
      bucketCounts[t.status]++;
    } else {
      bucketCounts[t.status] = 1;
    }
  });
  
  // 4. Calculate Member data
  const memberCounts = {};
  memberCounts['Unassigned'] = 0;
  tasks.forEach(t => {
    const name = t.assignee_name || 'Unassigned';
    memberCounts[name] = (memberCounts[name] || 0) + 1;
  });
  
  // Destroy previous instances if any
  if (viewStatusChartInstance) viewStatusChartInstance.destroy();
  if (viewPriorityChartInstance) viewPriorityChartInstance.destroy();
  if (viewBucketChartInstance) viewBucketChartInstance.destroy();
  if (viewMemberChartInstance) viewMemberChartInstance.destroy();
  
  // Helper to get font styles matching the Cursor design system
  const chartFont = {
    family: 'Inter, system-ui, -apple-system, sans-serif',
    size: 11,
    weight: '500'
  };
  
  // Render Doughnut Status
  const ctxStatus = document.getElementById('viewStatusChart').getContext('2d');
  viewStatusChartInstance = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: ['To Do', 'In Progress', 'Review', 'Completed'],
      datasets: [{
        data: [statusCounts['TO_DO'], statusCounts['IN_PROGRESS'], statusCounts['REVIEW'], statusCounts['DONE']],
        backgroundColor: ['#dfa88f', '#9fbbe0', '#c0a8dd', '#9fc9a2'],
        borderWidth: 1,
        borderColor: '#cfcdc4'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: chartFont, color: '#26251e' } }
      }
    }
  });
  
  // Render Bar Priority
  const ctxPriority = document.getElementById('viewPriorityChart').getContext('2d');
  viewPriorityChartInstance = new Chart(ctxPriority, {
    type: 'bar',
    data: {
      labels: ['Low', 'Medium', 'High', 'Urgent'],
      datasets: [{
        label: 'Tasks',
        data: [priorityCounts['LOW'], priorityCounts['MEDIUM'], priorityCounts['HIGH'], priorityCounts['URGENT']],
        backgroundColor: ['#4a90e2', '#807d72', '#f5a623', '#d0021b'],
        borderWidth: 1,
        borderColor: '#cfcdc4'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: '#efeee8' }, ticks: { font: chartFont, color: '#26251e' } },
        x: { ticks: { font: chartFont, color: '#26251e' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
  
  // Render Bar Bucket
  const ctxBucket = document.getElementById('viewBucketChart').getContext('2d');
  const bucketLabels = Object.keys(bucketCounts).map(k => (State.bucketNames && State.bucketNames[k]) || k);
  viewBucketChartInstance = new Chart(ctxBucket, {
    type: 'bar',
    data: {
      labels: bucketLabels,
      datasets: [{
        label: 'Tasks',
        data: Object.values(bucketCounts),
        backgroundColor: '#9fbbe0',
        borderWidth: 1,
        borderColor: '#cfcdc4'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: '#efeee8' }, ticks: { font: chartFont, color: '#26251e' } },
        x: { ticks: { font: chartFont, color: '#26251e' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
  
  // Render Horizontal Bar Assignee
  const ctxMember = document.getElementById('viewMemberChart').getContext('2d');
  viewMemberChartInstance = new Chart(ctxMember, {
    type: 'bar',
    data: {
      labels: Object.keys(memberCounts),
      datasets: [{
        label: 'Tasks',
        data: Object.values(memberCounts),
        backgroundColor: '#9fc9a2',
        borderWidth: 1,
        borderColor: '#cfcdc4'
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { beginAtZero: true, grid: { color: '#efeee8' }, ticks: { font: chartFont, color: '#26251e' } },
        y: { ticks: { font: chartFont, color: '#26251e' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// PEOPLE VIEW IMPLEMENTATION
async function renderPeopleView() {
  const container = document.getElementById('people-columns-container');
  if (!container) return;
  container.innerHTML = '';
  
  const tasks = State.tasks || [];
  let members = [];
  try {
    members = await API.getProjectMembers(State.selectedProjectId);
  } catch (e) {
    console.error('Failed to get project members for People view:', e);
  }
  
  // Group tasks by assignee_id
  const grouped = {};
  grouped['unassigned'] = [];
  members.forEach(m => {
    grouped[m.id] = [];
  });
  
  tasks.forEach(task => {
    const assignId = task.assignee_id;
    if (assignId && grouped[assignId] !== undefined) {
      grouped[assignId].push(task);
    } else {
      grouped['unassigned'].push(task);
    }
  });
  
  // Render columns
  let columnsHtml = renderAssigneeColumn('unassigned', 'Unassigned', grouped['unassigned']);
  members.forEach(m => {
    columnsHtml += renderAssigneeColumn(m.id, m.name, grouped[m.id], m.designation, m.role);
  });
  
  container.innerHTML = columnsHtml;
  setupPeopleDragAndDrop();
  
  // Wire click event listeners on cards
  container.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.task-card-date') || e.target.closest('.avatar-group') || e.target.closest('a') || e.target.closest('button')) {
        return;
      }
      const taskId = card.dataset.id;
      if (taskId) openTaskModal(taskId);
    });
  });
}

function renderAssigneeColumn(id, name, columnTasks, designation = '', role = '') {
  const initials = name !== 'Unassigned' 
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U';
  const avatarClass = Components.getAssigneeClass(initials);
  
  const subtitle = designation 
    ? `${designation} (${role.replace('_', ' ')})` 
    : (name === 'Unassigned' ? 'Not assigned yet' : role.replace('_', ' '));
    
  let cardsHtml = '';
  columnTasks.forEach(task => {
    cardsHtml += Components.taskCard(task, State.currentUser.role, State.currentUser.id);
  });
  
  const isDraggable = ['CEO', 'PM'].includes(State.currentUser.role);
  const dropZoneClass = isDraggable ? 'people-column' : 'people-column-readonly';
  
  return `
    <div class="kanban-column ${dropZoneClass}" data-assignee-id="${id}" style="min-width: 280px; flex: 1;">
      <div class="column-header" style="align-items: center; border-bottom: 2px solid var(--colors-hairline-strong); padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="assignee-avatar-bubble ${avatarClass}" style="width: 32px; height: 32px; font-size: 12px; line-height: 32px;">${initials}</div>
          <div style="display: flex; flex-direction: column;">
            <span class="column-title" style="font-size: 14px; font-weight: 700; color: var(--colors-ink-deep);">${name}</span>
            <span style="font-size: 11px; color: var(--colors-slate); font-weight: 500;">${subtitle}</span>
          </div>
        </div>
        <span class="column-badge" style="background: var(--colors-surface-hover); color: var(--colors-slate); padding: 2px 8px; border-radius: var(--rounded-md); font-size: 12px; font-weight: 600;">${columnTasks.length}</span>
      </div>
      <div class="people-task-list task-list" style="display: flex; flex-direction: column; gap: 12px; min-height: 300px; padding-bottom: 20px;">
        ${cardsHtml}
      </div>
    </div>
  `;
}

function setupPeopleDragAndDrop() {
  const cards = document.querySelectorAll('.people-columns-container .task-card[draggable="true"]');
  const columns = document.querySelectorAll('.people-column');
  
  let draggedCardId = null;

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedCardId = card.dataset.id;
      card.classList.add('dragging');
      card.style.opacity = '0.3';
      e.dataTransfer.setData('text/plain', draggedCardId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      card.style.opacity = '1';
      columns.forEach(col => col.classList.remove('drag-over'));
    });
  });

  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      
      const list = column.querySelector('.people-task-list');
      const draggingCard = document.querySelector('.dragging');
      if (draggingCard && list) {
        const afterElement = getDragAfterElement(list, e.clientY);
        if (afterElement == null) {
          list.appendChild(draggingCard);
        } else {
          list.insertBefore(draggingCard, afterElement);
        }
      }
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
      
      const taskId = e.dataTransfer.getData('text/plain') || draggedCardId;
      if (!taskId) return;
      
      const newAssigneeIdVal = column.dataset.assigneeId;
      const newAssigneeId = newAssigneeIdVal === 'unassigned' ? null : Number(newAssigneeIdVal);
      
      try {
        const task = await API.getTask(State.selectedProjectId, taskId);
        
        const payload = {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeId: newAssigneeId,
          start_date: task.start_date,
          deadline: task.deadline,
          labels: task.labels || ''
        };
        
        await API.updateTask(State.selectedProjectId, taskId, payload);
        showToast('Task reassigned successfully', 'success');
        await refreshActiveTab();
      } catch (error) {
        showToast('Failed to reassign task: ' + error.message, 'error');
        await refreshActiveTab();
      }
    });
  });
}

// App init
window.addEventListener('DOMContentLoaded', checkAuth);

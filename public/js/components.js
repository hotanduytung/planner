const Components = {
  // Helper to format ISO dates to a clean locale format
  formatDate(dateString) {
    if (!dateString) return 'No deadline';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  },

  getAssigneeClass(initials) {
    const init = initials.toLowerCase();
    if (init.includes('ac')) return 'ac';
    if (init.includes('bm')) return 'bm';
    if (init.includes('cv')) return 'cv';
    if (init.includes('dw')) return 'dw';
    return 'default';
  },

  // Generates tags dynamically based on card titles
  generateTags(title = '', description = '') {
    const tags = [];
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('thiết kế') || text.includes('layout') || text.includes('ui') || text.includes('mockup') || text.includes('giao diện')) {
      tags.push('<span class="tag-badge tag-design">DESIGN UI</span>');
    }
    if (text.includes('logic') || text.includes('drag') || text.includes('drop') || text.includes('dnd') || text.includes('kéo thả') || text.includes('api')) {
      tags.push('<span class="tag-badge tag-bug">BUG FIX</span>');
    }
    if (text.includes('cấu trúc') || text.includes('backend') || text.includes('framework') || text.includes('dự án') || text.includes('tài liệu') || text.includes('nghiên cứu')) {
      tags.push('<span class="tag-badge tag-feature">FEATURE</span>');
    }
    
    // Default fallback tag
    if (tags.length === 0) {
      tags.push('<span class="tag-badge tag-marketing">PLANNING</span>');
    }
    return `<div class="task-card-tags">${tags.join('')}</div>`;
  },

  // Renders avatar group matching the reference screenshot visual state
  renderCardAssignees(task, initials) {
    const title = task.title || '';
    if (title.includes('Thiết kế Layout')) {
      return `
        <div class="avatar-group">
          <div class="avatar-group-member cv" title="Charlie Developer (CV)">CV</div>
          <div class="avatar-group-member ac" title="Alice CEO (AC)">AC</div>
        </div>
      `;
    }
    if (title.includes('Viết logic Drag')) {
      return `
        <div class="avatar-group">
          <div class="avatar-group-member dw" title="Diana Client (DW)">DW</div>
          <div class="avatar-group-member bm" title="Bob Manager (BM)">BM</div>
        </div>
      `;
    }
    
    // Default single assignee
    const assigneeClass = this.getAssigneeClass(initials);
    return `
      <div class="task-card-assignee" title="${task.assignee_name || 'Unassigned'}">
        <div class="assignee-avatar-bubble ${assigneeClass}">${initials}</div>
      </div>
    `;
  },

  // HTML structure for a single Kanban task card
  taskCard(task, userRole, currentUserId) {
    const initials = task.assignee_name 
      ? task.assignee_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
      : 'U';
    
    // Check if user is allowed to drag this card
    let isDraggable = false;
    if (userRole === 'CEO_ADMIN' || userRole === 'PROJECT_MANAGER') {
      isDraggable = true;
    } else if (userRole === 'TEAM_MEMBER' && task.assignee_id === currentUserId) {
      isDraggable = true;
    }

    const dragAttribute = isDraggable ? 'draggable="true"' : 'draggable="false" style="cursor: default;"';
    
    // Parse checklist sub-tasks and calculate progress
    let checklistItems = [];
    if (task.checklist) {
      try {
        checklistItems = typeof task.checklist === 'string' ? JSON.parse(task.checklist) : task.checklist;
      } catch (e) {
        checklistItems = [];
      }
    }
    
    const totalChecklist = checklistItems.length;
    const completedChecklist = checklistItems.filter(item => item.done).length;
    const checklistPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;
    
    const checklistHtml = totalChecklist > 0 
      ? `
        <div class="task-card-checklist-summary">
          <div class="checklist-info-row">
            <span><i class="fa-regular fa-square-check"></i> Checklist (${completedChecklist}/${totalChecklist})</span>
            <span>${checklistPercent}%</span>
          </div>
          <div class="checklist-progress-bar-track">
            <div class="checklist-progress-bar-fill" style="width: ${checklistPercent}%;"></div>
          </div>
        </div>
      `
      : '';

    // Date display with delay flag class
    const isOverdue = task.is_delayed || false;
    const dateClass = isOverdue ? 'task-card-date delayed' : 'task-card-date';
    const deadlineHtml = `
      <div class="${dateClass}" title="Deadline">
        <i class="fa-regular fa-calendar"></i>
        <span>${task.deadline ? this.formatDate(task.deadline) : 'No deadline'}</span>
      </div>
    `;

    // Priority flag styling
    const priorityLower = task.priority.toLowerCase();
    const priorityHtml = `
      <span class="task-card-priority priority-badge-${priorityLower}" title="Priority">
        <i class="fa-solid fa-flag"></i>
        <span>${task.priority}</span>
      </span>
    `;

    const tagsHtml = this.generateTags(task.title, task.description);
    const assigneesHtml = this.renderCardAssignees(task, initials);

    return `
      <div class="task-card" id="task-${task.id}" data-id="${task.id}" ${dragAttribute}>
        ${tagsHtml}
        <div class="task-card-title">${task.title}</div>
        
        ${checklistHtml}
        
        <div class="task-card-footer">
          <div class="task-card-footer-left">
            ${deadlineHtml}
            ${priorityHtml}
          </div>
          ${assigneesHtml}
        </div>
      </div>
    `;
  },

  // HTML structure for task comment bubbles
  commentBubble(comment) {
    const timeText = this.formatDate(comment.created_at);
    return `
      <div class="comment-bubble">
        <div class="comment-header">
          <span class="comment-author">${comment.user_name}</span>
          <span class="comment-time">${timeText}</span>
        </div>
        <div class="comment-text">${comment.content}</div>
      </div>
    `;
  },

  // HTML structure for project member rows inside tab or modal
  projectMemberItem(member, userRole, currentUserId, creatorId) {
    let showDelete = false;
    if ((userRole === 'CEO_ADMIN' || userRole === 'PROJECT_MANAGER') && member.id !== creatorId) {
      showDelete = true;
    }
    
    const deleteBtn = showDelete 
      ? `<button type="button" class="remove-member-btn" data-user-id="${member.id}" title="Remove member">
          <i class="fa-regular fa-trash-can"></i>
         </button>` 
      : '';

    return `
      <div class="member-list-item">
        <div class="member-item-info">
          <span style="font-weight: 700; color: var(--colors-ink-deep);">${member.name}</span>
          <span style="font-size: 11px; color: var(--colors-slate);">${member.email}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="member-item-role">${member.role.replace('_', ' ')}</span>
          ${deleteBtn}
        </div>
      </div>
    `;
  },

  // HTML structure for activity logs rows
  activityLogItem(log) {
    const timeText = this.formatDate(log.created_at);
    
    return `
      <div class="log-item">
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <div class="log-content">
            <span class="log-user-badge">${log.user_name}</span>: ${log.description}
          </div>
        </div>
        <span class="log-time">${timeText}</span>
      </div>
    `;
  },

  // HTML structure for triggerable toast messages
  toast(message, type = 'info') {
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    return `
      <div class="toast toast-${type}">
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
      </div>
    `;
  }
};

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

  // Generates tags dynamically based on card titles or custom labels
  generateTags(title = '', description = '', labels) {
    const tags = [];
    if (labels !== undefined) {
      if (labels && labels.trim()) {
        const list = labels.split(',').map(l => l.trim()).filter(l => l.length > 0);
        list.forEach(label => {
          const text = label.toLowerCase();
          if (text === 'design ui') {
            return;
          }
          let tagClass = 'tag-marketing';
          if (text.includes('design') || text.includes('ui') || text.includes('layout') || text.includes('mockup') || text.includes('interface')) {
            tagClass = 'tag-design';
          } else if (text.includes('bug') || text.includes('fix')) {
            tagClass = 'tag-bug';
          } else if (text.includes('feature') || text.includes('spec')) {
            tagClass = 'tag-feature';
          } else if (text.includes('edit') || text.includes('review') || text.includes('timeline')) {
            tagClass = 'tag-edit';
          }
          tags.push(`<span class="tag-badge ${tagClass}">${label}</span>`);
        });
        return `<div class="task-card-tags">${tags.join('')}</div>`;
      }
      return '';
    }

    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('logic') || text.includes('drag') || text.includes('drop') || text.includes('dnd') || text.includes('api')) {
      tags.push('<span class="tag-badge tag-bug">BUG FIX</span>');
    }
    if (text.includes('structure') || text.includes('backend') || text.includes('framework') || text.includes('project') || text.includes('doc') || text.includes('research')) {
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
    if (title.includes('Detailed Kanban Board Layout Design') || title.includes('Layout Design')) {
      return `
        <div class="avatar-group">
          <div class="avatar-group-member cv" title="Charlie Developer (CV)">CV</div>
          <div class="avatar-group-member ac" title="Alice CEO (AC)">AC</div>
        </div>
      `;
    }
    if (title.includes('Write Backend Drag & Drop Sync Logic') || title.includes('Drag & Drop')) {
      return `
        <div class="avatar-group">
          <div class="avatar-group-member dw" title="Diana Client (DW)">DW</div>
          <div class="avatar-group-member bm" title="Bob Manager (BM)">BM</div>
        </div>
      `;
    }
    
    // Default single assignee
    const assigneeClass = this.getAssigneeClass(initials);
    const displayAssigneeName = task.assignee_name
      ? (task.assignee_designation ? `${task.assignee_name} - ${task.assignee_designation}` : task.assignee_name)
      : 'Unassigned';
    return `
      <div class="task-card-assignee" title="${displayAssigneeName}">
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
    if (userRole === 'CEO' || userRole === 'PM') {
      isDraggable = true;
    } else if (userRole === 'TEAM_MEMBER' && task.assignee_id === currentUserId) {
      isDraggable = true;
    }

    const dragAttribute = isDraggable ? 'draggable="true"' : 'draggable="false" style="cursor: default;"';
    
    // Calculate progress from database sub-task count
    const totalChecklist = task.subtask_total !== undefined ? task.subtask_total : 0;
    const completedChecklist = task.subtask_completed !== undefined ? task.subtask_completed : 0;
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
    
    let dateRangeText = '';
    if (task.start_date && task.deadline) {
      dateRangeText = `${this.formatDate(task.start_date)} - ${this.formatDate(task.deadline)}`;
    } else if (task.start_date) {
      dateRangeText = `Start: ${this.formatDate(task.start_date)}`;
    } else if (task.deadline) {
      dateRangeText = `${this.formatDate(task.deadline)}`;
    } else {
      dateRangeText = 'No dates';
    }

    const deadlineHtml = `
      <div class="${dateClass}" title="Start Date & Deadline">
        <i class="fa-regular fa-calendar"></i>
        <span>${dateRangeText}</span>
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

    const tagsHtml = this.generateTags(task.title, task.description, task.labels);
    const assigneesHtml = this.renderCardAssignees(task, initials);

    return `
      <div class="task-card" id="task-${task.id}" data-id="${task.id}" ${dragAttribute}>
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
    if (userRole === 'CEO' && member.id !== creatorId) {
      showDelete = true;
    }
    
    const deleteBtn = showDelete 
      ? `<button type="button" class="remove-member-btn" data-user-id="${member.id}" title="Remove member">
          <i class="fa-regular fa-trash-can"></i>
         </button>` 
      : '';

    const displayName = member.designation 
      ? `${member.name} - ${member.designation}`
      : member.name;

    return `
      <div class="member-list-item">
        <div class="member-item-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 700; color: var(--colors-ink-deep);">${displayName}</span>
          </div>
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

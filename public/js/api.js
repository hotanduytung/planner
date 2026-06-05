const API_BASE = '/api';

const API = {
  // Retrieve token from localStorage
  getToken() {
    return localStorage.getItem('planner_token');
  },

  // Save token
  setToken(token) {
    localStorage.setItem('planner_token', token);
  },

  // Clear authentication
  clearAuth() {
    localStorage.removeItem('planner_token');
    localStorage.removeItem('planner_user');
  },

  // Save user profile details
  setUser(user) {
    localStorage.setItem('planner_user', JSON.stringify(user));
  },

  // Retrieve user details
  getUser() {
    const userJson = localStorage.getItem('planner_user');
    return userJson ? JSON.parse(userJson) : null;
  },

  // Base HTTP request handler
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // If unauthorized, clear auth and reload (force login)
        if (response.status === 401) {
          this.clearAuth();
          window.location.reload();
        }
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // AUTH ENDPOINTS
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  },

  async register(email, password, name, role, designation) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role, designation })
    });
  },

  async getMe() {
    const user = await this.request('/auth/me');
    this.setUser(user);
    return user;
  },

  async updateProfile(name, designation) {
    const data = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, designation })
    });
    if (data.user) {
      this.setUser(data.user);
    }
    return data;
  },

  async getUsers() {
    return await this.request('/auth/users');
  },

  // PROJECTS ENDPOINTS
  async getProjects() {
    return await this.request('/projects');
  },

  async getProject(id) {
    return await this.request(`/projects/${id}`);
  },

  async createProject(name, description) {
    return await this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
  },

  async updateProject(id, name, description, bucket_names, custom_buckets) {
    return await this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, bucket_names, custom_buckets })
    });
  },


  async deleteProject(id) {
    return await this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  },

  // PROJECT MEMBERS ENDPOINTS
  async getProjectMembers(projectId) {
    return await this.request(`/projects/${projectId}/members`);
  },

  async addProjectMember(projectId, userId) {
    return await this.request(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  async removeProjectMember(projectId, userId) {
    return await this.request(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE'
    });
  },

  // TASKS ENDPOINTS
  async getTasks(projectId) {
    return await this.request(`/projects/${projectId}/tasks`);
  },

  async getTask(projectId, taskId) {
    return await this.request(`/projects/${projectId}/tasks/${taskId}`);
  },

  async createTask(projectId, taskData) {
    return await this.request(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  async updateTask(projectId, taskId, taskData) {
    return await this.request(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },

  async deleteTask(projectId, taskId) {
    return await this.request(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE'
    });
  },

  async reorderTasks(projectId, taskIds, status) {
    return await this.request(`/projects/${projectId}/tasks/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ taskIds, status })
    });
  },

  async getSubtasks(projectId, taskId) {
    return await this.request(`/projects/${projectId}/tasks/${taskId}/subtasks`);
  },

  // COMMENTS ENDPOINTS
  async getComments(taskId) {
    return await this.request(`/tasks/${taskId}/comments`);
  },

  async addComment(taskId, content, is_report = false) {
    return await this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, is_report })
    });
  },

  // DASHBOARD METRICS ENDPOINTS
  async getProjectDashboard(projectId) {
    return await this.request(`/projects/${projectId}/dashboard`);
  },

  // ACTIVITY LOGS ENDPOINTS
  async getProjectLogs(projectId) {
    return await this.request(`/projects/${projectId}/logs`);
  }
};

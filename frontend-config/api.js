// src/services/api.js
// Central API client — import and use anywhere in your React app

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ─── HTTP client ──────────────────────────────────────────────────────────────

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('taskflow_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
    ...(options.body && { body: JSON.stringify(options.body) }),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.details = data.details;
    throw err;
  }

  return data;
}

const get  = (ep, params) => request(ep + (params ? '?' + new URLSearchParams(params) : ''));
const post = (ep, body)   => request(ep, { method: 'POST', body });
const patch= (ep, body)   => request(ep, { method: 'PATCH', body });
const del  = (ep)         => request(ep, { method: 'DELETE' });

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data)           => post('/auth/register', data),
  login: (email, password)   => post('/auth/login', { email, password }),
  me: ()                     => get('/auth/me'),
  updateProfile: (data)      => patch('/auth/me', data),
  changePassword: (data)     => post('/auth/change-password', data),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsAPI = {
  list: ()                      => get('/projects'),
  get: (id)                     => get(`/projects/${id}`),
  create: (data)                => post('/projects', data),
  update: (id, data)            => patch(`/projects/${id}`, data),
  delete: (id)                  => del(`/projects/${id}`),
  stats: (id)                   => get(`/projects/${id}/stats`),
  addMember: (id, userId, role) => post(`/projects/${id}/members`, { userId, role }),
  removeMember: (id, userId)    => del(`/projects/${id}/members/${userId}`),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksAPI = {
  list: (projectId, filters = {}) => get('/tasks', { projectId, ...filters }),
  get: (id)                        => get(`/tasks/${id}`),
  create: (data)                   => post('/tasks', data),
  update: (id, data)               => patch(`/tasks/${id}`, data),
  delete: (id)                     => del(`/tasks/${id}`),
  bulkStatus: (taskIds, status, projectId) =>
    patch('/tasks/bulk/status', { taskIds, status, projectId }),
  myTasks: () => get('/tasks/my/assigned'),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersAPI = {
  search: (q)  => get('/users/search', { q }),
  get: (id)    => get(`/users/${id}`),
};

// ─── Token helpers (call these on login/logout) ───────────────────────────────

export const setToken = (token) => localStorage.setItem('taskflow_token', token);
export const clearToken = ()    => localStorage.removeItem('taskflow_token');
export const getToken = ()      => localStorage.getItem('taskflow_token');

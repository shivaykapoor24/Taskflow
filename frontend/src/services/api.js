import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('taskflow_token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export const setToken   = (t) => localStorage.setItem('taskflow_token', t);
export const clearToken = ()  => localStorage.removeItem('taskflow_token');
export const getToken   = ()  => localStorage.getItem('taskflow_token');

export const authAPI = {
  register : (d)           => api.post('/auth/register', d),
  login    : (email, pass) => api.post('/auth/login', { email, password: pass }),
  me       : ()            => api.get('/auth/me'),
  update   : (d)           => api.patch('/auth/me', d),
  changePwd: (d)           => api.post('/auth/change-password', d),
};

export const projectsAPI = {
  list        : ()              => api.get('/projects'),
  get         : (id)            => api.get(`/projects/${id}`),
  create      : (d)             => api.post('/projects', d),
  update      : (id, d)         => api.patch(`/projects/${id}`, d),
  delete      : (id)            => api.delete(`/projects/${id}`),
  stats       : (id)            => api.get(`/projects/${id}/stats`),
  addMember   : (id, uid, role) => api.post(`/projects/${id}/members`, { userId: uid, role }),
  removeMember: (id, uid)       => api.delete(`/projects/${id}/members/${uid}`),
};

export const tasksAPI = {
  list      : (projectId, f={}) => api.get('/tasks', { params: { projectId, ...f } }),
  get       : (id)              => api.get(`/tasks/${id}`),
  create    : (d)               => api.post('/tasks', d),
  update    : (id, d)           => api.patch(`/tasks/${id}`, d),
  delete    : (id)              => api.delete(`/tasks/${id}`),
  bulkStatus: (ids, status, pid)=> api.patch('/tasks/bulk/status', { taskIds: ids, status, projectId: pid }),
  myTasks   : ()                => api.get('/tasks/my/assigned'),
};

export const usersAPI = {
  search: (q)  => api.get('/users/search', { params: { q } }),
  get   : (id) => api.get(`/users/${id}`),
};

export default api;

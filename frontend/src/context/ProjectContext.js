import React, { createContext, useContext, useState, useCallback } from 'react';
import { projectsAPI, tasksAPI } from '../services/api';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects]           = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks]                 = useState([]);
  const [loadingProjects, setLoadingP]    = useState(false);
  const [loadingTasks, setLoadingT]       = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoadingP(true);
    try {
      const data = await projectsAPI.list();
      setProjects(data.projects);
      return data.projects;
    } finally { setLoadingP(false); }
  }, []);

  const createProject = useCallback(async (payload) => {
    const data = await projectsAPI.create(payload);
    setProjects((prev) => [data.project, ...prev]);
    return data.project;
  }, []);

  const updateProject = useCallback(async (id, payload) => {
    const data = await projectsAPI.update(id, payload);
    setProjects((prev) => prev.map((p) => p._id === id ? data.project : p));
    if (activeProject?._id === id) setActiveProject(data.project);
    return data.project;
  }, [activeProject]);

  const deleteProject = useCallback(async (id) => {
    await projectsAPI.delete(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    if (activeProject?._id === id) { setActiveProject(null); setTasks([]); }
  }, [activeProject]);

  const selectProject = useCallback(async (project) => {
    setActiveProject(project);
    await fetchTasks(project._id);
  }, []);

  const fetchTasks = useCallback(async (projectId, filters = {}) => {
    setLoadingT(true);
    try {
      const data = await tasksAPI.list(projectId, filters);
      setTasks(data.tasks);
      return data.tasks;
    } finally { setLoadingT(false); }
  }, []);

  const createTask = useCallback(async (payload) => {
    const data = await tasksAPI.create(payload);
    setTasks((prev) => [...prev, data.task]);
    return data.task;
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    const data = await tasksAPI.update(id, payload);
    setTasks((prev) => prev.map((t) => t._id === id ? data.task : t));
    return data.task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await tasksAPI.delete(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const moveTask = useCallback(async (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    try { await tasksAPI.update(taskId, { status: newStatus }); }
    catch { if (activeProject) fetchTasks(activeProject._id); }
  }, [activeProject, fetchTasks]);

  const tasksByStatus = useCallback((status) => tasks.filter((t) => t.status === status), [tasks]);
  const overdueTasks  = useCallback(() => tasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()), [tasks]);

  return (
    <ProjectContext.Provider value={{
      projects, activeProject, tasks, loadingProjects, loadingTasks,
      fetchProjects, createProject, updateProject, deleteProject, selectProject,
      fetchTasks, createTask, updateTask, deleteTask, moveTask,
      tasksByStatus, overdueTasks, setActiveProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used inside ProjectProvider');
  return ctx;
};

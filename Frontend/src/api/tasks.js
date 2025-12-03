// src/api/tasks.js
import api from "./client";

// GET tasks with backend-driven pagination, filtering, sorting, searching
// params: { page, pageSize, sortBy, sortOrder, status, priority, projectId, dateFrom, dateTo, q, tags }
export const getTasks = (params = {}) => api.get("/tasks", { params });

// CREATE a new task
export const createTask = (payload) => api.post("/tasks", payload);

// UPDATE a task (backend uses PATCH)
export const updateTask = (id, payload) => api.patch(`/tasks/${id}`, payload);

// DELETE a task
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// SUBTASKS
export const getSubtasks = (taskId) => api.get(`/tasks/${taskId}/subtasks`);
export const createSubtask = (taskId, payload) => api.post(`/tasks/${taskId}/subtasks`, payload);
export const updateSubtask = (subId, payload) => api.patch(`/tasks/subtasks/${subId}`, payload);
export const deleteSubtask = (subId) => api.delete(`/tasks/subtasks/${subId}`);

// src/api/tasks.js
import api from "./client";

// GET tasks with backend-driven pagination, filtering, sorting, searching
// params: { page, pageSize, sortBy, sortOrder, status, dateFrom, dateTo, q }
export const getTasks = (params = {}) => api.get("/tasks", { params });

// CREATE a new task
export const createTask = (payload) => api.post("/tasks", payload);

// UPDATE a task (backend uses PATCH)
export const updateTask = (id, payload) => api.patch(`/tasks/${id}`, payload);

// DELETE a task
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

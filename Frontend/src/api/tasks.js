// src/api/tasks.js
import api from "./client";

// GET all tasks
export const getTasks = () => api.get("/tasks");

// CREATE a new task
export const createTask = (payload) => api.post("/tasks", payload);

// UPDATE a task
export const updateTask = (id, payload) => api.put(`/tasks/${id}`, payload);

// DELETE a task
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

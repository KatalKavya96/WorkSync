// src/api/projects.js
import api from "./client";

export const listProjects = () => api.get("/projects");
export const createProject = (payload) => api.post("/projects", payload);
export const inviteMember = (projectId, payload) => api.post(`/projects/${projectId}/invite`, payload);

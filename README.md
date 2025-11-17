### WorkSync – Team Task & Productivity Tracker
1. Problem Statement

Student teams and clubs juggle projects across chats, spreadsheets, and ad-hoc notes, which leads to missed deadlines, unclear ownership, and zero visibility into progress.
WorkSync provides a central hub for planning, assigning, and tracking tasks with real-time status, role-based access, and insights—so teams stay aligned and deliver on time.

2. System Architecture

Frontend (React + React Router) → Backend (Express REST API) → Database (PostgreSQL)

Hosting:
Frontend – Vercel
Backend – Render
Database – Aiven

3. Key Features
Authentication & Authorization

Signup/login

JWT

Roles (Admin/Manager/Member)

Project Workspace

Create projects

Invite members

Set permissions

Task Management

CRUD tasks

Subtasks

Due dates

Priorities

Tags

Filtration & Sorting

Filter tasks by status, priority, due date, assigned member, and tags

Sort tasks by due date, priority, creation time, or alphabetical order

Quick search bar to instantly find tasks across the project

Analytics

Burn-down chart

Completion percentage

4. Tech Stack

Frontend: React.js, React Router, TailwindCSS
Backend: Node.js, Express.js
Database: MySQL + Prisma ORM
Authentication: JWT (Access + Refresh), Google OAuth
Hosting: Vercel (Frontend), Render (Backend), Aiven (DB)

5. API Overview

| Endpoint                             | Method | Description                           |
|--------------------------------------|--------|---------------------------------------|
| /api/auth/signup                     | POST   | Register new user                     |
| /api/auth/login                      | POST   | Authenticate user                     |
| /api/projects                        | POST   | Create new project                    |
| /api/tasks                           | GET    | List all tasks (with filters & sorting) |
| /api/tasks/:id                       | PUT    | Update task                           |
| /api/analytics/:projectId/summary    | GET    | Fetch analytics summary               |
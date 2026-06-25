🚀 Taskflow — Project Management Tool

A full-stack project management application for creating, organizing, and tracking tasks across multiple projects with a modern Kanban-style workflow.

✨ Features
🔐 User authentication (JWT-based login/register)
📁 Create, update, and delete projects
✅ Task management with status tracking (Todo / In Progress / Done)
👥 Assign tasks to users
📊 Project-wise task overview and stats
🎯 Role-based access control
📱 Fully responsive UI for all devices
🛠️ Tech Stack

Frontend

React
React Router
Context API
Axios

Backend

Node.js
Express.js
JWT Authentication
REST APIs

Database

MongoDB (MongoDB Atlas)

Deployment

Frontend: Netlify
Backend: Render
📁 Project Structure
taskflow/
├── frontend/        # React application
├── backend/         # Node.js + Express API
├── render.yaml      # Backend deployment config
└── .gitlab-ci.yml   # CI/CD pipeline (optional)
📡 API Overview
🔐 Auth
POST /api/auth/register → Register user
POST /api/auth/login → Login user
GET /api/auth/me → Get profile
📁 Projects
GET /api/projects → Get all projects
POST /api/projects → Create project
PATCH /api/projects/:id → Update project
DELETE /api/projects/:id → Delete project
✅ Tasks
GET /api/tasks → Get tasks
POST /api/tasks → Create task
PATCH /api/tasks/:id → Update task
DELETE /api/tasks/:id → Delete task
🚀 Future Improvements
Drag & drop Kanban board
Real-time updates (Socket.io)
Notifications system
Team collaboration features

# 🚀 Taskflow — Project Management Tool

A full-stack project management application for creating, organizing, and tracking tasks across multiple projects with a modern Kanban-style workflow.

---

## ✨ Features

- 🔐 User authentication (JWT-based login/register)
- 📁 Create, update, and delete projects
- ✅ Task management with status tracking (Todo / In Progress / Done)
- 👥 Assign tasks to users
- 📊 Project-wise task overview and stats
- 🎯 Role-based access control
- 📱 Fully responsive UI for all devices

---

## 🛠️ Tech Stack

### Frontend
- React
- React Router
- Context API
- Axios

### Backend
- Node.js
- Express.js
- JWT Authentication
- REST APIs

### Database
- MongoDB (MongoDB Atlas)

### Deployment
- Frontend: [Netlify](https://netlify.com)
- Backend: [Render](https://render.com)

---

## 📁 Project Structure

```bash
taskflow/
├── frontend/
├── backend/
├── render.yaml
└── .gitlab-ci.yml
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/shivaykapoor24/Taskflow.git
cd taskflow

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Running Locally

```bash
# Start backend
cd backend
npm run dev

# Start frontend (in a new terminal)
cd frontend
npm run dev
```

---

## 📡 API Overview

### 🔐 Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user info |

### 📁 Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create a new project |
| PATCH | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

### ✅ Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a new task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

---

## 🔮 Future Improvements

- [ ] Drag & drop Kanban board
- [ ] Real-time updates (Socket.io)
- [ ] Notifications system
- [ ] Team collaboration features

---

// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { PageLoader } from './components/UI';
import AuthPage      from './components/Auth/AuthPage';
import AppLayout     from './components/Layout/AppLayout';
import Dashboard     from './components/Dashboard/Dashboard';
import CalendarPage  from './components/Dashboard/CalendarPage';
import ProjectsPage  from './components/Projects/ProjectsPage';
import BoardPage     from './components/Projects/BoardPage';
import MyTasksPage   from './components/Tasks/MyTasksPage';

// Route guard: redirect to /login if not authenticated
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

// Route guard: redirect to / if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />

            {/* Private — all wrapped in AppLayout sidebar */}
            <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="board/:projectId" element={<BoardPage />} />
              <Route path="my-tasks" element={<MyTasksPage />} />
              <Route path="calendar" element={<CalendarPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

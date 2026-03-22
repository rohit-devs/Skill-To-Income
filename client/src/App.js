import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage            from './pages/HomePage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import TasksPage           from './pages/TasksPage';
import TaskDetailPage      from './pages/TaskDetailPage';
import PostTaskPage        from './pages/PostTaskPage';
import MyTasksPage         from './pages/MyTasksPage';
import EarningsPage        from './pages/EarningsPage';
import LeaderboardPage     from './pages/LeaderboardPage';
import ProfilePage         from './pages/ProfilePage';
import AdminDashboard      from './pages/AdminDashboard';
import AssessmentsListPage from './pages/AssessmentsListPage';
import AssessmentPage      from './pages/AssessmentPage';
import AnalyticsPage       from './pages/AnalyticsPage';
import PortfolioPage       from './pages/PortfolioPage';
import OAuthSuccess        from './pages/OAuthSuccess';
import ReviewQueuePage     from './pages/ReviewQueuePage';
import { DisputeListPage, DisputeDetailPage } from './pages/DisputePages';

import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"              element={<HomePage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/tasks"         element={<TasksPage />} />
          <Route path="/tasks/:id"     element={<TaskDetailPage />} />
          <Route path="/leaderboard"   element={<LeaderboardPage />} />
          <Route path="/portfolio/:id" element={<PortfolioPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Student */}
          <Route path="/my-tasks"   element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
          <Route path="/earnings"   element={<ProtectedRoute roles={['student']}><EarningsPage /></ProtectedRoute>} />
          <Route path="/assessments" element={<ProtectedRoute roles={['student']}><AssessmentsListPage /></ProtectedRoute>} />
          <Route path="/assessments/:skill" element={<ProtectedRoute roles={['student']}><AssessmentPage /></ProtectedRoute>} />
          <Route path="/review"     element={<ProtectedRoute roles={['student','admin']}><ReviewQueuePage /></ProtectedRoute>} />

          {/* Business */}
          <Route path="/post-task"  element={<ProtectedRoute roles={['business','company']}><PostTaskPage /></ProtectedRoute>} />
          <Route path="/analytics"  element={<ProtectedRoute roles={['business','company']}><AnalyticsPage /></ProtectedRoute>} />

          {/* All logged in */}
          <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/disputes"     element={<ProtectedRoute><DisputeListPage /></ProtectedRoute>} />
          <Route path="/disputes/:id" element={<ProtectedRoute><DisputeDetailPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ textAlign:'center', padding:'100px 20px' }}>
              <div style={{ fontSize:64, marginBottom:16 }}>🔍</div>
              <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>Page not found</h2>
              <p style={{ color:'var(--ink-3)', marginBottom:24 }}>The page you're looking for doesn't exist.</p>
              <a href="/"><button className="btn btn-primary">Back to home</button></a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

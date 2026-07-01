import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage          from './pages/HomePage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import TasksPage         from './pages/TasksPage';
import TaskDetailPage    from './pages/TaskDetailPage';
import PostTaskPage      from './pages/PostTaskPage';
import MyTasksPage       from './pages/MyTasksPage';
import EarningsPage      from './pages/EarningsPage';
import LeaderboardPage   from './pages/LeaderboardPage';
import ProfilePage       from './pages/ProfilePage';
import PortfolioPage     from './pages/PortfolioPage';
import AssessmentsListPage from './pages/AssessmentsListPage';
import AssessmentPage    from './pages/AssessmentPage';
import AnalyticsPage     from './pages/AnalyticsPage';
import OAuthSuccess      from './pages/OAuthSuccess';
import ReviewQueuePage   from './pages/ReviewQueuePage';
import TaskTestPage      from './pages/TaskTestPage';
import AITestReviewPage  from './pages/AITestReviewPage';
import { DisputeListPage, DisputeDetailPage } from './pages/DisputePages';
import PricingPage       from './pages/PricingPage';

import StudentHome from './pages/student/StudentHome';
import BusinessHome from './pages/business/BusinessHome';
import AdminHome from './pages/admin/AdminHome';
import SeniorHome from './pages/senior/SeniorHome';

import './index.css';

function NavbarWrapper() {
  const location = useLocation();
  const hideOnPaths = ['/student', '/senior', '/admin', '/business', '/my-tasks', '/earnings', '/profile', '/analytics', '/ai-test-review', '/review', '/post-task', '/disputes'];
  const showNavbar = !hideOnPaths.some(path => location.pathname.startsWith(path));

  return showNavbar ? <Navbar /> : null;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <NavbarWrapper />
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
          <Route path="/pricing"       element={<PricingPage />} />

          {/* Student */}
          <Route path="/student"            element={<ProtectedRoute roles={['student']}><StudentHome /></ProtectedRoute>} />
          <Route path="/my-tasks"           element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
          <Route path="/earnings"           element={<ProtectedRoute roles={['student']}><EarningsPage /></ProtectedRoute>} />
          <Route path="/assessments"        element={<ProtectedRoute roles={['student']}><AssessmentsListPage /></ProtectedRoute>} />
          <Route path="/assessments/:skill" element={<ProtectedRoute roles={['student']}><AssessmentPage /></ProtectedRoute>} />
          <Route path="/review"             element={<ProtectedRoute><ReviewQueuePage /></ProtectedRoute>} />
          <Route path="/tasks/:taskId/test" element={<ProtectedRoute roles={['student']}><TaskTestPage /></ProtectedRoute>} />

          {/* Senior panel — dedicated dashboard */}
          <Route path="/senior"         element={<ProtectedRoute><SeniorHome /></ProtectedRoute>} />
          <Route path="/ai-test-review" element={<ProtectedRoute><AITestReviewPage /></ProtectedRoute>} />

          {/* Business */}
          <Route path="/business"   element={<ProtectedRoute roles={['business','company']}><BusinessHome /></ProtectedRoute>} />
          <Route path="/post-task"  element={<ProtectedRoute roles={['business','company']}><PostTaskPage /></ProtectedRoute>} />
          <Route path="/analytics"  element={<ProtectedRoute roles={['business','company']}><AnalyticsPage /></ProtectedRoute>} />

          {/* All logged in */}
          <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/disputes"     element={<ProtectedRoute><DisputeListPage /></ProtectedRoute>} />
          <Route path="/disputes/:id" element={<ProtectedRoute><DisputeDetailPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminHome /></ProtectedRoute>} />

          <Route path="*" element={
            <div style={{ textAlign:'center', padding:'100px 20px', background:'var(--bg)', minHeight:'100vh' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
              <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>Page not found</h2>
              <p style={{ color:'var(--on-sv)', marginBottom:24 }}>The page you're looking for doesn't exist.</p>
              <a href="/"><button className="btn btn-primary">Back to home</button></a>
            </div>
          }/>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

// ----------------------------------------------------------------------
// File: client/src/components/layout/ProtectedRoute.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: react, react-router-dom, AuthContext, shared UI.
// Used By: React client application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <div className="spinner-wrap"><div className="spinner" /></div>;
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;

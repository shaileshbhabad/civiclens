import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page and preserve return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role)) {
      // User doesn't have required role, redirect to appropriate default dashboard
      if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user?.role === 'authority') {
        return <Navigate to="/authority/dashboard" replace />;
      } else {
        return <Navigate to="/citizen/dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;

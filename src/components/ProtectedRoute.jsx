import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
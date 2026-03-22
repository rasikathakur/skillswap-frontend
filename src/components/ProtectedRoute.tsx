import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Check if access token exists in localStorage
  const accessToken = localStorage.getItem('access_token');

  // If no token, redirect to signin
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  // Token exists, render the protected component
  return <>{children}</>;
}

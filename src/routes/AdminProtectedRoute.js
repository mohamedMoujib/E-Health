import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSelector } from "react-redux";

const AdminProtectedRoute = () => {
  const { accessToken, role, loading } = useAuth();
  const location = useLocation();
  const authRole = useSelector(state => state.auth.role); // Get role from Redux store as backup
  
  // While authentication is being checked, show loading
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Store the current location to redirect back after login if needed
  const from = location.pathname || "/admin";
  
  // Check if user is authenticated
  if (!accessToken) {
    console.log("No access token found, redirecting to signin");
    return <Navigate to="/signin" state={{ from }} replace />;
  }
  
  // Check if user has admin role (first from context, then from Redux as fallback)
  const effectiveRole = role || authRole;
  const isAdmin = effectiveRole === "admin";
  
  if (!isAdmin) {
    console.log("User is not an admin (role:", effectiveRole, "), redirecting to dashboard");
    // Redirect to dashboard if authenticated but not an admin
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log("User is authenticated and is an admin, rendering admin routes");
  // User is authenticated and is an admin, render the child routes
  return <Outlet />;
};

export default AdminProtectedRoute;
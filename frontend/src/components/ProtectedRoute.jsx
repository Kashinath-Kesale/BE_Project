import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to the appropriate dashboard if role doesn't match
    if (userRole === "recruiter") return <Navigate to="/recruiter/dashboard" replace />;
    if (userRole === "candidate") return <Navigate to="/candidate/dashboard" replace />;
    if (userRole === "admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}



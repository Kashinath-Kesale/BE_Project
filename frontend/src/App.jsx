import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import RecruiterDashboardLayout from "./layouts/RecruiterDashboardLayout";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";

// --- Page Imports ---
// (Assuming these files exist at the specified paths based on your project structure)

// Auth & Public Pages
import Welcome from "./pages/Welcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CheckEmail from "./pages/auth/CheckEmail";
import Verify from "./pages/auth/Verify";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";


// Candidate Pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import Profile from "./pages/candidate/Profile";
import Jobs from "./pages/candidate/Jobs";
import Applications from "./pages/candidate/Applications";
import Settings from "./pages/candidate/Settings";

// Recruiter Pages
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import RecruiterProfile from "./pages/recruiter/Profile";
import RecruiterJobs from "./pages/recruiter/MyJobs";
import CreateJob from "./pages/recruiter/CreateJob";
import Applicants from "./pages/recruiter/Applicants";
import RecruiterSettings from "./pages/recruiter/Settings";
import AdminDashboard from "./pages/admin/Dashboard";

// --- Utility Components ---
import ProtectedRoute from "./components/ProtectedRoute";


// --- Main App Component ---
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* --- Candidate Dashboard Routes --- */}
        <Route
          path="/candidate" // Using a specific path for the candidate section
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} /> {/* Renders at /candidate */}
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="applications" element={<Applications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* --- Recruiter Dashboard Routes --- */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RecruiterDashboard />} /> {/* Renders at /recruiter */}
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="profile" element={<RecruiterProfile />} />
          <Route path="my-jobs" element={<RecruiterJobs />} />
          <Route path="create-job" element={<CreateJob />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="applicants/:jobId" element={<Applicants />} /> {/* For filtering by job */}
          <Route path="settings" element={<RecruiterSettings />} />
        </Route>

        {/* --- Admin Dashboard Routes --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Optional: Add a catch-all 404 route */}
        <Route path="*" element={<div className="p-8 text-center"><h2>404: Page Not Found</h2></div>} />
      </Routes>
    </>
  );
}


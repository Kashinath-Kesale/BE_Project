// RecruiterDashboardLayout.jsx

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import RecruiterSidebar from "./RecruiterSidebar.jsx";
import Navbar from "./Navbar.jsx";
import { LayoutGrid, Users, Briefcase, PlusSquare, User, Settings } from "lucide-react";

const RecruiterDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // 1. DEFINE the links array here
  const recruiterLinks = [
    { name: "Dashboard", icon: <LayoutGrid size={20} />, path: "/recruiter/dashboard" },
    { name: "Applicants", icon: <Users size={20} />, path: "/recruiter/applicants" },
    { name: "My Jobs", icon: <Briefcase size={20} />, path: "/recruiter/my-jobs" },
    { name: "Create Job", icon: <PlusSquare size={20} />, path: "/recruiter/create-job" },
    { name: "Profile", icon: <User size={20} />, path: "/recruiter/profile" },
    { name: "Settings", icon: <Settings size={20} />, path: "/recruiter/settings" },
  ];

  // 2. FIND the current page title (same logic as before)
  const currentPage = recruiterLinks.find(link => link.path === location.pathname);
  const pageTitle = currentPage ? currentPage.name : "";

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      {/* 3. PASS the links array as a prop to the sidebar */}
      <RecruiterSidebar 
        isOpen={isSidebarOpen} 
        toggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        links={recruiterLinks} 
      />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-60" : "md:ml-20"}`}>
        <Navbar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          role="recruiter"
        />

        <main className="p-4 sm:p-6 lg:p-8 pt-20">
          
          {/* 4. ADD the dynamic header */}
          {pageTitle && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboardLayout;
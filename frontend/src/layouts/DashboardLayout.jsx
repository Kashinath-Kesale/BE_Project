// src/layouts/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

const DashboardLayout = () => {
  // Start with sidebar closed by default (user must click hamburger to open)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main content */}
      <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? "md:ml-56" : "md:ml-20"}`}>
        <Navbar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          role="candidate"
        />

        <main className="p-6 pt-20 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

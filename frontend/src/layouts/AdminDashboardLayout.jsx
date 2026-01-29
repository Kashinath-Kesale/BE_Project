import { useState } from "react";
import { Outlet } from "react-router-dom";
import RecruiterSidebar from "../layouts/RecruiterSidebar.jsx";
import Navbar from "../layouts/Navbar.jsx";
import { LayoutGrid } from "lucide-react";

const AdminDashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const adminLinks = [
        { name: "Dashboard", icon: <LayoutGrid size={20} />, path: "/admin/dashboard" },
    ];

    return (
        <div className="flex bg-gray-50/50 min-h-screen">
            <RecruiterSidebar
                isOpen={isSidebarOpen}
                toggle={() => setIsSidebarOpen(!isSidebarOpen)}
                links={adminLinks}
            />

            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-60" : "md:ml-20"}`}>
                <Navbar
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    role="admin"
                />

                <main className="p-4 sm:p-6 lg:p-8 mt-16">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;

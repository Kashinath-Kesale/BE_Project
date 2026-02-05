// src/layouts/Sidebar.jsx
import { Home, User, Briefcase, FileText, Settings, Menu, X } from "lucide-react";
import Logo from "../components/Logo";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Sidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const links = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/candidate/dashboard" },
    { name: "Profile", icon: <User size={20} />, path: "/candidate/profile" },
    { name: "Jobs", icon: <Briefcase size={20} />, path: "/candidate/jobs" },
    { name: "Applications", icon: <FileText size={20} />, path: "/candidate/applications" },
    { name: "Settings", icon: <Settings size={20} />, path: "/candidate/settings" },
  ];

  return (
    <>
      {/* Overlay for mobile when open */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-40"
          onClick={toggle}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 flex flex-col transition-all duration-300 overflow-visible ${isMobile
          ? (isOpen ? "translate-x-0 w-46" : "-translate-x-full w-46")
          : (isOpen ? "w-56" : "w-20")
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b">
          {isOpen ? (
            <>
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Logo className="text-white w-[18px] h-[18px]" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">Shortlist</h1>
              </div>
              {/* Toggle button when open */}
              <button
                onClick={toggle}
                className="rounded hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
                aria-label="Close sidebar"
                title="Close"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            /* Toggle button when closed - only hamburger icon */
            <button
              onClick={toggle}
              className="rounded hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
              aria-label="Open sidebar"
              title="Open"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-visible">
          {links.map((link) => {
            const active = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (isMobile) {
                    toggle();
                  }
                }}
                className={`group relative flex items-center ${isOpen ? "gap-3" : "justify-center"
                  } p-2 rounded-lg transition ${active
                    ? "bg-blue-100 text-blue-600 border-l-4 border-blue-600"
                    : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                {link.icon}
                {isOpen && <span>{link.name}</span>}

                {/* Styled tooltip when collapsed (all sizes) */}
                {!isOpen && (
                  <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg group-hover:opacity-100 z-[60]">
                    {link.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

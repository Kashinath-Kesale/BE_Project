// src/layouts/Navbar.jsx
import { Bell, Search, Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";

const Navbar = ({ toggleSidebar, role }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userName, setUserName] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔒 HARD GUARD: only fetch candidate profile on candidate pages
    if (role !== "candidate") return;

    const fetchCandidateProfile = async () => {
      try {
        const res = await api.get("/candidate/profile");
        const candidate = res.data?.candidate;

        if (candidate?.avatarUrl) {
          setUserAvatar(
            candidate.avatarUrl.startsWith("http")
              ? candidate.avatarUrl
              : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${candidate.avatarUrl}`
          );
        }

        setUserName(candidate?.userId?.name || candidate?.name || "");
      } catch {
        console.log("Could not load candidate profile");
      }
    };

    fetchCandidateProfile();
  }, [role]);

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow flex items-center justify-between px-4 z-40">
      {/* Left */}
      <button onClick={toggleSidebar} className="md:hidden">
        <Menu />
      </button>

      {/* Center */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-1/2">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border rounded-lg pl-10"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6 relative">
        <Bell />

        <div className="relative">
          <div
            className="w-10 h-10 rounded-full border bg-gray-100 cursor-pointer flex items-center justify-center"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {userAvatar && !avatarError ? (
              <img
                src={userAvatar}
                alt="user"
                className="w-full h-full rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : userName ? (
              <span className="text-sm font-semibold text-gray-600">
                {userName
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            ) : (
              <User size={20} className="text-gray-400" />
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg p-2">
              {role === "candidate" && (
                <>
                  <Link
                    to="/candidate/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/candidate/settings"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                </>
              )}

              {role === "recruiter" && (
                <>
                  <Link
                    to="/recruiter/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/recruiter/settings"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                </>
              )}

              {role === "admin" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                </>
              )}

              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api.js";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function ProfileCard() {
  const location = useLocation();
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/candidate/profile");
      setProfile(data);
      setError(""); // Clear any previous errors
      const fetchedName = data?.candidate?.userId?.name || data?.candidate?.name;
      if (fetchedName) {
        localStorage.setItem("name", fetchedName);
      }
    } catch (err) {
      console.error("Profile load error:", err);
      // Only show error for actual server errors, not 404 (which means no profile yet)
      if (err?.response?.status !== 404) {
        setError("Failed to load profile");
      } else {
        // For 404, set empty profile with 0% completion
        setProfile({
          candidate: { userId: { name: localStorage.getItem("name") || "User" } },
          profileCompletion: 0
        });
      }
    }
  };

  // Refresh profile on mount and when route changes (e.g., returning to dashboard)
  useEffect(() => {
    fetchProfile();
  }, [location.pathname]);

  // Also refresh when window gains focus (user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchProfile();
    };

    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const candidate = profile?.candidate;
  const userName = candidate?.userId?.name || candidate?.name || "User";
  const initials =
    userName && userName.trim().length > 0
      ? userName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
      : "U";
  const hasAvatar = candidate?.avatarUrl;
  const completion = profile?.profileCompletion ?? 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center">
      {/* ✅ Avatar */}
      <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200 shadow-md bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500">
        {hasAvatar && !avatarError ? (
          <img
            src={
              hasAvatar.startsWith("http")
                ? hasAvatar
                : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${hasAvatar}`
            }
            alt="Candidate Avatar"
            className="w-full h-full rounded-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-800">{userName}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {candidate?.branch || "Branch N/A"}
        {candidate?.education?.year ? ` • ${candidate.education.year}` : ""}
      </p>

      {error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.8 }}
              className="bg-indigo-600 h-2.5 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-600 mb-4">
            {completion}% Profile Completion
          </p>
        </>
      )}

      <Link
        to="/candidate/profile"
        className="block w-full px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
      >
        View Profile
      </Link>
    </div>
  );
}

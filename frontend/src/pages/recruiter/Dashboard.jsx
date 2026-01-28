import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Briefcase,
  Users,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Reusable Components
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-5 transition-transform hover:-translate-y-1">
    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const ApplicantRow = ({ name, jobTitle, status }) => {
  const statusStyles = {
    shortlisted: "bg-blue-100 text-blue-700",
    applied: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl mb-3 shadow-sm hover:shadow-md">
      <div className="flex items-center gap-4">
        <img
          src={`https://ui-avatars.com/api/?name=${name}&background=random`}
          alt={name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{jobTitle}</p>
        </div>
      </div>
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-700"
          }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const navigate = useNavigate();
  const [recruiter, setRecruiter] = useState(null);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, shortlisted: 0, hired: 0 });
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  // Fetch recruiter profile, stats, and recent applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        let profileRes;
        try {
          // We allow this to fail with 404 (handled below), but 401 will bubble up to interceptor
          profileRes = await api.get("/recruiters/profile");
        } catch (err) {
          if (err.response && err.response.status === 404) {
            setNeedsProfile(true);
            setLoading(false);
            return;
          }
          throw err; // Re-throw 401s and other errors
        }

        if (!profileRes || !profileRes.data) {
          setNeedsProfile(true);
          setLoading(false);
          return;
        }

        setRecruiter(profileRes.data);

        // Fetch stats only if profile exists. 
        // We let these fail naturally OR handle them. 
        // If 401 happens here, interceptor catches it.
        const [statsRes, recentRes] = await Promise.all([
          api.get("/recruiters/stats"), // Removed .catch() to allow 401 propagation
          api.get("/recruiters/recent-applications") // Removed .catch() to allow 401 propagation
        ]);

        if (statsRes) setStats(statsRes.data);
        if (recentRes) setRecentApplicants(recentRes.data);

      } catch (error) {
        // 401s are handled by interceptor (redirects).
        // For other errors, we just log them.
        console.error("Dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (needsProfile) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Recruiter Dashboard</h1>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-8 rounded-r-xl shadow-sm max-w-2xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-yellow-500 mt-1" size={32} />
            <div>
              <h3 className="text-xl font-bold text-yellow-800 mb-2">Profile Pending</h3>
              <p className="text-yellow-700 mb-6">
                Welcome to Resume Analyzer! To start posting jobs and managing applicants, you need to complete your recruiter profile first.
              </p>
              <button
                onClick={() => navigate("/recruiter/profile")}
                className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition shadow-md"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Recruiter Dashboard
      </h1>

      {/* Status Banner */}
      {recruiter?.status === "pending" && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-xl">
          Your recruiter profile is under admin review.
        </div>
      )}

      {recruiter?.status === "approved" && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl">
          Your recruiter profile is approved. You can post jobs now.
        </div>
      )}

      {recruiter?.status === "rejected" && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl">
          Your recruiter profile was rejected by admin.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Briefcase size={28} className="text-white" />}
          title="Active Jobs"
          value={stats.activeJobs}
          color="bg-indigo-500"
        />
        <StatCard
          icon={<Users size={28} className="text-white" />}
          title="Total Applicants"
          value={stats.totalApplicants}
          color="bg-sky-500"
        />
        <StatCard
          icon={<FileText size={28} className="text-white" />}
          title="Shortlisted"
          value={stats.shortlisted}
          color="bg-amber-500"
        />
        <StatCard
          icon={<CheckCircle size={28} className="text-white" />}
          title="Hired"
          value={stats.hired}
          color="bg-emerald-500"
        />
      </div>

      {/* Recent Applicants */}
      <div>
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Recent Applicants
        </h2>
        {recentApplicants.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-md text-center text-gray-500">
            No applicants yet. Post a job to get started!
          </div>
        ) : (
          <div className="bg-white p-4 rounded-2xl shadow-md">
            {recentApplicants.map((a, i) => (
              <ApplicantRow key={i} {...a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

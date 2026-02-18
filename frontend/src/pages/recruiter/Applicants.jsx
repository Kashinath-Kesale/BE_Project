import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api";
import {
  Filter,
  ChevronDown,
  Check,
  X,
  Star,
  Briefcase,
  User,
  Loader2,
  FileText,
  ExternalLink
} from "lucide-react";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const map = {
    applied: { cls: "bg-yellow-100 text-yellow-800", icon: <User size={14} /> },
    shortlisted: { cls: "bg-blue-100 text-blue-800", icon: <Star size={14} /> },
    rejected: { cls: "bg-red-100 text-red-800", icon: <X size={14} /> },
    hired: { cls: "bg-green-100 text-green-800", icon: <Check size={14} /> },
  };

  const cfg = map[status] || { cls: "bg-gray-100 text-gray-800" };

  return (
    <span className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${cfg.cls}`}>
      {cfg.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function Applicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "all" });
  const [activeMenu, setActiveMenu] = useState(null);


  const handleViewResume = (url) => {
    if (!url) {
      toast.info("No resume available for this candidate.");
      return;
    }
    const fullUrl = url.startsWith("http") ? url : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${url}`;
    window.open(fullUrl, "_blank");
  };

  // Fetch applicants
  useEffect(() => {
    // Reset state when jobId changes
    setApplications([]);
    setLoading(true);

    const endpoint = jobId ? `/applications/job/${jobId}` : `/applications/recruiter`;

    api
      .get(endpoint)
      .then((res) => {
        // Backend returns { applications: [...] }
        const apps = res.data.applications || [];
        setApplications(apps);
      })
      .catch((err) => {
        console.error("Failed to fetch applicants", err);
        setApplications([]);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
      toast.success(`Candidate status updated to ${status}`);
      setActiveMenu(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const filteredApplications =
    filters.status === "all"
      ? applications
      : applications.filter((a) => a.status === filters.status);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="p-1 min-h-[500px]">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {jobId ? "Job Applicants" : "All Applicants"}
      </h1>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow">
        <Filter size={18} className="text-gray-500" />
        <select
          onChange={(e) => setFilters({ status: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
        <div className="ml-auto text-sm text-gray-500">
          Total: {filteredApplications.length}
        </div>
      </div>

      {/* Table - Only show if we have data */}
      <div className="bg-white rounded-2xl shadow">
        {filteredApplications.length > 0 ? (
          <>
            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-visible min-h-[300px]">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Match</th> {/* Added Match Column */}
                    <th className="px-6 py-4">Job Role</th>
                    <th className="px-6 py-4">Applied On</th>
                    <th className="px-6 py-4">Resume</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.candidate?.avatarUrl || `https://ui-avatars.com/api/?name=${app.candidate?.name || 'User'}&background=random`}
                            alt={app.candidate?.name || 'Unknown'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            {app.candidate?.name || 'Unknown Candidate'}
                            <p className="text-xs text-gray-500">
                              {app.candidate?.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Match Score Badge */}
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${(app.matchScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                            (app.matchScore || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {app.matchScore || 0}%
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {app.jobId?.title || "Unknown Role"}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewResume(app.candidate?.resumeUrl)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                        >
                          <FileText size={16} /> View
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenu(activeMenu === app._id ? null : app._id)
                            }
                            className="text-indigo-600 font-semibold flex items-center gap-1 mx-auto px-3 py-1 hover:bg-indigo-50 rounded-lg transition"
                          >
                            Update <ChevronDown size={16} />
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenu === app._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-2xl z-50 ring-1 ring-black ring-opacity-5">
                              <div className="py-1">
                                <button
                                  onClick={() => handleStatusChange(app._id, "shortlisted")}
                                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                >
                                  <Star size={16} className="mr-2" /> Shortlist
                                </button>
                                <button
                                  onClick={() => handleStatusChange(app._id, "rejected")}
                                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition"
                                >
                                  <X size={16} className="mr-2" /> Reject
                                </button>
                                <button
                                  onClick={() => handleStatusChange(app._id, "hired")}
                                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                >
                                  <Check size={16} className="mr-2" /> Hire
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4 p-4">
              {filteredApplications.map((app) => (
                <div key={app._id} className="border rounded-xl p-4 bg-gray-50/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={app.candidate?.avatarUrl || `https://ui-avatars.com/api/?name=${app.candidate?.name || 'User'}&background=random`}
                        alt={app.candidate?.name || 'Unknown'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{app.candidate?.name || 'Unknown Candidate'}</div>
                        <div className="text-xs text-gray-500">{app.candidate?.email}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={app.status} />
                      <span className={`text-xs font-bold px-2 py-1 rounded-md 
                          ${(app.matchScore || 0) >= 80 ? 'bg-green-100 text-green-700' :
                          (app.matchScore || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {app.matchScore || 0}% Match
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Applied for: </span>
                    <span className="text-sm text-indigo-600 font-semibold">{app.jobId?.title || "Unknown Role"}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div>
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleViewResume(app.candidate?.resumeUrl)}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                    >
                      <FileText size={16} /> Resume
                    </button>
                  </div>

                  {/* Mobile Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(app._id, "shortlisted")}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${app.status === 'shortlisted' ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
                    >
                      <Star size={16} className="mb-1" /> Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusChange(app._id, "rejected")}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${app.status === 'rejected' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-700'}`}
                    >
                      <X size={16} className="mb-1" /> Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(app._id, "hired")}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${app.status === 'hired' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-700'}`}
                    >
                      <Check size={16} className="mb-1" /> Hire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">
              No Applicants Found
            </h3>
            {filters.status !== "all" ? (
              <p className="mt-2 text-gray-500">
                No applicants match the selected status logic.
              </p>
            ) : (
              <div className="mt-2 max-w-sm mx-auto text-gray-500">
                {jobId ? (
                  <p>This job hasn't received any applications yet. Consider promoting your job posting!</p>
                ) : (
                  <p>You haven't received any applications across your jobs yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

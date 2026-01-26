import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import {
  Filter,
  ChevronDown,
  Check,
  X,
  Star,
  Briefcase,
  User,
  Loader2
} from "lucide-react";

// --- Status Badge ---

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

// --- Main Component ---

export default function Applicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "all" });
  const [activeMenu, setActiveMenu] = useState(null);

  // Fetch applicants
  useEffect(() => {
    // Reset state when jobId changes to avoid showing old data
    setApplications([]);
    setLoading(true);

    api
      .get(`/applications/job/${jobId}`)
      .then((res) => {
        // Backend returns { applications: [...] }
        setApplications(res.data.applications || []);
      })
      .catch((err) => {
        console.error("Failed to fetch applicants", err);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
      setActiveMenu(null);
    } catch {
      alert("Failed to update status");
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
    <div className="p-1">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Applicants</h1>

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
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Applied On</th>
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
                          src={`https://i.pravatar.cc/40?u=${app.candidate?.email || 'default'}`}
                          alt={app.candidate?.name || 'Unknown'}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          {app.candidate?.name || 'Unknown Candidate'}
                          <p className="text-xs text-gray-500">
                            {app.candidate?.email || ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(activeMenu === app._id ? null : app._id)
                          }
                          className="text-indigo-600 font-semibold flex items-center gap-1 mx-auto"
                        >
                          Update <ChevronDown size={16} />
                        </button>

                        {activeMenu === app._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-xl z-20">
                            <button
                              onClick={() =>
                                handleStatusChange(app._id, "shortlisted")
                              }
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(app._id, "rejected")
                              }
                              className="w-full text-left px-4 py-3 hover:bg-red-50 text-gray-700 hover:text-red-700 transition"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleStatusChange(app._id, "hired")}
                              className="w-full text-left px-4 py-3 hover:bg-green-50 text-gray-700 hover:text-green-700 transition"
                            >
                              Hire
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Briefcase size={48} className="mx-auto text-gray-300" />
            <h3 className="mt-3 text-xl font-bold text-gray-800">
              No Applicants Found
            </h3>
            {filters.status !== "all" ? (
              <p className="mt-2 text-gray-500">Try changing your filters.</p>
            ) : (
              <p className="mt-2 text-gray-500">Wait for candidates to apply.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

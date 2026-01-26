import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Plus,
  MapPin,
  Briefcase,
  Clock,
  Users,
  MoreVertical,
  Eye,
  Trash2,
} from "lucide-react";

// --- Job Card ---

const JobCard = ({ job, onMenuClick, onDelete, navigate }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
        <p className="text-sm text-gray-500">{job.location}</p>
      </div>

      <div className="relative">
        <button
          onClick={() => onMenuClick(job._id)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <MoreVertical size={20} />
        </button>

        {job.menuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-10">
            <button
              onClick={() => navigate(`/recruiter/jobs/${job._id}/applicants`)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Eye size={16} /> View Applicants
            </button>
            <button
              onClick={() => onDelete(job._id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} /> Delete Job
            </button>
          </div>
        )}
      </div>
    </div>

    <div className="mt-4 pt-4 border-t text-sm text-gray-600 space-y-2">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-indigo-500" />
        {job.location}
      </div>

      {job.minExperience && (
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-indigo-500" />
          Min. Experience: {job.minExperience}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Clock size={16} className="text-indigo-500" />
        Posted on {new Date(job.createdAt).toLocaleDateString()}
      </div>
    </div>

    <div className="mt-4 flex items-center gap-3 bg-indigo-50 p-3 rounded-lg">
      <Users size={18} className="text-indigo-600" />
      <span className="font-semibold text-indigo-800">
        Applicants
      </span>
    </div>
  </div>
);

// --- Empty State ---

const EmptyState = ({ navigate }) => (
  <div className="text-center py-20 bg-white rounded-2xl shadow-md">
    <Briefcase size={60} className="mx-auto text-gray-300" />
    <h2 className="mt-4 text-2xl font-bold text-gray-800">
      No Jobs Posted Yet
    </h2>
    <p className="mt-2 text-gray-500">
      Create your first job posting to get started.
    </p>
    <button
      onClick={() => navigate("/recruiter/create-job")}
      className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 rounded-xl
      bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
    >
      <Plus size={20} />
      Create Job
    </button>
  </div>
);

// --- Main Component ---

export default function MyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recruiter jobs
  useEffect(() => {
    api
      .get("/jobs/my")
      .then((res) => {
        const jobsWithMenu = res.data.map((j) => ({
          ...j,
          menuOpen: false,
        }));
        setJobs(jobsWithMenu);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMenuClick = (id) => {
    setJobs((prev) =>
      prev.map((job) =>
        job._id === id
          ? { ...job, menuOpen: !job.menuOpen }
          : { ...job, menuOpen: false }
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((job) => job._id !== id));
    } catch {
      alert("Failed to delete job");
    }
  };

  if (loading) return <div className="p-6">Loading jobs...</div>;

  return (
    <div className="p-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          My Job Postings
        </h1>
        <button
          onClick={() => navigate("/recruiter/create-job")}
          className="flex items-center gap-2 px-5 py-2 rounded-xl
          bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
        >
          <Plus size={20} />
          Create Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <EmptyState navigate={navigate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onMenuClick={handleMenuClick}
              onDelete={handleDelete}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

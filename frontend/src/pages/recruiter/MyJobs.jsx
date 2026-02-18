import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  Edit2,
  X,
} from "lucide-react";

// Edit Job Modal
const EditJobModal = ({ isOpen, onClose, job, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    minExperience: "",
    description: "",
    keywords: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        location: job.location || "",
        minExperience: job.minExperience || "",
        description: job.description || "",
        keywords: Array.isArray(job.keywords) ? job.keywords.join(", ") : (job.keywords || ""),
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(job._id, {
        ...formData,
        keywords: formData.keywords.split(",").map(k => k.trim()).filter(k => k),
      });
      onClose();
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Edit Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="edit-job-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Experience (Years)</label>
                <input
                  type="number"
                  name="minExperience"
                  value={formData.minExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Design"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              ></textarea>
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-job-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ job, onMenuClick, onDelete, onEdit, navigate }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition relative">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-xl font-bold text-gray-800 line-clamp-1" title={job.title}>{job.title}</h3>
        <p className="text-sm text-gray-500">{job.location}</p>
      </div>

      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); onMenuClick(job._id); }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreVertical size={20} className="text-gray-600" />
        </button>

        {job.menuOpen && (
          <>
            <div className="fixed inset-0 z-0" onClick={() => onMenuClick(null)}></div>
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-20 py-1 ring-1 ring-black ring-opacity-5">
              <button
                onClick={() => { onMenuClick(null); navigate(`/recruiter/applicants/${job._id}`); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              >
                <Eye size={16} /> View Applicants
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMenuClick(null); onEdit(job); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <Edit2 size={16} /> Edit Job
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMenuClick(null); onDelete(job._id); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} /> Delete Job
              </button>
            </div>
          </>
        )}
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-2">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-indigo-500" />
        {job.location}
      </div>

      {job.minExperience && (
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-indigo-500" />
          Min. Experience: {job.minExperience} years
        </div>
      )}

      <div className="flex items-center gap-2">
        <Clock size={16} className="text-indigo-500" />
        Posted on {new Date(job.createdAt).toLocaleDateString()}
      </div>
    </div>

    <button
      onClick={() => navigate(`/recruiter/applicants/${job._id}`)}
      className="w-full mt-4 flex items-center justify-between bg-indigo-50 p-3 rounded-xl hover:bg-indigo-100 transition cursor-pointer text-left group"
    >
      <div className="flex items-center gap-3">
        <Users size={18} className="text-indigo-600 group-hover:text-indigo-700" />
        <span className="font-semibold text-indigo-800 group-hover:text-indigo-900">
          Applicants
        </span>
      </div>
      <Eye size={16} className="text-indigo-400 group-hover:text-indigo-600" />
    </button>
  </div>
);

// Empty State Component
const EmptyState = ({ navigate }) => (
  <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-gray-100">
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
      bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
    >
      <Plus size={20} />
      Create Job
    </button>
  </div>
);

export default function MyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Fetch recruiter jobs
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    setLoading(true);
    api
      .get("/jobs/my")
      .then((res) => {
        const jobsWithMenu = res.data.map((j) => ({
          ...j,
          menuOpen: false,
        }));
        setJobs(jobsWithMenu);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

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
    if (!window.confirm("Delete this job? This action cannot be undone.")) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((job) => job._id !== id));
      toast.success("Job deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete job");
    }
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleUpdateJob = async (id, updatedData) => {
    try {
      const res = await api.put(`/jobs/${id}`, updatedData);
      const updatedJob = res.data;

      setJobs(prev => prev.map(job => job._id === id ? { ...updatedJob, menuOpen: false } : job));
      toast.success("Job updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update job");
      throw err; // Re-throw to handle loading state in modal
    }
  };

  if (loading && jobs.length === 0) return <div className="p-8 text-center text-gray-500">Loading jobs...</div>;

  return (
    <div className="p-1">
      <EditJobModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        job={editingJob}
        onUpdate={handleUpdateJob}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Job Postings
          </h1>
          <p className="text-gray-500 mt-1">Manage your active job listings and view applicants.</p>
        </div>
        <button
          onClick={() => navigate("/recruiter/create-job")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
          bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={20} />
          Create Job
        </button>
      </div>

      {jobs.length === 0 && !loading ? (
        <EmptyState navigate={navigate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onMenuClick={handleMenuClick}
              onDelete={handleDelete}
              onEdit={handleEditClick}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

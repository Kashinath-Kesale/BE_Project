import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api";
import { Check } from "lucide-react";

// Reusable Components

const FormInput = ({ id, label, className = "", ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
    />
  </div>
);

const FormTextarea = ({ id, label, className = "", ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <textarea
      id={id}
      rows={5}
      {...props}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
    />
  </div>
);

const KeywordInput = ({ keywords, setKeywords, className = "" }) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const keyword = inputValue.trim();
      if (keyword && !keywords.includes(keyword)) {
        setKeywords([...keywords, keyword]);
      }
      setInputValue("");
    }
  };

  const removeKeyword = (k) => {
    setKeywords(keywords.filter((x) => x !== k));
  };

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Skills / Keywords
      </label>
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-300 rounded-lg min-h-[50px]">
        {keywords.map((k, i) => (
          <span
            key={i}
            className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm flex items-center gap-1"
          >
            {k}
            <button
              type="button"
              onClick={() => removeKeyword(k)}
              className="text-indigo-600 hover:text-indigo-800 font-bold"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type skill and press Enter"
          className="flex-grow bg-transparent outline-none px-1 text-sm"
        />
      </div>
    </div>
  );
};

const BranchSelector = ({ selectedBranches, onChange }) => {
  const OPTIONS = ["CS", "ENTC", "ME", "A&R"];

  const toggleBranch = (branch) => {
    if (selectedBranches.includes(branch)) {
      onChange(selectedBranches.filter((b) => b !== branch));
    } else {
      onChange([...selectedBranches, branch]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Eligible Branches</label>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((branch) => {
          const isSelected = selectedBranches.includes(branch);
          return (
            <button
              key={branch}
              type="button"
              onClick={() => toggleBranch(branch)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border
                ${isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
            >
              {isSelected && <Check size={14} />}
              {branch}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function CreateJob() {
  const navigate = useNavigate();

  const [recruiter, setRecruiter] = useState(null);
  const [job, setJob] = useState({
    title: "",
    description: "",
    location: "",
    minExperience: "",
    criteria: {
      minTenthPercent: "",
      minTwelfthPercent: "",
      minCgpa: "",
      eligibleBranches: [],
      gender: "Any"
    }
  });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch recruiter status
  useEffect(() => {
    api.get("/recruiters/profile").then((res) => {
      setRecruiter(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/jobs", {
        ...job,
        keywords: skills,
      });
      toast.success("Job posted successfully!");
      navigate("/recruiter/my-jobs");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  if (recruiter && recruiter.status !== "approved" && recruiter.status !== "pending") {
    return (
      <div className="p-6 bg-red-100 text-red-800 rounded-xl">
        Your profile is rejected. You cannot post jobs.
      </div>
    );
  }

  return (
    <div className="p-1 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500 mt-1">Create a comprehensive job listing to attract the best talent.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column: Job Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Job Details</h3>

            <FormInput
              id="title"
              label="Job Title"
              name="title"
              placeholder="e.g. Senior Frontend Engineer"
              value={job.title}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                id="location"
                label="Location"
                name="location"
                placeholder="e.g. Pune, Remote"
                value={job.location}
                onChange={handleChange}
                required
              />
              <FormInput
                id="minExperience"
                label="Experience"
                name="minExperience"
                placeholder="e.g. 2 Years"
                value={job.minExperience}
                onChange={handleChange}
              />
            </div>

            <KeywordInput keywords={skills} setKeywords={setSkills} />

            <div className="grid grid-cols-2 gap-4">
              <BranchSelector
                selectedBranches={job.criteria?.eligibleBranches || []}
                onChange={(branches) => setJob({ ...job, criteria: { ...job.criteria, eligibleBranches: branches } })}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender Preference</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={job.criteria?.gender || "Any"}
                  onChange={(e) => setJob({ ...job, criteria: { ...job.criteria, gender: e.target.value } })}
                >
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Descriptions & Criteria */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Requirements & Description</h3>

            <FormTextarea
              id="description"
              label="Job Description"
              name="description"
              placeholder="Detailed description of the role, responsibilities, and perks..."
              value={job.description}
              onChange={handleChange}
              required
            />

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-4">Academic Thresholds</h4>
              <div className="grid grid-cols-3 gap-3">
                <FormInput
                  id="minTenth"
                  label="10th %"
                  type="number"
                  placeholder="60"
                  value={job.criteria?.minTenthPercent || ""}
                  onChange={(e) => setJob({ ...job, criteria: { ...job.criteria, minTenthPercent: e.target.value } })}
                />
                <FormInput
                  id="minTwelfth"
                  label="12th %"
                  type="number"
                  placeholder="60"
                  value={job.criteria?.minTwelfthPercent || ""}
                  onChange={(e) => setJob({ ...job, criteria: { ...job.criteria, minTwelfthPercent: e.target.value } })}
                />
                <FormInput
                  id="minCgpa"
                  label="CGPA"
                  type="number"
                  step="0.1"
                  placeholder="7.5"
                  value={job.criteria?.minCgpa || ""}
                  onChange={(e) => setJob({ ...job, criteria: { ...job.criteria, minCgpa: e.target.value } })}
                />
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold text-lg
            hover:bg-indigo-700 transition shadow-lg hover:shadow-xl disabled:opacity-60 transform hover:-translate-y-0.5"
          >
            {loading ? "Posting Job..." : "Post Job Now"}
          </button>
        </div>
      </form>
    </div>
  );
}


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// Reusable Components

const FormInput = ({ id, label, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

const FormTextarea = ({ id, label, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <textarea
      id={id}
      rows={6}
      {...props}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

const KeywordInput = ({ keywords, setKeywords }) => {
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
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Skills / Keywords
      </label>
      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border rounded-lg">
        {keywords.map((k, i) => (
          <span
            key={i}
            className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm"
          >
            {k}
            <button
              type="button"
              onClick={() => removeKeyword(k)}
              className="ml-1 text-indigo-600"
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
          className="flex-grow bg-transparent outline-none px-1"
        />
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
  const [error, setError] = useState("");

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
    setError("");

    try {
      await api.post("/jobs", {
        ...job,
        keywords: skills,
      });
      navigate("/recruiter/my-jobs");
    } catch {
      setError("Failed to create job");
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
    <div className="p-1">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Job</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl"
      >
        <div className="grid grid-cols-1 gap-6">
          <FormInput
            id="title"
            label="Job Title"
            name="title"
            placeholder="e.g. Frontend Developer"
            value={job.title}
            onChange={handleChange}
            required
          />

          <FormTextarea
            id="description"
            label="Job Description"
            name="description"
            placeholder="Describe role and requirements"
            value={job.description}
            onChange={handleChange}
            required
          />

          <KeywordInput keywords={skills} setKeywords={setSkills} />

          <FormInput
            id="location"
            label="Location"
            name="location"
            placeholder="Remote / City"
            value={job.location}
            onChange={handleChange}
            required
          />

          <FormInput
            id="minExperience"
            label="Minimum Experience (optional)"
            name="minExperience"
            placeholder="e.g. 2 years"
            value={job.minExperience}
            onChange={handleChange}
          />

          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
            <h3 className="font-bold text-gray-800">Eligibility Criteria</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                id="minTenth"
                label="Min Class X %"
                type="number"
                value={job.criteria?.minTenthPercent || ""}
                onChange={(e) => setJob({ ...job, criteria: { ...job.criteria, minTenthPercent: e.target.value } })}
              />
              <FormInput
                id="minTwelfth"
                label="Min Class XII %"
                type="number"
                value={job.criteria?.minTwelfthPercent || ""}
                onChange={(e) => setJob({ ...job, criteria: { ...job.criteria, minTwelfthPercent: e.target.value } })}
              />
              <FormInput
                id="minCgpa"
                label="Min CGPA"
                type="number"
                step="0.1"
                value={job.criteria?.minCgpa || ""}
                onChange={(e) => setJob({ ...job, criteria: { ...job.criteria, minCgpa: e.target.value } })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Eligible Branches (comma separated)</label>
                <input
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="CS, IT, ENTC"
                  value={job.criteria?.eligibleBranches?.join(", ") || ""}
                  onChange={(e) => setJob({
                    ...job,
                    criteria: {
                      ...job.criteria,
                      eligibleBranches: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender Preference</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold
            hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Posting Job..." : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
}

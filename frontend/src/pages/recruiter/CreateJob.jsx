import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// --- Reusable Components ---

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

// --- Main Component ---

export default function CreateJob() {
  const navigate = useNavigate();

  const [recruiter, setRecruiter] = useState(null);
  const [job, setJob] = useState({
    title: "",
    description: "",
    location: "",
    minExperience: "",
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

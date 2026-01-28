import React, { useEffect, useState } from "react";
import api from "../services/api";

function JobCard({ title, company, pct }) {
  return (
    <div className="glass p-4 rounded-xl flex items-center justify-between hover:scale-[1.01] transition">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-white/60">{company}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{pct}%</div>
        <div className="text-xs text-white/60">Match</div>
      </div>
    </div>
  );
}

export default function JobsList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/candidate/jobs");
        // data: [{ job, matchPercentage }]
        const mapped = (data || []).map((j) => ({
          id: j.job._id,
          title: j.job.title,
          company: j.job.companyName || "",
          pct: j.matchPercentage ?? 0,
        }));
        if (mounted) setJobs(mapped);
      } catch {
        if (mounted) setError("Failed to load jobs");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <div className="glass p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">Job Matches</div>
        <div className="text-xs text-white/60">Based on resume</div>
      </div>

      {loading ? (
        <div className="text-xs text-white/60">Loading...</div>
      ) : error ? (
        <div className="text-xs text-red-400">{error}</div>
      ) : (
        <div className="grid gap-3">
          {jobs.length === 0 ? (
            <div className="text-xs text-white/60">No jobs found</div>
          ) : (
            jobs.map((j) => <JobCard key={j.id} {...j} />)
          )}
        </div>
      )}
    </div>
  );
}

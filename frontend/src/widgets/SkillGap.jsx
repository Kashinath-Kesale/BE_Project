import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function SkillGap() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidateKeywords, setCandidateKeywords] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [profileRes, jobsRes] = await Promise.all([
          api.get("/candidate/profile"),
          api.get("/candidate/jobs"),
        ]);
        if (!mounted) return;
        setCandidateKeywords(profileRes.data?.candidate?.keywords || []);
        setJobs(jobsRes.data || []);
      } catch {
        if (mounted) setError("Failed to load suggestions");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const gaps = useMemo(() => {
    if (!jobs?.length) return [];
    const candSet = new Set((candidateKeywords || []).map(k => String(k).toLowerCase()));

    // collect keyword counts across top jobs (limit 20)
    const freq = new Map();
    for (const item of jobs.slice(0, 20)) {
      const jk = (item?.job?.keywords || item?.keywords || []).map(k => String(k).toLowerCase());
      for (const k of jk) {
        if (!candSet.has(k) && k.trim()) {
          freq.set(k, (freq.get(k) || 0) + 1);
        }
      }
    }
    // sort by frequency desc and take top 9
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9)
      .map(([k]) => k);
  }, [candidateKeywords, jobs]);

  return (
    <div className="glass p-5 rounded-2xl">
      <div className="font-semibold mb-3">Skill Gap Suggestions</div>
      <div className="text-xs text-white/60 mb-4">Improve these to increase match percentage</div>

      {loading ? (
        <div className="text-xs text-white/60">Loading...</div>
      ) : error ? (
        <div className="text-xs text-red-400">{error}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {gaps.length === 0 ? (
            <div className="text-xs text-white/60">No gaps detected. Great job!</div>
          ) : (
            gaps.map((g) => (
              <div key={g} className="p-3 rounded-lg bg-white/4 capitalize">{g}</div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

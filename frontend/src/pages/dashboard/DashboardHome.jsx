import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from "sonner";
import api from '../../services/api.js';
import ProfileCard from '../../widgets/ProfileCard.jsx';
import ResumeUpload from '../../widgets/ResumeUpload.jsx';

const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05a2 2 0 0 1-2.09-2.05h0a2 2 0 0 1 2.09-2.05 2 2 0 0 1 2.05 2.09h0a2.05 2.05 0 0 1-2.05 2.05z"></path><path d="M12 2a7 7 0 0 0-7 7c0 3.04 1.63 5.5 4 6.5V17a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.5c2.37-1 4-3.46 4-6.5a7 7 0 0 0-7-7z"></path></svg>;

const JobsList = ({ jobs, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><BriefcaseIcon /> Top Job Matches</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border bg-gray-50 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><BriefcaseIcon /> Top Job Matches</h3>
        <p className="text-sm text-gray-500 text-center py-4">No job matches yet. Upload your resume to see personalized job recommendations!</p>
        <button
          onClick={() => navigate('/candidate/jobs')}
          className="w-full mt-4 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Browse All Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><BriefcaseIcon /> Top Job Matches</h3>
      <div className="space-y-4">
        {jobs.slice(0, 3).map((item) => {
          const job = item.job || item;
          const match = item.matchPercentage || 0;
          return (
            <div
              key={job._id}
              onClick={() => navigate('/candidate/jobs', { state: { openJobId: job._id } })}
              className="p-4 rounded-lg border bg-gray-50 flex items-center justify-between hover:border-indigo-300 transition-all cursor-pointer hover:shadow-md"
            >
              <div>
                <p className="font-semibold text-gray-800">{job.title}</p>
                <p className="text-sm text-gray-500">{job.companyName || 'Company'}{job.location ? ` • ${job.location}` : ''}</p>
              </div>
              <p className="font-bold text-green-600 text-lg">{Math.round(match)}%</p>
            </div>
          );
        })}
      </div>
      <Link
        to="/candidate/jobs"
        className="block w-full mt-6 px-4 py-2 text-sm font-semibold text-center text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        View All Jobs
      </Link>
    </div>
  );
};

const SkillGap = ({ recommendedSkills = [] }) => {
  if (!recommendedSkills || recommendedSkills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><LightbulbIcon /> Skill Suggestions</h3>
      <p className="text-sm text-gray-600 mb-4">Add these skills to your profile to improve your job matches:</p>
      <div className="flex flex-wrap gap-2">
        {recommendedSkills.map((skill, idx) => (
          <span key={idx} className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">{skill}</span>
        ))}
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      return localStorage.getItem('name') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Prefer fetching the current user first (returns name from DB if token is present)
        try {
          const meRes = await api.get('/auth/me');
          const meName = meRes.data?.name;
          if (meName) {
            setUser(meName);
            try { localStorage.setItem('name', meName); } catch { /* ignore */ }
          }
        } catch (meErr) {
          // ignore - may be unauthenticated or token missing
          console.log('/auth/me not available or failed', meErr?.response?.status || meErr?.message || meErr);
        }

        // Then fetch candidate profile (optional more detailed data)
        try {
          const profileRes = await api.get('/candidate/profile');
          setProfile(profileRes.data);
          // If profile contains a canonical name, prefer it
          const p = profileRes.data;
          const derivedName = p?.candidate?.userId?.name || p?.candidate?.name || p?.user?.name || null;
          if (derivedName) {
            setUser(derivedName);
            try { localStorage.setItem('name', derivedName); } catch { /* ignore */ }
          }
        } catch (err) {
          console.log('candidate/profile not available', err?.response?.status || err?.message || err);
        }

        // Fetch top job matches
        try {
          const jobsRes = await api.get('/candidate/jobs');
          const sortedJobs = (jobsRes.data || []).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
          setJobs(sortedJobs);
        } catch (err) {
          console.error('Failed to load jobs:', err);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const candidate = profile?.candidate;
  const candidateKeywords = candidate?.keywords || [];
  const allJobKeywords = jobs.flatMap(item => (item.job?.keywords || []));
  const uniqueJobKeywords = [...new Set(allJobKeywords)];

  return (
    <div className="w-full h-[calc(100vh-5rem)] overflow-hidden p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-2 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back{user ? `, ${user}` : ''}!</h1>
          <p className="text-base text-gray-500">Here's your career snapshot.</p>
        </div>

        {/* Main Grid Layout - Compact & Full Height */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 pb-2">

          {/* Left Column: Profile & Resume (Stacked) */}
          <div className="lg:col-span-1 h-full flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
            <div className="flex-shrink-0">
              <ProfileCard />
            </div>
            <div className="flex-shrink-0">
              <ResumeUpload />
            </div>
          </div>

          {/* Right Column: Jobs & Skills */}
          <div className="lg:col-span-2 h-full flex flex-col gap-4 overflow-hidden">

            {/* Jobs List - Takes available space */}
            <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  <BriefcaseIcon /> Top Job Matches
                </h3>
                <Link to="/candidate/jobs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />)}
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-gray-500 text-sm mb-2">No matches yet.</p>
                  <button onClick={() => window.location.href = '/candidate/jobs'} className="text-indigo-600 text-sm font-medium">Browse Jobs</button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {jobs.map((item) => {
                    const job = item.job || item;
                    const match = item.matchPercentage || 0;
                    return (
                      <div
                        key={job._id}
                        onClick={() => window.location.href = `/candidate/jobs?open=${job._id}`}
                        className="p-3 rounded-lg border border-gray-100 hover:border-indigo-300 bg-gray-50/50 hover:bg-white transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm group-hover:text-indigo-700 transition-colors">{job.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{job.companyName} • {job.location}</p>
                          </div>
                          <span className={`text-sm font-bold ${match >= 80 ? 'text-green-600' : match >= 50 ? 'text-indigo-600' : 'text-gray-500'}`}>
                            {Math.round(match)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skills (Fixed height at bottom if exists) */}
            {profile?.recommendedSkills?.length > 0 && (
              <div className="flex-shrink-0">
                <SkillGap recommendedSkills={profile.recommendedSkills} />
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
};

export default DashboardHome;

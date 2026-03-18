import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api.js";


// SVG Icons
const SearchIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const MapPinIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

// Job Details Modal
const JobDetailsModal = ({ isOpen, onClose, job, onApply, applying, isApplied }) => {
    if (!isOpen || !job) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-indigo-600 font-medium">{job.companyName}</span>
                            {job.location && <span className="text-gray-500 text-sm flex items-center gap-1"> • <MapPinIcon className="h-4 w-4" /> {job.location}</span>}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
                        <p className="whitespace-pre-line leading-relaxed">{job.description || "No description provided."}</p>

                        {job.requirements && (
                            <>
                                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Requirements</h3>
                                <p className="whitespace-pre-line leading-relaxed">{job.requirements}</p>
                            </>
                        )}

                        {job.tags && job.tags.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags & Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(job.keywords || []).concat(job.tags || []).map((k, i) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">#{k}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors">
                        Close
                    </button>
                    <button
                        onClick={() => { onClose(); onApply(); }}
                        disabled={applying || isApplied}
                        className={`px-6 py-2.5 rounded-lg font-medium text-white transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed ${isApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isApplied ? "Applied" : applying ? "Applying..." : "Apply Now"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Job Card Component
const JobCard = ({ job, pct, missingSkills, applying, onApply, onViewDetails, isApplied }) => {
    const [showAllSkills, setShowAllSkills] = useState(false);
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col hover:shadow-lg hover:border-indigo-300 transition-all duration-300 min-h-[250px]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-lg font-bold text-gray-900 line-clamp-1" title={job.title}>{job.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-medium text-indigo-600 line-clamp-1">{job.companyName}</p>
                        {job.location && <p className="text-sm text-gray-500 flex items-center gap-1 shrink-0"><MapPinIcon className="h-4 w-4" /> <span className="line-clamp-1">{job.location}</span></p>}
                    </div>
                </div>
                <div className="text-center flex-shrink-0 bg-green-50 px-2 py-1 rounded-lg" title="Based on Skills, Marks, Location & Preferences">
                    <p className="text-xl font-bold text-green-600">{pct}%</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Match</p>
                </div>
            </div>

            <p className="text-sm text-gray-600 mt-4 line-clamp-3 leading-relaxed flex-1">
                {job.description}
            </p>

            {missingSkills && missingSkills.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Skill Gap vs Job Requirements:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {(showAllSkills ? missingSkills : missingSkills.slice(0, 3)).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-bold uppercase tracking-wider">
                                {skill}
                            </span>
                        ))}
                        {!showAllSkills && missingSkills.length > 3 && (
                            <button onClick={() => setShowAllSkills(true)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors">
                                +{missingSkills.length - 3} more
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
                <button
                    className="flex-1 px-4 py-2 rounded-lg text-indigo-600 text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    onClick={onViewDetails}
                >
                    View Details
                </button>
                <button
                    className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${isApplied ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}`}
                    onClick={onApply}
                    disabled={applying || isApplied}
                >
                    {isApplied ? "Applied" : applying ? "Applying..." : "Apply Now"}
                </button>
            </div>
        </div>
    );
};

// Job Card Skeleton
const JobCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col animate-pulse min-h-[250px]">
        <div className="flex items-start justify-between gap-4">
            <div className="w-3/4">
                <div className="h-6 bg-gray-200 rounded w-4/5 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-2 mt-6 flex-1">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="mt-6 flex gap-3">
            <div className="h-10 flex-1 bg-gray-200 rounded-lg"></div>
            <div className="h-10 flex-1 bg-gray-300 rounded-lg"></div>
        </div>
    </div>
);


const ApplyModal = ({ isOpen, onClose, onConfirm, job, applying }) => {
    if (!isOpen || !job) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900">Application Confirmation</h2>
                <p className="text-gray-600 mt-2">You are about to apply for the position of:</p>
                <div className="my-4 p-4 bg-gray-50 rounded-lg border">
                    <p className="font-semibold text-lg text-indigo-700">{job.title}</p>
                    <p className="text-sm text-gray-800">{job.companyName}</p>
                </div>
                <p className="text-sm text-gray-500 mb-6">Your profile will be submitted to the recruiter. Are you sure you want to proceed?</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={applying} className="px-6 py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50">
                        {applying ? 'Submitting...' : 'Confirm & Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null); // Stores the ID of the job being applied to
    const [searchTerm, setSearchTerm] = useState("");
    const [appliedJobIds, setAppliedJobIds] = useState(new Set()); // Track applied jobs

    // Application Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null); // For apply modal

    // Details Modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailJob, setDetailJob] = useState(null);

    const location = useLocation();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch jobs and my applications in parallel
            const [jobsRes, appsRes] = await Promise.all([
                api.get("/candidate/jobs"),
                api.get("/applications/my")
            ]);

            const fetchedJobs = jobsRes.data || [];
            setJobs(fetchedJobs);

            // Create a Set of applied job IDs for efficient lookup
            // Create a Set of applied job IDs for efficient lookup
            const appliedIds = new Set((appsRes.data || []).map(app => {
                if (!app.jobId) return null; // Handle null jobId (deleted job)
                // Handle populated object or direct ID
                return typeof app.jobId === 'object' ? app.jobId._id : app.jobId;
            }).filter(Boolean)); // Filter out nulls
            setAppliedJobIds(appliedIds);

            // Check for deep link via state
            if (location.state?.openJobId) {
                const jobToOpen = fetchedJobs.find(item => {
                    const j = item.job || item;
                    return j._id === location.state.openJobId;
                });

                if (jobToOpen) {
                    setDetailJob(jobToOpen.job || jobToOpen);
                    setIsDetailModalOpen(true);
                    // Clear state to prevent reopening on re-renders (optional but good practice)
                    window.history.replaceState({}, document.title);
                }
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [location.state]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const handleViewDetails = (job) => {
        setDetailJob(job);
        setIsDetailModalOpen(true);
    };

    const confirmApply = async () => {
        if (!selectedJob) return;
        setApplying(selectedJob._id);
        try {
            await api.post("/applications", { jobId: selectedJob._id });
            toast.success("Applied successfully!");

            // Immediately mark as applied locally
            setAppliedJobIds(prev => new Set(prev).add(selectedJob._id));

        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Apply failed");
        } finally {
            setApplying(null);
            setIsModalOpen(false);
            setSelectedJob(null);
            // Also close details modal if open and applying from there
            // But usually apply modal is separate. If applying from details modal, we can handle it.
        }
    };

    // Apply from detail modal: Close detail, Open apply confirm
    const handleApplyFromDetail = () => {
        if (!detailJob) return;
        setIsDetailModalOpen(false);
        handleApplyClick(detailJob);
    }

    const filteredJobs = useMemo(() => {
        if (!jobs || jobs.length === 0) return [];
        return jobs.filter(item => {
            const job = item.job || item;
            const title = (job.title || '').toLowerCase();
            const company = (job.companyName || '').toLowerCase();
            const keywords = (job.keywords || []);
            const searchLower = searchTerm.toLowerCase();

            return title.includes(searchLower) ||
                company.includes(searchLower) ||
                keywords.some(k => k.toLowerCase().includes(searchLower));
        });
    }, [jobs, searchTerm]);

    return (
        <>
            {/* Apply Confirmation Modal */}
            <ApplyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmApply}
                job={selectedJob}
                applying={!!applying}
            />

            {/* Job Detail Modal */}
            <JobDetailsModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                job={detailJob}
                onApply={handleApplyFromDetail}
                applying={!!applying}
                isApplied={detailJob ? appliedJobIds.has(detailJob._id) : false}
            />

            <div className="bg-gray-50 w-full min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header & Search */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Job Matches</h1>
                        <p className="text-gray-500 mt-1">Showing the best job opportunities based on your profile and skills.</p>
                        <div className="mt-6 relative">
                            <input
                                type="text"
                                placeholder="Search by title, company, or keyword..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                            />
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                        </div>
                    </div>

                    {/* Job Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {loading ? (
                            [...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)
                        ) : filteredJobs.length === 0 ? (
                            <div className="lg:col-span-2 text-center bg-white rounded-2xl p-12">
                                <h3 className="text-xl font-semibold text-gray-800">No Jobs Found</h3>
                                <p className="text-gray-500 mt-2">We couldn't find any jobs matching your search. Try broadening your criteria.</p>
                            </div>
                        ) : (
                            filteredJobs.map((item) => {
                                const job = item.job || item;
                                const isApplied = appliedJobIds.has(job._id);

                                return (
                                    <JobCard
                                        key={job._id}
                                        job={job}
                                        pct={item.matchPercentage ?? 0}
                                        missingSkills={item.missingSkills || []}
                                        applying={applying === job._id}
                                        onApply={() => !isApplied && handleApplyClick(job)}
                                        onViewDetails={() => handleViewDetails(job)}
                                        isApplied={isApplied} // Pass the isApplied prop
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

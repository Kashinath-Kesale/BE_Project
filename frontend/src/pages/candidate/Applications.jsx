import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";


// SVG Icons
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-gray-400 mb-4"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.88.99 6.64 2.64l1.4-1.42" /><path d="M10 12h4" /><path d="m21.34 21.34-1.41-1.41" /><path d="M12 10v4" /></svg>
);

// Job Details Modal
const JobDetailsModal = ({ isOpen, onClose, job }) => {
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
                            {job.location && <span className="text-gray-500 text-sm flex items-center gap-1"> • <span className="h-4 w-4">📍</span> {job.location}</span>}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
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
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Status Badge
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1.5";
    const statusStyles = {
        applied: "bg-blue-100 text-blue-800",
        shortlisted: "bg-yellow-100 text-yellow-800",
        rejected: "bg-red-100 text-red-800",
        hired: "bg-green-100 text-green-800",
    };
    const dotStyles = {
        applied: "bg-blue-500",
        shortlisted: "bg-yellow-500",
        rejected: "bg-red-500",
        hired: "bg-green-500",
    }
    return (
        <div className={`${baseClasses} ${statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
            <span className={`h-2 w-2 rounded-full ${dotStyles[status.toLowerCase()]}`}></span>
            {status}
        </div>
    );
};

// Application Row Component
const ApplicationRow = ({ application, onWithdraw, onViewDetails }) => {
    const isWithdrawable = application.status === 'applied';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:shadow-md hover:border-indigo-200 transition-all duration-300">
            <div className="md:col-span-5">
                <p className="font-semibold text-gray-800 text-lg hover:text-indigo-600 cursor-pointer" onClick={() => onViewDetails(application.jobId)}>
                    {application.jobTitle || application.job?.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <BriefcaseIcon />
                    <p className="text-sm text-gray-500">{application.companyName || application.job?.companyName}</p>
                </div>
            </div>
            <div className="md:col-span-3 flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon />
                <span>{application.appliedAt ? new Date(application.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}</span>
            </div>
            <div className="md:col-span-2 flex justify-start md:justify-center">
                <StatusBadge status={application.status} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
                <button
                    onClick={() => onViewDetails(application.jobId)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                    View
                </button>
                <button
                    onClick={() => isWithdrawable && onWithdraw(application._id)}
                    disabled={!isWithdrawable}
                    title={!isWithdrawable ? "Cannot withdraw processed application" : "Withdraw Application"}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isWithdrawable
                        ? "border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 focus:ring-red-500"
                        : "border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                >
                    Withdraw
                </button>
            </div>
        </div>
    );
};

// Skeleton Loader
const ApplicationSkeleton = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="col-span-3 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="col-span-2 flex justify-center">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="col-span-2 flex justify-end">
                    <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>
        ))}
    </div>
);


// Empty State Component
const EmptyState = () => (
    <div className="text-center bg-gray-50 rounded-2xl p-12">
        <SearchIcon />
        <h3 className="text-xl font-semibold text-gray-800">No Applications Yet</h3>
        <p className="text-gray-500 mt-2 mb-6">It looks like you haven't applied for any jobs. Let's find your next opportunity!</p>
        <Link
            to="/candidate/jobs"
            className="inline-block px-6 py-2.5 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
        >
            Find Jobs
        </Link>
    </div>
);

// Withdrawal Confirmation Modal
const WithdrawalModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900">Confirm Withdrawal</h2>
                <p className="text-gray-600 mt-2 mb-6">Are you sure you want to withdraw your application? This action cannot be undone.</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
                        Yes, Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
export default function Applications() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(null);

    // Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailJob, setDetailJob] = useState(null);

    const fetchApps = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/applications/my");
            // API now populates fetch job details so we have access to them
            const normalized = (res.data || []).map(a => ({
                ...a,
                jobTitle: a.jobId?.title || a.jobTitle,
                companyName: a.jobId?.companyName || a.companyName,
                appliedAt: a.createdAt || a.appliedAt,
            }));
            setApps(normalized);
        } catch (err) {
            console.error(err);
            alert("Failed to load applications.");
            setApps([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApps();
    }, [fetchApps]);

    const handleWithdrawClick = (id) => {
        setSelectedAppId(id);
        setIsWithdrawModalOpen(true);
    };

    const handleViewDetails = (job) => {
        setDetailJob(job);
        setIsDetailModalOpen(true);
    };

    const confirmWithdraw = async () => {
        if (!selectedAppId) return;
        try {
            await api.delete(`/applications/${selectedAppId}`);
            // Refetch or filter the list client-side for better UX
            setApps(prevApps => prevApps.filter(app => app._id !== selectedAppId));
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to withdraw application.");
        } finally {
            setIsWithdrawModalOpen(false);
            setSelectedAppId(null);
        }
    };


    return (
        <>
            <WithdrawalModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                onConfirm={confirmWithdraw}
            />

            <JobDetailsModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                job={detailJob}
            />

            <div className="bg-gray-50 w-full min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                        <p className="text-gray-500 mt-1">Track the status of all your job applications in one place.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        {loading ? (
                            <ApplicationSkeleton />
                        ) : apps.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-4">
                                {apps.map((app) => <ApplicationRow key={app._id} application={app} onWithdraw={handleWithdrawClick} onViewDetails={handleViewDetails} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

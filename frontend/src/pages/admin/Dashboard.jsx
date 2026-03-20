import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Check, X, Building2, MapPin, Globe, Loader2, AlertCircle, Users, Briefcase, FileText, Search, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("approvals"); // 'approvals' or 'analytics'
    
    // Approvals State
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Analytics State
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsError, setAnalyticsError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        if (activeTab === "approvals") {
            fetchPendingRecruiters();
        } else if (activeTab === "analytics" && !analyticsData) {
            fetchPlatformAnalytics();
        }
    }, [activeTab]);

    const fetchPendingRecruiters = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/admin/recruiters/pending", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecruiters(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching recruiters:", err);
            setError("Failed to load pending recruiters.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPlatformAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/admin/analytics", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAnalyticsData(response.data);
            setAnalyticsError(null);
        } catch (err) {
            console.error("Error fetching analytics:", err);
            setAnalyticsError("Failed to load platform analytics.");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            setActionLoading(id);
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:5000/api/admin/recruiters/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecruiters((prev) => prev.filter((r) => r._id !== id));
            toast.success(`Recruiter ${action}ed successfully.`);
        } catch (err) {
            console.error(`Error ${action}ing recruiter:`, err);
            toast.error(`Failed to ${action} recruiter. Please try again.`);
        } finally {
            setActionLoading(null);
        }
    };

    // Filter logic for Analytics Table
    const filteredApplications = useMemo(() => {
        if (!analyticsData?.applications) return [];
        let filtered = analyticsData.applications;

        if (statusFilter !== "All") {
            filtered = filtered.filter(app => app.status === statusFilter.toLowerCase());
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(app => 
                app.candidateName.toLowerCase().includes(lowerSearch) ||
                app.jobTitle.toLowerCase().includes(lowerSearch) ||
                app.companyName.toLowerCase().includes(lowerSearch) ||
                app.branch.toLowerCase().includes(lowerSearch)
            );
        }

        return filtered;
    }, [analyticsData, searchTerm, statusFilter]);

    // Slice for Pagination
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const paginatedApplications = filteredApplications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage recruiters and monitor platform activity.</p>
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab("approvals")}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
                            ${activeTab === "approvals" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                    >
                        <UserCheck size={18} />
                        Approvals
                        {recruiters.length > 0 && activeTab !== "approvals" && (
                            <span className="ml-1.5 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px]">{recruiters.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
                            ${activeTab === "analytics" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                    >
                        <Globe size={18} />
                        Analytics
                    </button>
                </div>
            </div>

            {/* Content Switcher */}
            {activeTab === "approvals" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Approvals View */}
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center min-h-[40vh] text-red-500 bg-red-50 rounded-2xl p-8">
                            <AlertCircle className="w-12 h-12 mb-3" />
                            <p className="font-medium text-lg">{error}</p>
                            <button onClick={fetchPendingRecruiters} className="mt-4 px-6 py-2.5 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition">Retry</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 max-w-sm">
                                <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Pending Approvals</p>
                                    <p className="text-3xl font-bold text-gray-900">{recruiters.length}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Building2 className="text-indigo-600" size={20} />
                                        Pending Recruiter Requests
                                    </h2>
                                </div>

                                {recruiters.length === 0 ? (
                                    <div className="p-16 text-center text-gray-500">
                                        <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                                            <Check className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
                                        <p className="text-base mt-2">No pending recruiter requests at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                                    <th className="px-6 py-4 font-semibold">Company</th>
                                                    <th className="px-6 py-4 font-semibold">Details</th>
                                                    <th className="px-6 py-4 font-semibold">Location</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {recruiters.map((recruiter) => (
                                                    <tr key={recruiter._id} className="hover:bg-indigo-50/30 transition duration-150 group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 border border-indigo-200/50">
                                                                    <Building2 size={24} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-base">{recruiter.companyName || "N/A"}</p>
                                                                    <a href={recruiter.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 mt-1">
                                                                        <Globe size={14} />
                                                                        {recruiter.companyWebsite || "No website"}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="space-y-1.5">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                    {recruiter.designation || "Recruiter"}
                                                                </span>
                                                                <p className="text-sm text-gray-600 line-clamp-2 pr-4">{recruiter.description || "No description provided."}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 align-top pt-6">
                                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                                <MapPin size={16} className="text-gray-400" />
                                                                {recruiter.location || "Remote / Unspecified"}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 align-middle text-right">
                                                            <div className="flex items-center justify-end gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleAction(recruiter._id, "approve")} disabled={actionLoading === recruiter._id} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-sm border border-green-200 rounded-lg text-sm font-bold transition disabled:opacity-50">
                                                                    {actionLoading === recruiter._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                                    Approve
                                                                </button>
                                                                <button onClick={() => handleAction(recruiter._id, "reject")} disabled={actionLoading === recruiter._id} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-sm border border-red-200 rounded-lg text-sm font-bold transition disabled:opacity-50">
                                                                    {actionLoading === recruiter._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "analytics" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Analytics View */}
                    {analyticsLoading ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        </div>
                    ) : analyticsError ? (
                        <div className="flex flex-col items-center justify-center min-h-[40vh] text-red-500 bg-red-50 rounded-2xl p-8">
                            <AlertCircle className="w-12 h-12 mb-3" />
                            <p className="font-medium text-lg">{analyticsError}</p>
                            <button onClick={fetchPlatformAnalytics} className="mt-4 px-6 py-2.5 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition">Retry</button>
                        </div>
                    ) : analyticsData && (
                        <div className="space-y-8">
                            {/* Stat Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Candidates</p>
                                            <h3 className="text-3xl font-black text-gray-900 mt-2">{analyticsData.metrics?.totalCandidates || 0}</h3>
                                        </div>
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} strokeWidth={2.5}/></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Recruiters</p>
                                            <h3 className="text-3xl font-black text-gray-900 mt-2">{analyticsData.metrics?.totalRecruiters || 0}</h3>
                                        </div>
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building2 size={24} strokeWidth={2.5}/></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Jobs</p>
                                            <h3 className="text-3xl font-black text-gray-900 mt-2">{analyticsData.metrics?.totalJobs || 0}</h3>
                                        </div>
                                        <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Briefcase size={24} strokeWidth={2.5}/></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Applications</p>
                                            <h3 className="text-3xl font-black text-gray-900 mt-2">{analyticsData.metrics?.totalApplications || 0}</h3>
                                        </div>
                                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><FileText size={24} strokeWidth={2.5}/></div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Table Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Globe className="text-indigo-600" size={22} />
                                        Platform Activity Logs
                                    </h2>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Search activity..." 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                            />
                                        </div>
                                        <select 
                                            value={statusFilter} 
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="All">All Statuses</option>
                                            <option value="Applied">Applied</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Hired">Hired</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[1000px]">
                                        <thead>
                                            <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                                <th className="px-6 py-4 font-bold">Candidate</th>
                                                <th className="px-6 py-4 font-bold">Applied Role</th>
                                                <th className="px-6 py-4 font-bold">Company</th>
                                                <th className="px-6 py-4 font-bold text-center">CGPA</th>
                                                <th className="px-6 py-4 font-bold text-center">Status</th>
                                                <th className="px-6 py-4 font-bold text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedApplications.length > 0 ? (
                                                paginatedApplications.map((app) => (
                                                    <tr key={app._id} className="hover:bg-gray-50/50 transition duration-150">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900">{app.candidateName}</span>
                                                                <span className="text-xs text-gray-500 mt-0.5">{app.candidateEmail} • {app.branch}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md text-sm">{app.jobTitle}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold border border-gray-200">
                                                                    {app.companyName.charAt(0).toUpperCase()}
                                                                </span>
                                                                <span className="font-semibold text-gray-700">{app.companyName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-medium text-gray-700">
                                                            {app.cgpa}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                                ${app.status === 'applied' ? 'bg-blue-100 text-blue-800' : ''}
                                                                ${app.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                                ${app.status === 'hired' ? 'bg-green-100 text-green-800' : ''}
                                                                ${app.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                                                            `}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm text-gray-500 whitespace-nowrap">
                                                            {new Date(app.appliedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                                                        {searchTerm || statusFilter !== "All" 
                                                            ? "No applications match your current filters." 
                                                            : "No platform activity recorded yet."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination Controls */}
                                {filteredApplications.length > 0 && (
                                    <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 text-sm text-gray-500">
                                        <div>
                                            Showing <span className="font-semibold text-gray-900">{filteredApplications.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredApplications.length)}</span> of <span className="font-semibold text-gray-900">{filteredApplications.length}</span> entries
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                            <button 
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-700"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className="px-3 py-1 font-medium text-gray-700 text-xs tracking-wide">PAGE {currentPage} OF {totalPages || 1}</span>
                                            <button 
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages || totalPages === 0}
                                                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-700"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

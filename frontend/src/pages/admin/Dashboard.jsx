import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, X, Building2, MapPin, Globe, Loader2, AlertCircle } from "lucide-react";

const AdminDashboard = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // stores ID of recruiter being processed

    useEffect(() => {
        fetchPendingRecruiters();
    }, []);

    const fetchPendingRecruiters = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/admin/recruiters/pending", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecruiters(response.data);
        } catch (err) {
            console.error("Error fetching recruiters:", err);
            setError("Failed to load pending recruiters.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            setActionLoading(id);
            const token = localStorage.getItem("token");

            // action is either 'approve' or 'reject'
            await axios.post(`http://localhost:5000/api/admin/recruiters/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Remove from list locally for instant feedback
            setRecruiters((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            console.error(`Error ${action}ing recruiter:`, err);
            alert(`Failed to ${action} recruiter. Please try again.`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-red-500">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p className="font-medium">{error}</p>
                <button
                    onClick={fetchPendingRecruiters}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Review and manage recruiter access requests.</p>
                </div>
            </div>

            {/* Stats / Overview (Optional, maybe add count later) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{recruiters.length}</p>
                </div>
            </div>

            {/* Recruiters List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Pending Recruiters</h2>
                </div>

                {recruiters.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">All caught up!</p>
                        <p className="text-sm mt-1">No pending recruiter requests at the moment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-4 font-semibold">Company</th>
                                    <th className="px-6 py-4 font-semibold">Details</th>
                                    <th className="px-6 py-4 font-semibold">Location</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recruiters.map((recruiter) => (
                                    <tr key={recruiter._id} className="hover:bg-gray-50/50 transition duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{recruiter.companyName || "N/A"}</p>
                                                    <a
                                                        href={recruiter.companyWebsite}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 mt-0.5"
                                                    >
                                                        <Globe size={10} />
                                                        {recruiter.companyWebsite || "No website"}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-900 py-1">{recruiter.designation || "Recruiter"}</p>
                                                {/* If we had the user's email here it would be good, but Recruiter model links to User. 
                            The endpoint returns Recruiter object. 
                            We might need to populate 'userId' to get email. 
                            For now, just showing available fields. */}
                                                <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">{recruiter.description || "No description provided."}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <MapPin size={14} className="text-gray-400" />
                                                {recruiter.location || "Remote / Unspecified"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(recruiter._id, "approve")}
                                                    disabled={actionLoading === recruiter._id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading === recruiter._id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(recruiter._id, "reject")}
                                                    disabled={actionLoading === recruiter._id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading === recruiter._id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
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
    );
};

export default AdminDashboard;

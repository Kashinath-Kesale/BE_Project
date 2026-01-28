import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";

const ProfileCompletion = ({ completion }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center h-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Completion</h3>
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    className="text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    className="text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${completion}, 100`}
                    strokeLinecap="round"
                    transform="rotate(90 18 18)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-indigo-700">{completion}%</span>
            </div>
        </div>
        <p className="mt-4 text-gray-500">Complete your profile to attract more recruiters.</p>
    </div>
);


export default function Profile() {
    const [candidate, setCandidate] = useState(null);
    const [completion, setCompletion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        phone: "",
        rollNo: "",
        branch: "",
        education: { year: "", cgpa: "" },
    });
    const [errors, setErrors] = useState({});

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/candidate/profile");
            const profile = res.data.candidate;
            setCandidate(profile || null);
            setCompletion(res.data.profileCompletion || 0);
            // Always populate form with profile data (even if empty)
            setForm({
                phone: profile?.phone || "",
                rollNo: profile?.rollNo || "",
                branch: profile?.branch || "",
                education: {
                    year: profile?.education?.year || "",
                    cgpa: profile?.education?.cgpa || "",
                },
            });
        } catch (err) {
            console.error(err);
            // Don't show alert for 404 (no profile yet), only for real errors
            if (err?.response?.status !== 404) {
                alert(err?.response?.data?.message || "Failed to load profile");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "year" || name === "cgpa") {
            setForm((prev) => ({ ...prev, education: { ...prev.education, [name]: value } }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Phone validation (10 digits, optional formatting)
        if (form.phone && !/^[\d\s\-()]+$/.test(form.phone)) {
            newErrors.phone = "Phone number should contain only digits, spaces, hyphens, or parentheses";
        }
        if (form.phone && form.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = "Phone number should have at least 10 digits";
        }

        // Roll number validation (not empty if provided)
        if (form.rollNo && form.rollNo.trim().length < 3) {
            newErrors.rollNo = "Roll number should be at least 3 characters";
        }

        // Branch validation
        if (form.branch && form.branch.trim().length < 2) {
            newErrors.branch = "Branch should be at least 2 characters";
        }

        // Year validation (should be 4 digits and reasonable range)
        if (form.education.year) {
            const year = parseInt(form.education.year);
            const currentYear = new Date().getFullYear();
            if (!/^\d{4}$/.test(form.education.year)) {
                newErrors.year = "Year should be 4 digits (e.g., 2025)";
            } else if (year < 1950 || year > currentYear + 10) {
                newErrors.year = `Year should be between 1950 and ${currentYear + 10}`;
            }
        }

        // CGPA validation (0-10 or 0-100 for percentage)
        if (form.education.cgpa) {
            const cgpa = parseFloat(form.education.cgpa);
            if (isNaN(cgpa)) {
                newErrors.cgpa = "CGPA should be a number";
            } else if (cgpa < 0 || cgpa > 100) {
                newErrors.cgpa = "CGPA should be between 0 and 10 (or 0-100 for percentage)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validate form before submitting
        if (!validateForm()) {
            alert("Please fix the errors in the form before saving.");
            return;
        }

        setSaving(true);
        try {
            const res = await api.post("/candidate/profile", form);
            setCandidate(res.data.candidate);
            setCompletion(res.data.profileCompletion);
            alert("Profile updated successfully!");

            // Trigger profile refresh event for ProfileCard on dashboard
            window.dispatchEvent(new CustomEvent('profileUpdated'));
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 w-full p-8 flex justify-center items-center h-screen">
                <p className="text-lg text-gray-600">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 w-full min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500 mt-1">Keep your personal and professional details up to date.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Profile Completion */}
                    <div className="lg:col-span-1">
                        <ProfileCompletion completion={completion} />
                    </div>

                    <div className="lg:col-span-2">
                        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <div className="mb-6 pb-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                                {candidate?.userId?.email && <p className="text-gray-500">{candidate.userId.email}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="e.g., 987-654-3210"
                                    />
                                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-1">Roll No.</label>
                                    <input
                                        id="rollNo"
                                        name="rollNo"
                                        value={form.rollNo}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${errors.rollNo ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="e.g., BE12345"
                                    />
                                    {errors.rollNo && <p className="text-xs text-red-600 mt-1">{errors.rollNo}</p>}
                                </div>
                            </div>

                            <div className="mt-8 mb-6 pb-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">Academic Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                    <input
                                        id="branch"
                                        name="branch"
                                        value={form.branch}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${errors.branch ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="e.g., IT"
                                    />
                                    {errors.branch && <p className="text-xs text-red-600 mt-1">{errors.branch}</p>}
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Passing Year</label>
                                    <input
                                        id="year"
                                        name="year"
                                        value={form.education.year}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="e.g., 2025"
                                    />
                                    {errors.year && <p className="text-xs text-red-600 mt-1">{errors.year}</p>}
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700 mb-1">CGPA / %</label>
                                    <input
                                        id="cgpa"
                                        name="cgpa"
                                        value={form.education.cgpa}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${errors.cgpa ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="e.g., 9.0"
                                    />
                                    {errors.cgpa && <p className="text-xs text-red-600 mt-1">{errors.cgpa}</p>}
                                </div>
                            </div>

                            {/* Resume Section */}
                            <div className="mt-8 mb-6 pb-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">Resume</h2>
                            </div>

                            {candidate?.resumeUrl ? (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                <polyline points="10 9 9 9 8 9"></polyline>
                                            </svg>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">Current Resume</p>
                                                <p className="text-xs text-gray-500">
                                                    {candidate.resumeUrl.split('/').pop() || 'resume.pdf'}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${candidate.resumeUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            View / Download
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <p className="text-sm text-gray-700">No resume uploaded yet. Upload your resume from the dashboard to improve your job matches.</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-4">
                                <button type="button" onClick={fetchProfile} className="px-6 py-2.5 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                                    Reset
                                </button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

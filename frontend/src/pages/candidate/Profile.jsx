import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
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
        gender: "Male",
        education: {
            tenth: { percentage: "", year: "" },
            twelfth: { percentage: "", year: "" },
            btech: { percentage: "", year: "", cgpa: "" }
        },
        skills: [],
        githubProfile: "",
        linkedinProfile: ""
    });
    const [errors, setErrors] = useState({});

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/candidate/profile");
            const profile = res.data.candidate;
            setCandidate(profile || null);
            setCompletion(res.data.profileCompletion || 0);

            setForm({
                phone: profile?.phone || "",
                rollNo: profile?.rollNo || "",
                branch: profile?.branch || "",
                location: profile?.location || "",
                gender: profile?.gender || "Male",
                education: {
                    tenth: {
                        percentage: profile?.education?.tenth?.percentage || "",
                        year: profile?.education?.tenth?.year || ""
                    },
                    twelfth: {
                        percentage: profile?.education?.twelfth?.percentage || "",
                        year: profile?.education?.twelfth?.year || ""
                    },
                    btech: {
                        percentage: profile?.education?.btech?.percentage || "",
                        year: profile?.education?.btech?.year || "", // Map old year to btech year if transitioning
                        cgpa: profile?.education?.btech?.cgpa || profile?.education?.cgpa || "" // Fallback for old data
                    },
                },
                skills: profile?.skills || [],
                githubProfile: profile?.githubProfile || "",
                linkedinProfile: profile?.linkedinProfile || ""
            });
        } catch (err) {
            console.error(err);
            // Don't show alert for 404 (no profile yet), only for real errors
            if (err?.response?.status !== 404) {
                toast.error(err?.response?.data?.message || "Failed to load profile");
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

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            // Handle btech/year/cgpa or tenth/percentage etc.
            // Simplified for the structure education.btech.year etc.
            if (parent === "education") {
                // name="education.tenth.year" -> need deeper split if we use that convention
                // easier: use specific handlers or checks
                // Let's rely on specific names like "tenth.year" in inputs and process here
                // But wait, name in input is e.g. "tenthYear"? NO, let's use specialized logic below
            }
        }
    };

    // Specialized change handler for nested education fields
    const handleEducationChange = (level, field, value) => {
        setForm(prev => ({
            ...prev,
            education: {
                ...prev.education,
                [level]: {
                    ...prev.education[level],
                    [field]: value
                }
            }
        }));
    };

    const handleGenericChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Skill handlers
    const addSkill = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const skill = e.target.value.trim();
            if (skill && !form.skills.includes(skill)) {
                setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
            }
            e.target.value = "";
        }
    };
    const removeSkill = (skillToRemove) => {
        setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (form.phone && !/^[\d\s\-()]+$/.test(form.phone)) newErrors.phone = "Invalid phone format";
        if (form.phone && form.phone.replace(/\D/g, '').length < 10) newErrors.phone = "Phone must be 10 digits";

        // Basic year validations
        const currentYear = new Date().getFullYear();
        if (form.education.btech.year && (form.education.btech.year < 1990 || form.education.btech.year > currentYear + 10)) {
            newErrors.btechYear = "Invalid passing year";
        }

        // Percentage/CGPA validations (0-100 or 0-10)
        ['tenth', 'twelfth', 'btech'].forEach(level => {
            const val = form.education[level].percentage || form.education[level].cgpa;
            if (val && (val < 0 || val > 100)) newErrors[level] = "Invalid Score/CGPA";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validate form before submitting
        if (!validateForm()) {
            toast.warn("Please fix the errors in the form before saving.");
            return;
        }

        setSaving(true);
        try {
            const res = await api.post("/candidate/profile", form);
            setCandidate(res.data.candidate);
            setCompletion(res.data.profileCompletion);
            toast.success("Profile updated successfully!");

            // Trigger profile refresh event for ProfileCard on dashboard
            window.dispatchEvent(new CustomEvent('profileUpdated'));
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to save profile");
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleGenericChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="987-654-3210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                                    <input
                                        name="location"
                                        value={form.location || ""}
                                        onChange={handleGenericChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. Pune"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleGenericChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</label>
                                    <input
                                        name="githubProfile"
                                        value={form.githubProfile}
                                        onChange={handleGenericChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                                    <input
                                        name="linkedinProfile"
                                        value={form.linkedinProfile}
                                        onChange={handleGenericChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>

                            <div className="mt-8 mb-6 pb-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">Academic Details</h2>
                            </div>

                            <div className="space-y-6">
                                {/* B.Tech */}
                                <div className="p-4 bg-indigo-50 rounded-lg">
                                    <h3 className="font-semibold text-indigo-900 mb-3">Undergraduate (B.Tech/BE)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                                            <input
                                                name="branch"
                                                value={form.branch}
                                                onChange={handleGenericChange}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="CS/IT"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Pass Year</label>
                                            <input
                                                value={form.education.btech.year}
                                                onChange={(e) => handleEducationChange('btech', 'year', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="2025"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">CGPA</label>
                                            <input
                                                value={form.education.btech.cgpa}
                                                onChange={(e) => handleEducationChange('btech', 'cgpa', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="9.0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 12th & 10th */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-3">Class XII / Diploma</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Percentage</label>
                                                <input
                                                    value={form.education.twelfth.percentage}
                                                    onChange={(e) => handleEducationChange('twelfth', 'percentage', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded"
                                                    placeholder="85.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Pass Year</label>
                                                <input
                                                    value={form.education.twelfth.year}
                                                    onChange={(e) => handleEducationChange('twelfth', 'year', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded"
                                                    placeholder="2021"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-3">Class X</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Percentage</label>
                                                <input
                                                    value={form.education.tenth.percentage}
                                                    onChange={(e) => handleEducationChange('tenth', 'percentage', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded"
                                                    placeholder="90.0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Pass Year</label>
                                                <input
                                                    value={form.education.tenth.year}
                                                    onChange={(e) => handleEducationChange('tenth', 'year', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded"
                                                    placeholder="2019"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 mb-6 pb-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">Skills</h2>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills (Press Enter to add)</label>
                                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-indigo-500">
                                    {form.skills && form.skills.map(skill => (
                                        <span key={skill} className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="text-indigo-600 hover:text-indigo-900">×</button>
                                        </span>
                                    ))}
                                    <input
                                        className="flex-grow outline-none bg-transparent min-w-[150px]"
                                        placeholder="e.g. React, Node.js, Python"
                                        onKeyDown={addSkill}
                                    />
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

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../../services/api.js";
import { User, MapPin, Phone, Github, Linkedin, Briefcase, GraduationCap, FileText, Save, RefreshCw, X } from "lucide-react";

// --- Components ---

const SectionTitle = ({ icon: Icon, title, description }) => (
    <div className="mb-6 flex items-start gap-3">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Icon size={20} />
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
    </div>
);

const InputGroup = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            {label} {error && <span className="text-red-500 text-xs font-normal ml-auto">{error}</span>}
        </label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <Icon size={18} />
                </div>
            )}
            <input
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                {...props}
            />
        </div>
    </div>
);

const SelectGroup = ({ label, error, options, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">
            {label} {error && <span className="text-red-500 text-xs font-normal ml-auto">{error}</span>}
        </label>
        <div className="relative">
            <select
                className={`w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none ${error ? 'border-red-300' : ''}`}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    </div>
);

const CompletionRing = ({ percentage }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-gray-100"
                />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${percentage === 100 ? 'text-green-500' : 'text-indigo-600'}`}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-bold ${percentage === 100 ? 'text-green-600' : 'text-indigo-700'}`}>
                    {percentage}%
                </span>
            </div>
        </div>
    );
};

// --- Main Component ---

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [completion, setCompletion] = useState(0);
    const [candidate, setCandidate] = useState(null);

    const [form, setForm] = useState({
        phone: "",
        rollNo: "",
        branch: "",
        location: "",
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

            if (profile) {
                setForm({
                    phone: profile.phone || "",
                    rollNo: profile.rollNo || "",
                    branch: profile.branch || "",
                    location: profile.location || "",
                    gender: profile.gender || "Male",
                    education: {
                        tenth: {
                            percentage: profile.education?.tenth?.percentage || "",
                            year: profile.education?.tenth?.year || ""
                        },
                        twelfth: {
                            percentage: profile.education?.twelfth?.percentage || "",
                            year: profile.education?.twelfth?.year || ""
                        },
                        btech: {
                            percentage: profile.education?.btech?.percentage || "",
                            year: profile.education?.btech?.year || "",
                            cgpa: profile.education?.btech?.cgpa || profile.education?.cgpa || ""
                        },
                    },
                    skills: profile.skills || [],
                    githubProfile: profile.githubProfile || "",
                    linkedinProfile: profile.linkedinProfile || ""
                });
            }
        } catch (err) {
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
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleEducationChange = (level, field, value) => {
        setForm(prev => ({
            ...prev,
            education: {
                ...prev.education,
                [level]: { ...prev.education[level], [field]: value }
            }
        }));
    };

    const addSkill = (e) => {
        if ((e.key === "Enter" || e.key === ",") && e.target.value.trim()) {
            e.preventDefault();
            const newSkill = e.target.value.trim();
            if (!form.skills.includes(newSkill)) {
                setForm(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
            }
            e.target.value = "";
        }
    };

    const removeSkill = (skill) => {
        setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const validate = () => {
        const newErrors = {};
        if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) newErrors.phone = "Invalid format";

        // Year validation
        const currentYear = new Date().getFullYear();
        ['tenth', 'twelfth', 'btech'].forEach(level => {
            const year = form.education[level].year;
            if (year && (year < 1990 || year > currentYear + 6)) newErrors[`${level}Year`] = "Invalid year";
        });

        ['tenth', 'twelfth'].forEach(level => {
            const pct = form.education[level].percentage;
            if (pct && (pct < 0 || pct > 100)) newErrors[`${level}Pct`] = "Invalid %";
        });

        const cgpa = form.education.btech.cgpa;
        if (cgpa && (cgpa < 0 || cgpa > 10)) newErrors.cgpa = "0-10 Scale";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.warn("Please check the form for errors.");
            return;
        }

        setSaving(true);
        try {
            const res = await api.post("/candidate/profile", form);
            setCandidate(res.data.candidate);
            setCompletion(res.data.profileCompletion);
            toast.success("Profile updated successfully!");
            window.dispatchEvent(new CustomEvent('profileUpdated'));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header Banner */}
            <div className="h-60 bg-gradient-to-r from-indigo-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#ffffff] opacity-10" style={{ backgroundImage: "radial-gradient(#444cf7 0.5px, transparent 0.5px)", backgroundSize: "10px 10px" }}></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-start pt-12">
                    <h1 className="text-3xl font-bold text-white relative z-10">Profile Dashboard</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT SIDEBAR: Completion & Actions (Sticky Group) */}
                    <div className="lg:col-span-4 space-y-6 self-start sticky top-24">
                        {/* Completion Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl shadow-indigo-100 p-8 flex flex-col items-center text-center border border-white/50 backdrop-blur-sm"
                        >
                            <CompletionRing percentage={completion} />
                            <h3 className="text-xl font-bold text-gray-900 mt-4">Profile Strength</h3>
                            <p className="text-gray-500 text-sm mt-1 px-4">
                                {completion === 100
                                    ? "Excellent! Your profile is fully optimized for job matching."
                                    : "Complete your profile to unlock better job matches."}
                            </p>

                            <div className="w-full mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <Save size={18} />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={fetchProfile}
                                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={18} />
                                    Reset Changes
                                </button>
                            </div>
                        </motion.div>

                        {/* Resume Status Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <FileText size={18} className="text-indigo-500" /> Resume Status
                            </h4>
                            {candidate?.resumeUrl ? (
                                <div className="text-sm">
                                    <p className="text-green-600 font-medium flex items-center gap-1 mb-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full" /> Uploaded
                                    </p>
                                    <a
                                        href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${candidate.resumeUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-indigo-600 underline hover:text-indigo-800 truncate block"
                                    >
                                        View Resume
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-red-400 rounded-full" /> Not Uploaded
                                </p>
                            )}
                        </div>
                    </div>
                    {/* RIGHT MAIN CONTENT */}
                    <div className="lg:col-span-8 space-y-8">
                        <form onSubmit={handleSubmit}>

                            {/* SECTION 1: PERSONAL DETAILS */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <SectionTitle icon={User} title="Personal Information" description="Basic details recruiters use to contact you." />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                        <div className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl border border-gray-200 cursor-not-allowed select-none">
                                            {candidate?.userId?.name || "User"}
                                        </div>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                                        <div className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl border border-gray-200 cursor-not-allowed select-none">
                                            {candidate?.userId?.email || "email@example.com"}
                                        </div>
                                    </div>

                                    <InputGroup label="Phone Number" icon={Phone} name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" error={errors.phone} />
                                    <InputGroup label="Current City" icon={MapPin} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Mumbai, India" />

                                    <SelectGroup label="Gender" name="gender" value={form.gender} onChange={handleChange} options={[
                                        { value: "Male", label: "Male" },
                                        { value: "Female", label: "Female" },
                                        { value: "Other", label: "Other" }
                                    ]} />

                                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 mt-2">
                                        <InputGroup label="LinkedIn Profile" icon={Linkedin} name="linkedinProfile" value={form.linkedinProfile} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                                        <InputGroup label="GitHub Profile" icon={Github} name="githubProfile" value={form.githubProfile} onChange={handleChange} placeholder="https://github.com/..." />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: ACADEMIC DETAILS */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mt-8">
                                <SectionTitle icon={GraduationCap} title="Academic Background" description="Your educational qualifications." />

                                <div className="space-y-6">
                                    {/* B.Tech */}
                                    <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                                        <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                            <Briefcase size={18} /> Undergraduate (B.Tech)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <InputGroup label="Branch" name="branch" value={form.branch} onChange={handleChange} placeholder="e.g. CS" className="bg-white" />
                                            <InputGroup label="Pass Year" value={form.education.btech.year} onChange={(e) => handleEducationChange('btech', 'year', e.target.value)} placeholder="2025" error={errors.btechYear} className="bg-white" />
                                            <InputGroup label="CGPA (Agg)" value={form.education.btech.cgpa} onChange={(e) => handleEducationChange('btech', 'cgpa', e.target.value)} placeholder="9.5" error={errors.cgpa} className="bg-white" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* 12th */}
                                        <div className="p-5 border border-gray-200 rounded-xl">
                                            <h4 className="font-bold text-gray-800 mb-4">Class XII / Diploma</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputGroup label="%" value={form.education.twelfth.percentage} onChange={(e) => handleEducationChange('twelfth', 'percentage', e.target.value)} placeholder="88.5" error={errors.twelfthPct} />
                                                <InputGroup label="Year" value={form.education.twelfth.year} onChange={(e) => handleEducationChange('twelfth', 'year', e.target.value)} placeholder="2021" error={errors.twelfthYear} />
                                            </div>
                                        </div>

                                        {/* 10th */}
                                        <div className="p-5 border border-gray-200 rounded-xl">
                                            <h4 className="font-bold text-gray-800 mb-4">Class X</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputGroup label="%" value={form.education.tenth.percentage} onChange={(e) => handleEducationChange('tenth', 'percentage', e.target.value)} placeholder="92.0" error={errors.tenthPct} />
                                                <InputGroup label="Year" value={form.education.tenth.year} onChange={(e) => handleEducationChange('tenth', 'year', e.target.value)} placeholder="2019" error={errors.tenthYear} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: SKILLS */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mt-8">
                                <SectionTitle icon={Briefcase} title="Skills & Expertise" description="Add technical skills to better match with jobs. Type and press Enter." />

                                <div className="p-2 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition-all min-h-[100px] flex flex-wrap content-start gap-2">
                                    {form.skills.map(skill => (
                                        <span key={skill} className="animate-fade-in inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 font-medium rounded-lg shadow-sm border border-indigo-100">
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="text-indigo-400 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        className="flex-grow min-w-[150px] bg-transparent outline-none p-2 text-gray-700 placeholder:text-gray-400"
                                        placeholder={form.skills.length === 0 ? "Type a skill (e.g. React) and press Enter..." : "Add more..."}
                                        onKeyDown={addSkill}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 pl-1">Tip: Be specific. Instead of "Web", try "MERN Stack" or "Next.js".</p>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

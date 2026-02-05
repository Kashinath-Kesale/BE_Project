import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import Logo from "../../components/Logo";

// ... icons ... (skipping unchanged lines is risky with replace_file_content unless I use exact chunks. I will target the top import block first)

// Actually I will do 2 separate replace calls to be safe.
// First: Imports.



// SVG Icons

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-indigo-500">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-indigo-500">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const UserPlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);


export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/register", { name, email, password, role });

      if (response.data.requiresVerification) {
        navigate("/check-email");
      } else {
        toast.success("Account created! Please login.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err?.response?.data?.message || "Registration failed.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8 relative">
      {/* Back Button */}
      <Link to="/" className="absolute top-6 left-6 p-2 rounded-full bg-white text-gray-600 hover:text-indigo-600 shadow-sm border border-gray-200 transition-all">
        <ArrowLeft size={24} />
      </Link>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-xl shadow-indigo-100 rounded-3xl overflow-hidden border border-gray-100">

        {/* Form Side */}
        <div className="bg-white p-6 sm:p-8 md:p-12 order-2 md:order-1 flex flex-col justify-center">
          <form onSubmit={onSubmit} className="w-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Create account</h1>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">Join Shortlist and get started.</p>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-50 rounded-2xl border border-gray-100">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all duration-200 ${role === 'candidate'
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200 font-semibold'
                  : 'text-gray-500 hover:bg-gray-100 font-medium'}`}
              >
                <UserIcon />
                <span className="text-sm">Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all duration-200 ${role === 'recruiter'
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200 font-semibold'
                  : 'text-gray-500 hover:bg-gray-100 font-medium'}`}
              >
                <BriefcaseIcon />
                <span className="text-sm">Recruiter</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full name</label>
                <div className="relative group">
                  <UserPlusIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="pl-11 pr-4 py-3 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" placeholder="Your full name" required />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <div className="relative group">
                  <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 pr-4 py-3 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" placeholder="you@example.com" required />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative group">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-12 py-3 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button disabled={loading} className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center disabled:translate-y-0">
              {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>}
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="mt-6 text-sm text-center text-gray-600">
              Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link>
            </div>
          </form>
        </div>

        {/* Informational Side */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-indigo-600 to-purple-700 text-white order-1 md:order-2 subpixel-antialiased relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/10">
                <Logo className="text-white w-7 h-7" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Shortlist</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-6">Join a new era of <br /> <span className="text-indigo-200">recruitment.</span></h2>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
              Whether you're sourcing top talent or seeking your next big opportunity, you're in the right place.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}


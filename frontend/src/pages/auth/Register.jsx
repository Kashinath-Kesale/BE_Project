import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api.js";


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
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/register", { name, email, password, role });

      if (response.data.requiresVerification) {
        navigate("/check-email");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err?.response?.data?.message || "Registration failed.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden">

        {/* Form Side */}
        <div className="bg-white p-8 sm:p-12 order-2 md:order-1">
          <form onSubmit={onSubmit}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500 mb-8">Join ResumeLab and get started.</p>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button type="button" onClick={() => setRole("candidate")} className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${role === 'candidate' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <UserIcon />
                <span className="font-semibold text-gray-800">Candidate</span>
              </button>
              <button type="button" onClick={() => setRole("recruiter")} className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${role === 'recruiter' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <BriefcaseIcon />
                <span className="font-semibold text-gray-800">Recruiter</span>
              </button>
            </div>

            {error && <div className="mb-4 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-center">{error}</div>}

            {/* Full Name Input */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <div className="relative">
                <UserPlusIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200" placeholder="Your full name" required />
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200" placeholder="you@example.com" required />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 py-3 w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button disabled={loading} className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-base shadow-md hover:bg-indigo-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
              {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>}
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="mt-8 text-sm text-center text-gray-600">
              Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link>
            </div>
          </form>
        </div>

        {/* Informational Side */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-indigo-700 text-white order-1 md:order-2 subpixel-antialiased">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M4 4v16h16" /><path d="m4 12 5 5" /><path d="M12 4h8" /><path d="m16 8 4-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">ResumeLab</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight text-black tracking-tight">Join a new era of recruitment and career growth.</h2>
          <p className="mt-4 text-indigo-100 text-lg">
            Whether you're sourcing top talent or seeking your next big opportunity, you're in the right place.
          </p>
        </div>

      </div>
    </div>
  );
}


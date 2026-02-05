import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import Logo from "../../components/Logo";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-6 h-6 text-indigo-500">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-6 h-6 text-indigo-500">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-6 h-6 text-indigo-500">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();

  // Cleanup session on mount
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
  }, []);

  const [role, setRole] = useState("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password, role });

      const { token, role: userRole, verified, name } = res.data;

      if (verified === false) {
        toast.error("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      if (name) localStorage.setItem("name", name);

      if (userRole === "recruiter") {
        navigate("/recruiter/dashboard", { replace: true });
        return;
      }

      if (userRole === "candidate") {
        navigate("/candidate/dashboard", { replace: true });
        return;
      }

      if (userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      if (err?.response?.status === 403) {
        toast.error(err?.response?.data?.message || "Please verify your email.");
      } else if (err?.response?.status === 401) {
        toast.error("Invalid email or password.");
      } else {
        toast.error(err?.response?.data?.message || "Login failed.");
      }
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
        {/* Info Section */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-indigo-600 to-purple-700 text-white subpixel-antialiased relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/10">
                <Logo className="text-white w-7 h-7" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Shortlist</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-6">
              Welcome back to the <br /> <span className="text-indigo-200">future of hiring.</span>
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
              Sign in to continue your journey. Find matched jobs, track applications, and connect with top-tier talent.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white p-8 sm:p-12 md:p-16">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Login</h1>
              <p className="text-gray-500">Select your role and enter your details.</p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-3 gap-3 p-1 bg-gray-50 rounded-2xl border border-gray-100">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 ${role === "candidate"
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200 font-semibold"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 font-medium"
                  }`}
              >
                <UserIcon />
                <span className="text-xs">Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 ${role === "recruiter"
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200 font-semibold"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 font-medium"
                  }`}
              >
                <BriefcaseIcon />
                <span className="text-xs">Recruiter</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 ${role === "admin"
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200 font-semibold"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 font-medium"
                  }`}
              >
                <AdminIcon />
                <span className="text-xs">Admin</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative group">
                  <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 pr-4 py-3.5 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative group">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-12 py-3.5 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
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

            <div className="flex items-center justify-end mb-6 text-sm">
              <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </Link>
            </div>

            <button
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center disabled:translate-y-0"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
                    5.291A7.962 7.962 0 014 12H0c0
                    3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="mt-8 text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                Create one
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

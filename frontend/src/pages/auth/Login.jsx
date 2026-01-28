import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api.js";

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
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password, role });

      const { token, role: userRole, verified, name } = res.data;

      if (verified === false) {
        setError("Please verify your email before logging in.");
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

      navigate("/", { replace: true });
    } catch (err) {
      if (err?.response?.status === 403) {
        setError(err?.response?.data?.message || "Please verify your email.");
      } else if (err?.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden">
        {/* Info Section */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-indigo-700 text-white subpixel-antialiased">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-white">
                <path d="M4 4v16h16" /><path d="m4 12 5 5" /><path d="M12 4h8" /><path d="m16 8 4-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">ResumeLab</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight text-black tracking-tight">
            Welcome back to the future of hiring.
          </h2>
          <p className="mt-4 text-indigo-100 text-lg">
            Sign in to continue your journey. Find matched jobs, track applications, and connect with top-tier talent.
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white p-8 sm:p-12">
          <form onSubmit={onSubmit}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-500 mb-8">Select your role and enter your details.</p>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${role === "candidate"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <UserIcon />
                <span className="font-semibold text-gray-800">Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${role === "recruiter"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <BriefcaseIcon />
                <span className="font-semibold text-gray-800">Recruiter</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-center">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
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

            <div className="flex items-center justify-between mb-6 text-sm">
              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="remember" className="text-gray-600">Remember me</label>
              </div>
              <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </Link>
            </div>

            <button
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-base shadow-md hover:bg-indigo-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
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

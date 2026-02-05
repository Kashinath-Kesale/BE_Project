import React, { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { motion } from "framer-motion";

const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;

// --- Icons (Enhanced with colorful backgrounds in usage) ---
const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
);

const ApplicationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m10 11-2 2 2 2" /><path d="m14 11 2 2-2 2" />
  </svg>
);

const RecruiterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </svg>
);

const InsightsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
    <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20V16" />
  </svg>
);

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

export default function Welcome() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 selection:bg-indigo-100 selection:text-indigo-700 font-sans text-gray-900 overflow-x-hidden relative">

      {/* Background Decor - Subtle Mesh/Gradients */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] bg-blue-50/50 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* --- Sticky Navbar --- */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${scrolled ? "bg-white/80 backdrop-blur-md border-gray-200 shadow-sm py-3" : "bg-transparent py-5"
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                <Logo className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                Shortlist
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold shadow-lg shadow-gray-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* --- Main Content --- */}
        <main className="pt-32 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-80px)]">

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide uppercase mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              AI-Powered Hiring V1.0
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Hire faster. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                Match smarter.
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              The intelligent hiring platform that connects top talent with perfect opportunities using advanced AI matching.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/register" className="group w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Start for free
                <span className="group-hover:translate-x-1 transition-transform"><ArrowRight /></span>
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-gray-200 text-gray-700 font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center">
                Log in
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-gray-400 grayscale opacity-70">
              {/* Simple minimal logos for "Trusted by" feel without real logos */}
              <div className="h-6 w-20 bg-gray-300 rounded opacity-30"></div>
              <div className="h-6 w-24 bg-gray-300 rounded opacity-30"></div>
              <div className="h-6 w-16 bg-gray-300 rounded opacity-30"></div>
              <div className="h-6 w-20 bg-gray-300 rounded opacity-30"></div>
            </div>
          </motion.div>

          {/* Abstract Hero Visual (Bento Grid of Features) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Decorative background blob behind cards */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-[3rem] transform rotate-3 scale-105 opacity-50 blur-xl -z-10" />

            <div className="grid grid-cols-2 gap-4 auto-rows-fr">

              {/* Card 1: AI Matches (Large) */}
              <div className="col-span-2 sm:col-span-1 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-indigo-100 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
                  <AiIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Matching</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our algorithms analyze resumes and job descriptions to find the perfect fit instantly.
                </p>
              </div>

              {/* Card 2: Applications */}
              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-purple-100 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                  <ApplicationIcon />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Smart Apply</h3>
                <p className="text-gray-500 text-xs">One-click applications with real-time status tracking.</p>
              </div>

              {/* Card 3: Recruiter Tools */}
              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-sky-100 transition-all group sm:translate-y-8">
                <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-sky-500/20">
                  <RecruiterIcon />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">For Recruiters</h3>
                <p className="text-gray-500 text-xs">Advanced dashboard to source and manage candidates.</p>
              </div>

              {/* Card 4: Insights (Large) */}
              <div className="col-span-2 sm:col-span-1 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-emerald-100 transition-all group sm:translate-y-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
                  <InsightsIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Deep Insights</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Get detailed analytics on your profile performance and match scores.
                </p>
              </div>

            </div>
          </motion.div>

        </main>

        {/* --- Minimal Footer --- */}
        <footer className="border-t border-gray-100 py-8 mt-12 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Shortlist. Note: This is a Final Year Project.</p>
        </footer>

      </div>
    </div>
  );
}



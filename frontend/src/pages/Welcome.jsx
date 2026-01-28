import React from "react";

const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;

// Icons
const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
);

const ApplicationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m10 11-2 2 2 2" /><path d="m14 11 2 2-2 2" />
  </svg>
);

const RecruiterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </svg>
);

const InsightsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
    <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20V16" />
  </svg>
);

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M4 4v16h16" />
                <path d="m4 12 5 5" />
                <path d="M12 4h8" />
                <path d="m16 8 4-4" />
              </svg>
            </div>
            <span className="text-gray-900 text-xl font-bold tracking-tight">ResumeLab</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors duration-300">Login</Link>
            <Link to="/register" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all duration-300">Get Started</Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 items-center">

          {/* Hero Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tighter">
              Hire faster. <br /> Get hired <span className="text-indigo-600">smarter</span>.
            </h1>
            <p className="text-gray-600 mt-6 text-lg max-w-lg mx-auto lg:mx-0">
              Upload your resume, discover matched jobs, and apply effortlessly. Recruiters source the best talent with structured workflows.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:shadow-indigo-300 hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1">
                Create Free Account
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-gray-400 text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-500 transition-all duration-300">
                I have an account
              </Link>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-lg hover:border-indigo-400 hover:shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center mb-3">
                <AiIcon />
              </div>
              <h3 className="font-semibold text-gray-900">AI Job Matches</h3>
              <p className="text-sm text-gray-500">Find relevant roles.</p>
            </div>
            <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-lg hover:border-indigo-400 hover:shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center mb-3">
                <ApplicationIcon />
              </div>
              <h3 className="font-semibold text-gray-900">Smart Applications</h3>
              <p className="text-sm text-gray-500">Apply in seconds.</p>
            </div>
            <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-lg hover:border-indigo-400 hover:shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-sky-500 flex items-center justify-center mb-3">
                <RecruiterIcon />
              </div>
              <h3 className="font-semibold text-gray-900">Recruiter Tools</h3>
              <p className="text-sm text-gray-500">Source top talent.</p>
            </div>
            <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-lg hover:border-indigo-400 hover:shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center mb-3">
                <InsightsIcon />
              </div>
              <h3 className="font-semibold text-gray-900">Resume Insights</h3>
              <p className="text-sm text-gray-500">Improve your profile.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


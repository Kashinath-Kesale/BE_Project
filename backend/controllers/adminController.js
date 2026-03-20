import Recruiter from "../models/Recruiter.js";

// Get all pending recruiters
export const getPendingRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find({ status: "pending" });
    res.json(recruiters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve recruiter
export const approveRecruiter = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });

    recruiter.status = "approved";
    await recruiter.save();

    res.json({ message: "Recruiter approved", recruiter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject recruiter
export const rejectRecruiter = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });

    recruiter.status = "rejected";
    await recruiter.save();

    res.json({ message: "Recruiter rejected", recruiter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Candidate from "../models/Candidate.js";

export const getPlatformAnalytics = async (req, res) => {
  try {
    const totalCandidates = await User.countDocuments({ role: "candidate" });
    const totalRecruiters = await User.countDocuments({ role: "recruiter" });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Get all applications with populated User and Job
    const applicationsQuery = await Application.find()
      .populate("candidateId", "name email")
      .populate("jobId", "title companyName")
      .sort({ createdAt: -1 });

    // Fetch Candidate profiles to attach Branch and CGPA data
    const candidates = await Candidate.find().select("userId branch education");
    const candidateMap = {};
    candidates.forEach(c => {
      if (c.userId) {
        candidateMap[c.userId.toString()] = {
          branch: c.branch,
          cgpa: c.education?.btech?.cgpa,
        };
      }
    });

    const applications = applicationsQuery.map(app => {
      const candidateData = app.candidateId ? candidateMap[app.candidateId._id.toString()] : null;
      return {
        _id: app._id,
        candidateName: app.candidateId?.name || "Unknown User",
        candidateEmail: app.candidateId?.email || "N/A",
        branch: candidateData?.branch || "N/A",
        cgpa: candidateData?.cgpa || "N/A",
        jobTitle: app.jobId?.title || "Deleted Job",
        companyName: app.jobId?.companyName || "Unknown Company",
        status: app.status,
        appliedAt: app.createdAt
      };
    });

    res.json({
      metrics: {
        totalCandidates,
        totalRecruiters,
        totalJobs,
        totalApplications
      },
      applications
    });

  } catch (error) {
    console.error("Platform Analytics Error:", error);
    res.status(500).json({ message: error.message });
  }
};

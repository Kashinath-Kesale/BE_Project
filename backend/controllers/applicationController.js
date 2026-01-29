import Link from "mongoose";
import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Recruiter from "../models/Recruiter.js";
import Candidate from "../models/Candidate.js";
import { computeMatchPercentage } from "../utils/matching.js";

// Apply to job
export const applyToJob = async (req, res) => {
  try {
    const { jobId, resumeUrl } = req.body;

    // Check duplicate
    const existing = await Application.findOne({
      jobId,
      candidateId: req.user._id,
    });
    if (existing) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user._id,
      resumeUrl,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get candidate's applications
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate("jobId", "title companyName location description requirements type");

    // Filter out applications where the job has been deleted
    const validApplications = applications.filter(app => app.jobId);

    res.json(validApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all applications for recruiter
export const getRecruiterApplications = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });

    const jobs = await Job.find({ recruiterId: recruiter._id });
    const jobIds = jobs.map((j) => j._id);

    // Fetch applications
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate("candidateId", "name email")
      .populate("jobId", "title")
      .lean();

    // Populate extra details
    const enhancedApplications = await Promise.all(applications.map(async (app) => {
      if (!app.candidateId) return app;

      // map Candidate model
      // const CandidateModel = mongoose.model("Candidate"); // We can use the imported model directly now

      const candidateProfile = await Candidate.findOne({ userId: app.candidateId._id }).lean();

      // Calculate Match Score on the fly
      // Note: app.jobId is populated with title mainly, but we need full job details for matching logic (criteria, skills)
      // Since we already fetched `jobs` above for filtering, we can find the full job object.
      // But `jobs` array is local to getRecruiterApplications. 
      // For getJobApplications, we have `job` object.

      let matchScore = 0;
      // We need to fetch full job if not available or optimized by looking up in a map
      // Optimization: Fetch full job details in population or lookup
      // In getRecruiterApplications, we fetched `jobs` above. Let's find it.

      // Since we can't easily access the `jobs` array from inside this map if we don't pass it, 
      // let's do a quick lookup or rely on populate if we changed it.
      // Better: In getRecruiterApplications, 'jobs' variable IS available in closure.

      const fullJob = await Job.findById(app.jobId._id).lean(); // Fetch full job for accurate scoring
      if (candidateProfile && fullJob) {
        matchScore = computeMatchPercentage(candidateProfile, fullJob);
      }

      return {
        ...app,
        matchScore, // <--- Added Field
        candidate: {
          _id: app.candidateId._id,
          name: app.candidateId.name,
          email: app.candidateId.email,
          avatarUrl: candidateProfile?.avatarUrl,
          resumeUrl: app.resumeUrl || candidateProfile?.resumeUrl,
          phone: candidateProfile?.phone,
          skills: candidateProfile?.keywords || []
        }
      };
    }));

    // Sort by Match Score Descending
    enhancedApplications.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ applications: enhancedApplications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications for specific job
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter || job.recruiterId.toString() !== recruiter._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view these applications" });
    }

    const applications = await Application.find({ jobId })
      .populate("candidateId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const enhancedApplications = await Promise.all(applications.map(async (app) => {
      if (!app.candidateId) return app;

      const candidateProfile = await Candidate.findOne({ userId: app.candidateId._id }).lean();

      // Calculate Match Score
      let matchScore = 0;
      if (candidateProfile && job) {
        matchScore = computeMatchPercentage(candidateProfile, job);
      }

      return {
        ...app,
        matchScore, // <--- Added Field
        candidate: {
          _id: app.candidateId._id,
          name: app.candidateId.name,
          email: app.candidateId.email,
          avatarUrl: candidateProfile?.avatarUrl,
          resumeUrl: app.resumeUrl || candidateProfile?.resumeUrl,
          phone: candidateProfile?.phone,
          skills: candidateProfile?.keywords || []
        }
      };
    }));

    // Sort by Match Score Descending
    enhancedApplications.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ applications: enhancedApplications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Withdraw application
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    // Check if the application belongs to the current user
    if (application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only withdraw your own applications" });
    }

    // Restriction: Cannot withdraw if already processed
    if (application.status !== "applied") {
      return res.status(400).json({ message: `Cannot withdraw application that is ${application.status}` });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application withdrawn successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
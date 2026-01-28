import Link from "mongoose";
import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Recruiter from "../models/Recruiter.js";
import Candidate from "../models/Candidate.js";

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
    res.json(applications);
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



      return {
        ...app,
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

      return {
        ...app,
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
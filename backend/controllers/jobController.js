import Job from "../models/Job.js";
import Recruiter from "../models/Recruiter.js";

// Create new job
export const createJob = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter || recruiter.status !== "approved") {
      return res.status(403).json({ message: "Recruiter not approved to post jobs" });
    }

    const { title, description, keywords = [], location, minExperience } = req.body;

    const job = await Job.create({
      title,
      companyName: recruiter.companyName || req.body.companyName,
      recruiterId: recruiter._id,
      description,
      keywords,
      location,
      minExperience,
      createdBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List all jobs
export const listJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List recruiter's jobs
export const listMyJobs = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    const jobs = await Job.find({ recruiterId: recruiter._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single job details
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    job.title = req.body.title || job.title;
    job.description = req.body.description || job.description;
    job.keywords = req.body.keywords || job.keywords;
    job.location = req.body.location || job.location;
    job.minExperience = req.body.minExperience || job.minExperience;

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await job.deleteOne();
    res.json({ message: "Job removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Job from "../models/Job.js";
import Recruiter from "../models/Recruiter.js";

// ✅ Create job (approved or pending recruiters)
export const createJob = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter || (recruiter.status !== "approved" && recruiter.status !== "pending")) {
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

// ✅ Public list of jobs
export const listJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ List my jobs (protected)
export const listMyJobs = async (req, res) => {
  try {
    console.log("listMyJobs called for user:", req.user._id);
    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    console.log("Recruiter found:", recruiter);
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    const jobs = await Job.find({ recruiterId: recruiter._id }).sort({ createdAt: -1 });
    console.log("Jobs found:", jobs.length);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single job (details page)
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update job (only job creator)
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

// ✅ Delete job (only job creator)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await job.remove();
    res.json({ message: "Job removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

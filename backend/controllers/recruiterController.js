import Recruiter from "../models/Recruiter.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

// ✅ Update or create recruiter profile
export const updateRecruiterProfile = async (req, res) => {
  try {
    let recruiter = await Recruiter.findOne({ userId: req.user._id });

    // 📝 Update fields
    if (!recruiter) {
      console.log("Creating new recruiter profile...");
      recruiter = new Recruiter({
        userId: req.user._id,
        companyName: req.body.companyName,
        designation: req.body.designation,
        companyWebsite: req.body.companyWebsite,
        location: req.body.location,
        description: req.body.description,
        status: "pending", // default
      });
    } else {
      console.log("Updating existing recruiter profile...");
      recruiter.companyName = req.body.companyName || recruiter.companyName;
      recruiter.designation = req.body.designation || recruiter.designation;
      recruiter.companyWebsite = req.body.companyWebsite || recruiter.companyWebsite;

      // Explicitly check for fields to allow updates
      if (req.body.location !== undefined) recruiter.location = req.body.location;
      if (req.body.description !== undefined) recruiter.description = req.body.description;
    }

    console.log("Saving recruiter data:", recruiter);
    await recruiter.save();
    console.log("Recruiter saved successfully.");
    res.json(recruiter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get recruiter profile
export const getRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }
    res.json(recruiter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all jobs posted by logged-in recruiter
export const getRecruiterJobs = async (req, res) => {
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

// ✅ Get recruiter stats
export const getRecruiterStats = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    const activeJobs = await Job.countDocuments({ recruiterId: recruiter._id });
    const jobIds = await Job.find({ recruiterId: recruiter._id }).select('_id');
    const applications = await Application.find({ jobId: { $in: jobIds } });
    const totalApplicants = applications.length;
    const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
    const hired = applications.filter(a => a.status === 'hired').length;

    res.json({ activeJobs, totalApplicants, shortlisted, hired });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get recent applications for recruiter
export const getRecentApplications = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    const jobIds = await Job.find({ recruiterId: recruiter._id }).select('_id');
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('candidateId', 'name')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recent = applications.map(a => ({
      name: a.candidateId.name,
      jobTitle: a.jobId.title,
      status: a.status
    }));

    res.json(recent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

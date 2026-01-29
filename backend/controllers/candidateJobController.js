// backend/controllers/candidateJobController.js
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import { computeMatchPercentage } from "../utils/matching.js";

/**
 * Get Jobs with Weighted Match Score
 */
export const getJobsWithMatch = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.user._id });

    // We need all jobs
    const jobs = await Job.find().sort({ createdAt: -1 });

    const jobsWithMatch = jobs.map(job => {
      // New: Pass full objects to matching util
      const match = computeMatchPercentage(candidate, job);
      return { job, matchPercentage: match };
    });

    // Optional: Sort by match score?
    jobsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(jobsWithMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

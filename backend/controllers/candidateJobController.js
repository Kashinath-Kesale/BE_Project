// backend/controllers/candidateJobController.js
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import { computeMatchPercentage } from "../utils/matching.js";
import axios from "axios";

const PARSER_URL = process.env.PARSER_URL || "http://localhost:8000"; // python service base

/**
 * Fetches all jobs and calculates a match percentage for the current candidate.
 * Uses the Python AI Service for semantic matching (TF-IDF).
 */
export const getJobsWithMatch = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.user._id });
    const jobs = await Job.find().sort({ createdAt: -1 });

    // Calculate match scores in parallel
    const jobsWithMatch = await Promise.all(jobs.map(async (job) => {
      let aiScore = 0;

      try {
        const resumeText = candidate.parsedText || "";


        // Only call AI service if resume text exists
        if (resumeText) {
          const resp = await axios.post(`${PARSER_URL}/match`, {
            resume_text: resumeText,
            job_description: job.description || "",
            job_keywords: job.keywords || []
          }, { timeout: 5000 });

          aiScore = resp.data.match_percentage || 0;
        }
      } catch (err) {
        // Log critical AI failure
        console.error(`CRITICAL: AI Match Service failed for job ${job._id}. Error:`, err.message);
        console.error("Using fallback score of 0.");
      }

      // Compute final weighted score
      const match = computeMatchPercentage(candidate, job, aiScore);
      return { job, matchPercentage: match };
    }));

    // Sort jobs by highest match matchPercentage
    jobsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(jobsWithMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

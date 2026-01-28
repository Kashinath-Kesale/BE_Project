import express from "express";
import { createJob, listJobs, listMyJobs, deleteJob, updateJob } from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// List all jobs
router.get("/", listJobs);

// Recruiter: list my jobs
router.get("/my", protect, listMyJobs);

// Recruiter: create new job
router.post("/", protect, createJob);

// Recruiter: update a job
router.put("/:id", protect, updateJob);

// Recruiter: delete a job
router.delete("/:id", protect, deleteJob);

export default router;

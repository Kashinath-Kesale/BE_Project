import express from "express";
import { createJob, listJobs, listMyJobs, deleteJob } from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: list all jobs
router.get("/", listJobs);

// Recruiter: list my jobs
router.get("/my", protect, listMyJobs);

// Recruiter: create new job
router.post("/", protect, createJob);

// Recruiter: delete a job
router.delete("/:id", protect, deleteJob);

export default router;

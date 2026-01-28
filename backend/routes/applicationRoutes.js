import express from "express";
import {
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Candidate
router.post("/", protect, applyToJob);
router.get("/my", protect, getMyApplications);
router.delete("/:id", protect, withdrawApplication);

// Recruiter
router.get("/recruiter", protect, getRecruiterApplications);
router.get("/job/:jobId", protect, getJobApplications);
router.patch("/:id/status", protect, updateApplicationStatus);

export default router;

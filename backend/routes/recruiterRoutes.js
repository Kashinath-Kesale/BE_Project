import express from "express";
import { updateRecruiterProfile, getRecruiterProfile, getRecruiterJobs, getRecruiterStats, getRecentApplications } from "../controllers/recruiterController.js";
import { protect, recruiterOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/profile", protect, recruiterOnly, updateRecruiterProfile);

router.get("/profile", protect, recruiterOnly, getRecruiterProfile);

router.get("/jobs", protect, recruiterOnly, getRecruiterJobs);

router.get("/stats", protect, recruiterOnly, getRecruiterStats);

router.get("/recent-applications", protect, recruiterOnly, getRecentApplications);

export default router;

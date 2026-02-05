import express from "express";
import { updateCandidateProfile, getCandidateProfile } from "../controllers/candidateController.js";
import { protect, candidateOnly } from "../middleware/authMiddleware.js";
import { getJobsWithMatch } from "../controllers/candidateJobController.js";


const router = express.Router();

router.post("/profile", protect, candidateOnly, updateCandidateProfile);
router.get("/profile", protect, candidateOnly, getCandidateProfile);
router.get("/jobs", protect, candidateOnly, getJobsWithMatch);


export default router;

import express from "express";
import { updateCandidateProfile, getCandidateProfile, uploadAvatar } from "../controllers/candidateController.js";
import { protect, candidateOnly } from "../middleware/authMiddleware.js";
import { getJobsWithMatch } from "../controllers/candidateJobController.js";
import { uploadAvatarStorage } from "../utils/multer.js";


const router = express.Router();

router.post("/profile", protect, candidateOnly, updateCandidateProfile);
router.get("/profile", protect, candidateOnly, getCandidateProfile);
router.get("/jobs", protect, candidateOnly, getJobsWithMatch);
router.post("/avatar", protect, candidateOnly, uploadAvatarStorage.single("avatar"), uploadAvatar);


export default router;

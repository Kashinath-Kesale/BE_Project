import express from "express";
import { getPendingRecruiters, approveRecruiter, rejectRecruiter, getPlatformAnalytics } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// only admin can access
router.get("/recruiters/pending", protect, adminOnly, getPendingRecruiters);
router.post("/recruiters/:id/approve", protect, adminOnly, approveRecruiter);
router.post("/recruiters/:id/reject", protect, adminOnly, rejectRecruiter);

// platform analytics
router.get("/analytics", protect, adminOnly, getPlatformAnalytics);

export default router;

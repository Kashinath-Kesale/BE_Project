import express from "express";
import { registerUser, loginUser, verifyEmail, resendVerification, changePassword, forgotPassword, resetPassword, getCurrentUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// Verify email
router.get("/verify", verifyEmail);
router.post("/resend-verification", resendVerification);

// Message: Get current user info
router.get("/me", protect, getCurrentUser);
router.post("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

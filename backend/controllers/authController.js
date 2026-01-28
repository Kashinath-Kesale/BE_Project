import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/email.js";

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Verification token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const isVerified = process.env.SKIP_EMAIL === 'true';
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified,
      verificationTokenHash: isVerified ? undefined : tokenHash,
      verificationExpires: isVerified ? undefined : expires,
    });

    let verificationLink = null;
    if (!isVerified) {
      verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify?token=${rawToken}`;

      const html = `
        <p>Hi ${name},</p>
        <p>Please verify your email to activate your account:</p>
        <p><a href="${verificationLink}" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
      `;

      try {
        await sendEmail({ to: email, subject: "Verify your email", html });
      } catch (emailError) {
        console.error("Verification email failed:", emailError?.message);
        return res.status(500).json({
          message: "Registration successful, but verification email failed.",
          error: emailError?.message,
          verificationLink // For dev/debugging
        });
      }
    }

    const message = isVerified ? "Registered successfully." : "Registered successfully. Please check your email.";
    return res.status(201).json({ message, requiresVerification: !isVerified, verificationLink });

  } catch (error) {
    console.error("Registration Error:", error?.message);
    if (error.code === 11000) return res.status(400).json({ message: "Email already exists" });
    return res.status(500).json({ message: "Registration failed." });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Enforce Role Check
    if (role && user.role !== role) {
      const correctPortal = user.role === "recruiter" ? "Recruiter" : "Candidate";
      return res.status(403).json({
        message: `You are registered as a ${user.role}. Please login from the ${correctPortal} tab.`,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.isVerified,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    if (!token) return res.status(400).json({ message: "Verification token missing" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationTokenHash: tokenHash,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired link" });

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// Resend verification email
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.verificationTokenHash = tokenHash;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify?token=${rawToken}`;
    const html = `
      <p>Hi ${user.name},</p>
      <p>Here’s a new verification link:</p>
      <p><a href="${verifyUrl}" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
    `;

    if (process.env.SKIP_EMAIL === "true") {
      console.log("Verification Link (Skipped Email):", verifyUrl);
      return res.json({ message: "Verification email resent (skipped). Check console." });
    } else {
      await sendEmail({ to: email, subject: "Verify your email", html });
      return res.json({ message: "Verification email resent successfully." });
    }
  } catch (error) {
    console.error("Resend Error:", error);
    res.status(500).json({ message: "Failed to resend verification email" });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    return res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
  } catch (error) {
    console.error('getCurrentUser Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: "Both passwords required" });

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

// Forbidden password reset request
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent." });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;
    const html = `
      <p>Hi ${user.name},</p>
      <p>Click below to reset your password:</p>
      <p><a href="${resetUrl}" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>Link expires in 1 hour.</p>
    `;

    await sendEmail({ to: email, subject: "Password Reset Request", html });
    return res.json({ message: "If that email exists, a reset link has been sent." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and password required" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

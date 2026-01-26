import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/email.js";

// 🟢 REGISTER USER
export const registerUser = async (req, res) => {
  console.log("🟢 registerUser called with:", req.body);
  try {
    console.log("🟡 Incoming registration request:", req.body);

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      console.log("🔴 Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("🔴 User already exists with email:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("🟢 Creating user... generating salt and hashing password");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("🟢 Generating verification token...");
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log("🟢 Creating new user document...");
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

    console.log("✅ User created successfully:", user.email);

    let verificationLink = null;
    if (!isVerified) {
      verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify?token=${rawToken}`;
      console.log("✅ Verification link:", verificationLink);

      const html = `
        <p>Hi ${name},</p>
        <p>Please verify your email to activate your account:</p>
        <p><a href="${verificationLink}" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
      `;

      console.log("📨 Sending verification email to:", email);
      let emailSent = false;

      try {
        await sendEmail({ to: email, subject: "Verify your email", html });
        emailSent = true;
        console.log("✅ Verification email sent successfully!");
      } catch (emailError) {
        console.error("❌ Failed to send verification email:", emailError?.message || emailError);

        // If email fails, we still save the user but return an error message
        // The user can request a new verification email later
        return res.status(500).json({
          message: "Registration successful, but verification email could not be sent. Please try resending verification email or contact support.",
          error: emailError?.message,
          // Include verification link in response for development/debugging (remove in production if needed)
          verificationLink
        });
      }
    }

    const message = isVerified ? "Registered successfully." : "Registered successfully. Please check your email to verify your account.";

    return res.status(201).json({ message, requiresVerification: !isVerified, verificationLink });
  } catch (error) {
    console.error("❌ Registration Error:", error?.message || error);
    console.error("❌ Full error stack:", error.stack);

    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message || "Validation error" });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (error.name === 'MongoServerError') {
      return res.status(500).json({ message: "Database error. Please try again." });
    }

    return res.status(500).json({ message: error.message || "Registration failed. Please try again." });
  }
};


// 🟡 LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body; // Expect role from frontend
    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // 🔒 Enforce Role Check
    if (role && user.role !== role) {
      const correctPortal =
        user.role === "recruiter" ? "Recruiter" : "Candidate";
      return res.status(403).json({
        message: `You are registered as a ${user.role}. Please login from the ${correctPortal} tab.`,
      });
    }

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.isVerified,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// 🟢 VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    if (!token)
      return res.status(400).json({ message: "Verification token missing" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationTokenHash: tokenHash,
      verificationExpires: { $gt: new Date() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link" });

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationExpires = undefined;
    await user.save();

    console.log("✅ User verified:", user.email);
    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// 🟣 RESEND VERIFICATION EMAIL
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

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

    // 4. Send email (or skip if dev mode)
    if (process.env.SKIP_EMAIL === "true") {
      console.log("---------------------------------------------------");
      console.log("🔕 SKIP_EMAIL=true. Verification Link:");
      console.log(verifyUrl);
      console.log("---------------------------------------------------");
      console.log("✅ Verification email resent successfully (skipped sending)!");
      return res.json({ message: "Verification email resent successfully (skipped sending). Please check console for link." });
    } else {
      console.log("🔁 Sending verification email to:", email);
      try {
        await sendEmail({ to: email, subject: "Verify your email", html });
        console.log("✅ Verification email resent successfully!");
        return res.json({ message: "Verification email resent successfully. Please check your email." });
      } catch (emailError) {
        console.error("❌ Failed to resend verification email:", emailError?.message || emailError);
        return res.status(500).json({
          message: "Failed to resend verification email. Please check your email configuration or try again later.",
          error: emailError?.message
        });
      }
    }
  } catch (error) {
    console.error("❌ Resend Error:", error);
    res.status(500).json({ message: "Failed to resend verification email" });
  }
};

// � GET CURRENT USER (from token)
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    // req.user is populated by auth middleware (without password)
    return res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
  } catch (error) {
    console.error('❌ getCurrentUser Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// �🔵 CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Change Password Error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

// 🔵 FORGOT PASSWORD - Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.json({ message: "If that email exists, a password reset link has been sent." });
    }

    // Generate reset token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;
    console.log("🔐 Password reset link:", resetUrl);

    const html = `
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({ to: email, subject: "Password Reset Request", html });
      console.log("✅ Password reset email sent successfully!");
      return res.json({ message: "If that email exists, a password reset link has been sent." });
    } catch (emailError) {
      console.error("❌ Failed to send password reset email:", emailError?.message || emailError);
      return res.status(500).json({
        message: "Failed to send password reset email. Please try again later.",
        error: emailError?.message
      });
    }
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to process password reset request" });
  }
};

// 🔵 RESET PASSWORD - Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("✅ Password reset successfully for:", user.email);
    return res.json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

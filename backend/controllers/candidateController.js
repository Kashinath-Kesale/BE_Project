import Candidate from "../models/Candidate.js";
import { calculateProfileCompletion } from "../utils/profileCompletion.js";
import path from "path";

// Create or Update Candidate Profile
export const updateCandidateProfile = async (req, res) => {
  try {
    const { phone, rollNo, branch, education, resumeUrl, gender, skills, githubProfile, linkedinProfile, location } = req.body;

    let candidate = await Candidate.findOne({ userId: req.user._id });

    if (candidate) {
      candidate.phone = phone || candidate.phone;
      candidate.rollNo = rollNo || candidate.rollNo;
      candidate.branch = branch || candidate.branch;
      candidate.location = location || candidate.location;
      candidate.education = education || candidate.education;
      candidate.resumeUrl = resumeUrl || candidate.resumeUrl;
      candidate.gender = gender || candidate.gender;
      candidate.skills = skills || candidate.skills;
      candidate.githubProfile = githubProfile || candidate.githubProfile;
      candidate.linkedinProfile = linkedinProfile || candidate.linkedinProfile;
      await candidate.save();
    } else {
      candidate = await Candidate.create({
        userId: req.user._id,
        phone,
        rollNo,
        branch,
        location,
        education,
        resumeUrl,
        gender,
        skills,
        githubProfile,
        linkedinProfile
      });
    }

    const completion = calculateProfileCompletion(candidate);

    res.json({
      message: "Profile updated successfully",
      candidate,
      profileCompletion: completion,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Candidate Profile
export const getCandidateProfile = async (req, res) => {
  try {
    let candidate = await Candidate.findOne({ userId: req.user._id }).populate('userId', 'name email');

    // If no candidate profile exists, return empty profile with user info
    if (!candidate) {
      return res.json({
        candidate: {
          userId: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email
          },
          phone: "",
          rollNo: "",
          branch: "",
          education: { year: "", cgpa: "" },
          resumeUrl: null,
          parsedText: "",
          keywords: []
        },
        profileCompletion: 0
      });
    }

    const completion = calculateProfileCompletion(candidate);

    res.json({ candidate, profileCompletion: completion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const publicUrl = `/uploads/avatars/${req.user._id}/${req.file.filename}`;

    let candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      candidate = await Candidate.create({ userId: req.user._id, avatarUrl: publicUrl });
    } else {
      candidate.avatarUrl = publicUrl;
      await candidate.save();
    }

    const completion = calculateProfileCompletion(candidate);
    res.json({ message: "Avatar uploaded", candidate, profileCompletion: completion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

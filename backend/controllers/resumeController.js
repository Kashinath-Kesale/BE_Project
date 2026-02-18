import Candidate from "../models/Candidate.js";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

const PARSER_URL = process.env.PARSER_URL || "http://localhost:8000/parse"; // python service

/**
 * Uploads a resume file and parses it using the Python AI service.
 * Extracts text, skills, and contact info to update the Candidate profile.
 */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = req.file.path;
    // Fix: Construct URL matching multer's nested storage: /uploads/resumes/{userId}/{filename}
    const userId = req.user ? String(req.user._id) : "anonymous";
    const publicUrl = `/uploads/resumes/${userId}/${req.file.filename}`;

    // Prepare form data for Python Parser Service
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    let parsedText = "";
    let keywords = [];
    let extractedEmail = null;
    let extractedPhone = null;

    try {
      // Call Python AI Service
      const resp = await axios.post(PARSER_URL, form, {
        headers: { ...form.getHeaders() },
        timeout: 30000,
      });

      console.log("AI Parser Response:", resp.data);

      parsedText = resp.data.parsedText || "";
      keywords = resp.data.keywords || [];
      extractedEmail = resp.data.email;
      extractedPhone = resp.data.phone;

    } catch (err) {
      console.warn("AI Parser failed, proceeding with raw file upload only:", err.message);
    }

    // Find or Initialize Candidate
    let candidate = await Candidate.findOne({ userId: req.user._id });

    if (candidate) {
      candidate.resumeUrl = publicUrl;
      candidate.parsedText = parsedText;

      // Auto-fill extracted data if missing
      if (!candidate.phone && extractedPhone) candidate.phone = extractedPhone;

      // Merge extracted skills with existing ones
      if (keywords && keywords.length > 0) {
        const existingSkills = new Set(candidate.skills || []);
        keywords.forEach(k => existingSkills.add(k));
        candidate.skills = Array.from(existingSkills);
      }

      await candidate.save();
    } else {
      // Create new candidate profile
      candidate = await Candidate.create({
        userId: req.user._id,
        phone: extractedPhone || "Pending",
        resumeUrl: publicUrl,
        parsedText: parsedText,
        skills: keywords || [],
        rollNo: "Pending",
        branch: "Pending",
      });
    }

    res.json({
      message: "Resume processed successfully",
      candidate,
      extractedData: {
        skills: keywords,
        email: extractedEmail,
        phone: extractedPhone
      }
    });

  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
};

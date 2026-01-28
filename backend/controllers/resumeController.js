import Candidate from "../models/Candidate.js";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

const PARSER_URL = process.env.PARSER_URL || "http://localhost:8000/parse"; // python service

// Upload resume and parse content
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = req.file.path;
    const publicUrl = `/uploads/resumes/${req.user._id}/${req.file.filename}`;

    // Call external parser service
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    let parsedText = "";
    let keywords = [];

    try {
      const resp = await axios.post(PARSER_URL, form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });
      parsedText = resp.data.parsedText || "";
      keywords = resp.data.keywords || [];
    } catch (err) {
      console.warn("Parser service failed, saving file without parsed data", err.message);
      // fallback: we keep resumeUrl but no parsedText/keywords
    }

    // upsert Candidate document
    let candidate = await Candidate.findOne({ userId: req.user._id });
    if (candidate) {
      candidate.resumeUrl = publicUrl;
      if (parsedText) candidate.parsedText = parsedText;
      if (keywords && keywords.length) candidate.keywords = keywords;
      await candidate.save();
    } else {
      candidate = await Candidate.create({
        userId: req.user._id,
        // keep other fields empty / they should be filled through profile endpoint
        resumeUrl: publicUrl,
        parsedText,
        keywords,
      });
    }

    res.json({ message: "Resume uploaded", candidate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

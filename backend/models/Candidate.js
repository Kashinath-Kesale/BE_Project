import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String, default: "" },
    rollNo: { type: String, default: "" },
    branch: { type: String, default: "" },
    location: { type: String, default: "" }, // For matching logic
    avatarUrl: { type: String },
    education: {
      tenth: { percentage: Number, year: Number },
      twelfth: { percentage: Number, year: Number },
      btech: { percentage: Number, year: Number, cgpa: String }, // Renaming/Structuring existing fields
    },
    skills: [{ type: String }],
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    githubProfile: { type: String },
    linkedinProfile: { type: String },
    resumeUrl: { type: String },
    parsedText: { type: String },     // full extracted text from resume
    keywords: [{ type: String }],     // keywords extracted from resume
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", candidateSchema);

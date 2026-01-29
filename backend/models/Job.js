import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }, // Added description field
    companyName: { type: String },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter" },
    parsedText: { type: String },
    keywords: [{ type: String }],
    location: { type: String },
    minExperience: { type: String },
    criteria: {
      minTenthPercent: { type: Number },
      minTwelfthPercent: { type: Number },
      minCgpa: { type: Number },
      eligibleBranches: [{ type: String }],
      gender: { type: String, enum: ["Any", "Male", "Female"], default: "Any" },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);

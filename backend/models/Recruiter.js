import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String },
    designation: { type: String },
    companyWebsite: { type: String },
    location: { type: String },
    description: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Recruiter", recruiterSchema);

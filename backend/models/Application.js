import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeUrl: { type: String }, // optional (in case you want to allow uploading resume)
    status: { 
      type: String, 
      enum: ["applied", "shortlisted", "rejected"], 
      default: "applied" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);

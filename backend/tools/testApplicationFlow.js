import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Application from "../models/Application.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();
connectDB();

const testApplicationFlow = async () => {
    try {
        console.log("🚀 Testing Job Application Flow...");

        // 1. Setup Data
        const alice = await Candidate.findOne({ "education.tenth.percentage": 95 }); // Alice
        const job = await Job.findOne({ title: "Senior SDE II" }); // Senior SDE II

        if (!alice || !job) {
            console.error("❌ Setup failed: Alice or Senior SDE II job not found. Run seedBulkData.js first.");
            process.exit(1);
        }

        console.log(`\n📋 Candidate: ${alice.user} (Alice)`);
        console.log(`📋 Job: ${job.title} (ID: ${job._id})`);

        // 2. Clean previous applications for this pair
        await Application.deleteMany({ candidateId: alice.userId, jobId: job._id });

        // 3. Simulate "Apply"
        console.log("\n🔹 Simulating Application...");
        const newApplication = new Application({
            jobId: job._id,
            candidateId: alice.userId,
            status: "applied"
        });
        await newApplication.save();
        console.log("✅ Application Saved to DB.");

        // 4. Simulate Recruiter Fetching Applications
        console.log("\n🔹 Simulating Recruiter View...");
        const applicationsForJob = await Application.find({ jobId: job._id }).populate("candidateId");

        // candidateId in Application is ref to User. alice.userId is that User ID.
        const foundApp = applicationsForJob.find(app => app.candidateId._id.toString() === alice.userId.toString());

        if (foundApp) {
            console.log("✅ Recruiter found the application.");
            // foundApp.candidateId is the populated User object
            console.log(`   Candidate Name in App: ${foundApp.candidateId.name || foundApp.candidateId.email}`);
        } else {
            console.error("❌ Recruiter could NOT find the application.");
        }

        // 5. Simulate Status Update
        console.log("\n🔹 Simulating Status Update to 'shortlisted'...");
        if (foundApp) {
            foundApp.status = "shortlisted";
            await foundApp.save();
            console.log("✅ Status updated in DB.");

            // 6. Verify Candidate View
            const updatedApp = await Application.findOne({ _id: foundApp._id });
            if (updatedApp.status === "shortlisted") {
                console.log("✅ Candidate sees updated status: shortlisted");
            } else {
                console.error("❌ Status update failed persistence.");
            }
        }


        console.log("\n🎉 Flow Verification Complete!");
        process.exit();

    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

testApplicationFlow();

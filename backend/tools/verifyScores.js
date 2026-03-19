import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import { computeMatchPercentage } from "../utils/matching.js";
import connectDB from "../config/db.js";

dotenv.config();
connectDB();

const verifyScores = async () => {
    try {
        console.log("🔍 Verifying Match Scores...");

        const alice = await Candidate.findOne({ "education.tenth.percentage": 95 }); // Alice Topper
        const seniorJob = await Job.findOne({ title: "Senior SDE II" });

        if (alice && seniorJob) {
            const score = computeMatchPercentage(alice, seniorJob);
            console.log(`\n👩‍💻 Alice (Top Candidate) vs Senior SDE II:`);
            console.log(`Expected: High Score (>80%)`);
            console.log(`Actual Score: ${score}%`);
            console.log(`Details: Skills: ${alice.skills}, Job Req: ${seniorJob.keywords}`);
        } else {
            console.log("⚠️ Alice or Senior SDE job not found.");
        }

        const bob = await Candidate.findOne({ "education.tenth.percentage": 75 }); // Bob Average
        const seniorJob2 = await Job.findOne({ title: "Senior SDE II" }); // Same job

        if (bob && seniorJob2) {
            const score = computeMatchPercentage(bob, seniorJob2);
            console.log(`\n👨‍💻 Bob (Average Candidate) vs Senior SDE II:`);
            console.log(`Expected: Low/Mid Score (<60%)`);
            console.log(`Actual Score: ${score}%`);
        }

        const charlie = await Candidate.findOne({ branch: "Mech" }); // Charlie Remote
        const startupJob = await Job.findOne({ title: "Frontend Developer Intern" });

        if (charlie && startupJob) {
            const score = computeMatchPercentage(charlie, startupJob);
            console.log(`\n👨‍🔧 Charlie (Wrong Branch/Loc) vs Frontend Developer Intern:`);
            console.log(`Expected: Low Score (Loc mismatch, etc)`);
            console.log(`Actual Score: ${score}%`);
            console.log(`Details: Cand Loc: ${charlie.location}, Job Loc: ${startupJob.location}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyScores();

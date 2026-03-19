import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Recruiter from "../models/Recruiter.js";
import Candidate from "../models/Candidate.js";
import connectDB from "../config/db.js";

dotenv.config();
connectDB();

const cleanup = async () => {
    try {
        console.log("🧹 Starting Cleanup...");

        // Delete Users with 'test' in email
        const deletedUsers = await User.deleteMany({ email: { $regex: /test/i } });
        console.log(`❌ Deleted ${deletedUsers.deletedCount} Test Users`);

        // Delete Jobs with 'Test' in title or description
        const deletedJobs = await Job.deleteMany({
            $or: [
                { title: { $regex: /test/i } },
                { description: { $regex: /test/i } }
            ]
        });
        console.log(`❌ Deleted ${deletedJobs.deletedCount} Test Jobs`);

        // Clean up orphaned profiles (optional but good)
        // For now, let's just target specific known test patterns if complex relations exist
        // Actually, deleting users usually leaves orphaned profile docs if not cascaded.
        // Let's delete profiles linked to deleted users? 
        // Easier: Delete candidates/recruiters with missing user IDs or test patterns in their own fields

        // We can just rely on the regex for emails covering most created users
        // If we want to be thorough:
        const remainingUsers = await User.find().select('_id');
        const userIds = remainingUsers.map(u => u._id);

        const deletedRecruiters = await Recruiter.deleteMany({ userId: { $nin: userIds } });
        console.log(`❌ Deleted ${deletedRecruiters.deletedCount} Orphaned Recruiters`);

        const deletedCandidates = await Candidate.deleteMany({ userId: { $nin: userIds } });
        console.log(`❌ Deleted ${deletedCandidates.deletedCount} Orphaned Candidates`);

        // Clean up Applications pointing to non-existent Jobs or Candidates
        // Note: This is an expensive operation without population or aggregation lookups if we don't have constraints
        // A simpler way for "test cleanup" is to just delete applications created by test users, but we deleted the users already.
        // So let's delete applications where candidateId or jobId is null (orphaned) - BUT Mongo doesn't set them to null automatically unless configured.
        // Better strategy for this script: Delete all applications for now if that's safe, OR rely on verify scripts to clean up their own mess.
        // Since this is a brutal cleanup:
        // We already deleted jobs with 'test'. Let's find jobs that exist.
        const remainingJobs = await Job.find().select('_id');
        const jobIds = remainingJobs.map(j => j._id);

        // Delete orphan applications
        const deletedApps = await import("../models/Application.js").then(m => m.default.deleteMany({ jobId: { $nin: jobIds } }));
        console.log(`❌ Deleted ${deletedApps.deletedCount} Orphaned Applications`);

        console.log("✨ Cleanup Complete!");
        process.exit();
    } catch (error) {
        console.error("Cleanup Failed:", error);
        process.exit(1);
    }
};

cleanup();

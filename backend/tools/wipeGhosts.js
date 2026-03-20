import mongoose from "mongoose";
import dotenv from "dotenv";
import Application from "../models/Application.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

dotenv.config();

const clean = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/resumeDB');
    console.log("Connected to MongoDB for cleaning...");

    const applications = await Application.find({});
    let deletedCount = 0;

    for (const app of applications) {
        let userExists = true;
        let jobExists = true;

        if (app.candidateId) {
            userExists = await User.exists({ _id: app.candidateId });
        } else { userExists = false; }

        if (app.jobId) {
            jobExists = await Job.exists({ _id: app.jobId });
        } else { jobExists = false; }

        if (!userExists || !jobExists) {
            await Application.deleteOne({ _id: app._id });
            deletedCount++;
        }
    }

    console.log(`✅ Successfully wiped ${deletedCount} ghost applications!`);
    mongoose.disconnect();
    process.exit(0);
};

clean();

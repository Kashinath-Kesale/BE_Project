import mongoose from "mongoose";
import dotenv from "dotenv";
import Application from "./models/Application.js";
import connectDB from "./config/db.js";

dotenv.config();

const migrate = async () => {
    try {
        await connectDB();
        const result = await Application.updateMany(
            { status: "hired" },
            { $set: { status: "shortlisted" } }
        );
        console.log(`Migration Complete: Updated ${result.modifiedCount} applications from hired to shortlisted.`);
        process.exit(0);
    } catch (e) {
        console.error("Migration Failed:", e);
        process.exit(1);
    }
};

migrate();

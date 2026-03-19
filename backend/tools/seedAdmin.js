import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";
import bcrypt from "bcryptjs";

dotenv.config();
connectDB();

const seedAdmin = async () => {
    try {
        const adminEmail = "admin@example.com";
        const adminPassword = "admin123";

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("Admin user already exists");
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const adminUser = await User.create({
            name: "Super Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            isVerified: true
        });

        console.log("Admin user created successfully");
        console.log("Email:", adminEmail);
        console.log("Password:", adminPassword);

        process.exit();
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();

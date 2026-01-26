import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const checkUsers = async () => {
    await connectDB();

    try {
        const users = await User.find({});
        console.log('\n--- ALL USERS ---');
        users.forEach(u => {
            console.log(`ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Role: "${u.role}" | Verified: ${u.isVerified}`);
        });
        console.log('-----------------\n');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

checkUsers();

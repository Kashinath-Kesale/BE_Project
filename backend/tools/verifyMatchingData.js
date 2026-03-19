import axios from "axios";
import mongoose from "mongoose";

const BASE_URL = "http://localhost:5000/api";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASS = "admin123";

const run = async () => {
    try {
        console.log("🚀 Starting Verification: Matching Data Enhancements");

        // 1. Admin Login (Reuse admin if exists)
        console.log("\n1. Logging in Admin...");
        const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASS,
            role: "admin"
        });
        const adminToken = adminRes.data.token;
        console.log("✅ Admin logged in.");

        // 2. Candidate Profile Test
        console.log("\n2. Testing Candidate Profile Update with New Fields...");
        // Register temp candidate
        const candEmail = `cand_test_${Date.now()}@test.com`;
        const candPass = "password123";
        await axios.post(`${BASE_URL}/auth/register`, {
            name: "Test Candidate",
            email: candEmail,
            password: candPass,
            role: "candidate"
        });

        const candLogin = await axios.post(`${BASE_URL}/auth/login`, { email: candEmail, password: candPass, role: "candidate" });
        const candToken = candLogin.data.token;

        // Update Profile
        const profileData = {
            phone: "9876543210",
            rollNo: "B123",
            branch: "IT",
            gender: "Male",
            skills: ["React", "Node.js"],
            education: {
                tenth: { percentage: 95, year: 2018 },
                twelfth: { percentage: 88, year: 2020 },
                btech: { percentage: 80, year: 2024, cgpa: "8.5" }
            },
            linkedinProfile: "https://linkedin.com/in/test"
        };

        const updateRes = await axios.post(`${BASE_URL}/candidate/profile`, profileData, {
            headers: { Authorization: `Bearer ${candToken}` }
        });

        // Verify Fields
        const p = updateRes.data.candidate;
        if (p.education.tenth.percentage === 95 && p.gender === "Male" && p.skills.includes("React")) {
            console.log("✅ Candidate profile updated correctly with new fields.");
        } else {
            console.error("❌ Candidate profile mismatch:", p);
            process.exit(1);
        }

        // 3. Job Creation Test (Criteria)
        console.log("\n3. Testing Job Creation with Criteria...");
        // Reuse approved recruiter flow or just assuming we have one?
        // Let's create a fresh approved recruiter to be safe
        const recEmail = `rec_test_${Date.now()}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, { name: "Test Recruiter", email: recEmail, password: "password123", role: "recruiter" });
        const recLogin = await axios.post(`${BASE_URL}/auth/login`, { email: recEmail, password: "password123", role: "recruiter" });
        const recToken = recLogin.data.token;

        // Create Profile
        await axios.post(`${BASE_URL}/recruiters/profile`, { companyName: "Tech Corp", location: "Pune" }, { headers: { Authorization: `Bearer ${recToken}` } });

        // Admin Approve
        // Find ID first... this is tricky without specific search endpoint, but let's use the pending list logic from before or just assume successful if we can create job (wait, we need approval first)
        const pendingRes = await axios.get(`${BASE_URL}/admin/recruiters/pending`, { headers: { Authorization: `Bearer ${adminToken}` } });
        const recMatch = pendingRes.data.find(r => r.companyName === "Tech Corp"); // flawed if concurrent tests, but okay for local
        if (recMatch) {
            await axios.post(`${BASE_URL}/admin/recruiters/${recMatch._id}/approve`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log("✅ Recruiter approved.");
        }

        // Create Job with Criteria
        const jobData = {
            title: "Software Engineer",
            description: "Dev role",
            location: "Pune",
            criteria: {
                minTenthPercent: 80,
                minTwelfthPercent: 75,
                minCgpa: 8.0,
                gender: "Any",
                eligibleBranches: ["IT", "CS"]
            }
        };

        const jobRes = await axios.post(`${BASE_URL}/jobs`, jobData, { headers: { Authorization: `Bearer ${recToken}` } });

        if (jobRes.data.criteria.minTenthPercent === 80 && jobRes.data.criteria.eligibleBranches.includes("IT")) {
            console.log("✅ Job created correctly with eligibility criteria.");
        } else {
            console.error("❌ Job criteria mismatch:", jobRes.data);
            process.exit(1);
        }

        console.log("\n🎉 ALL MATCHING DATA ENHANCEMENTS VERIFIED!");

    } catch (error) {
        console.error("Test Failed:", error.response?.data || error.message);
        process.exit(1);
    }
};

run();

import axios from "axios";
import mongoose from "mongoose";

const BASE_URL = "http://localhost:5000/api";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASS = "admin123";

// Generate random email
const randomEmail = () => `recruiter_${Date.now()}@test.com`;

const run = async () => {
    try {
        console.log("🚀 Starting Verification: Recruiter Approval Flow");

        // 1. Login Admin
        console.log("\n1. Logging in Admin...");
        const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASS,
            role: "admin"
        });
        const adminToken = adminRes.data.token;
        console.log("✅ Admin logged in.");

        // 2. Register New Recruiter
        console.log("\n2. Registering New Recruiter...");
        const newRecruiterEmail = randomEmail();
        const recruiterPass = "password123";
        await axios.post(`${BASE_URL}/auth/register`, {
            name: "Test Recruiter",
            email: newRecruiterEmail,
            password: recruiterPass,
            role: "recruiter"
        });
        console.log(`✅ Recruiter registered: ${newRecruiterEmail}`);

        // Login Recruiter
        const recruiterLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: newRecruiterEmail,
            password: recruiterPass,
            role: "recruiter"
        });
        const recruiterToken = recruiterLoginRes.data.token;
        const recruiterId = recruiterLoginRes.data._id; // User ID
        console.log("✅ Recruiter logged in.");

        // 2.5 Create Recruiter Profile (Required to exist in Admin list)
        console.log("\n2.5 Creating Recruiter Profile...");
        await axios.post(`${BASE_URL}/recruiters/profile`, {
            companyName: "Test Company",
            designation: "HR Manager",
            location: "Remote",
            companyWebsite: "https://example.com"
        }, {
            headers: { Authorization: `Bearer ${recruiterToken}` }
        });
        console.log("✅ Recruiter profile created. Status should be 'pending'.");

        // 3. Try to Post Job (Should Fail)
        console.log("\n3. Attempting to Post Job as Pending Recruiter...");
        try {
            await axios.post(`${BASE_URL}/jobs`, {
                title: "Test Job",
                description: "This should fail",
                companyName: "Test Corp",
                location: "Remote"
            }, {
                headers: { Authorization: `Bearer ${recruiterToken}` }
            });
            console.error("❌ Job posted unexpectedly! Restriction failed.");
            process.exit(1);
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log("✅ Job post blocked (403 Forbidden) as expected.");
            } else {
                console.error("❌ Unexpected error:", err.message);
                process.exit(1);
            }
        }

        // 4. Admin Approves Recruiter
        console.log("\n4. Admin Approving Recruiter...");

        // We need Recruiter ID, not User ID. 
        // Let's get pending list first to find the Recruiter ID
        const pendingRes = await axios.get(`${BASE_URL}/admin/recruiters/pending`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        // Find our recruiter in the list
        // Note: The list returns Recruiter objects, which have a 'userId' field or populated user info.
        // Assuming we can find it by some unique trait, or since it's the latest...
        // Let's filter by matching user ID if populated, or we rely on finding one created recently?
        // Actually the endpoint returns list of Recruiter docs. Recruiter doc has `userId`.
        const match = pendingRes.data.find(r => r.userId === recruiterId || r.userId._id === recruiterId);

        if (!match) {
            console.error("❌ Could not find new recruiter in pending list!");
            console.log("Pending List:", JSON.stringify(pendingRes.data, null, 2));
            process.exit(1);
        }
        const recruiterDocId = match._id;

        await axios.post(`${BASE_URL}/admin/recruiters/${recruiterDocId}/approve`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log("✅ Recruiter approved.");

        // 5. Try to Post Job Again (Should Succeed)
        console.log("\n5. Attempting to Post Job as Approved Recruiter...");
        try {
            const jobRes = await axios.post(`${BASE_URL}/jobs`, {
                title: "Test Job Success",
                description: "This should succeed",
                companyName: "Test Corp",
                location: "Remote"
            }, {
                headers: { Authorization: `Bearer ${recruiterToken}` }
            });
            console.log("✅ Job posted successfully:", jobRes.data.title);
        } catch (err) {
            console.error("❌ Job post failed:", err.response?.data || err.message);
            process.exit(1);
        }

        console.log("\n🎉 ALL TESTS PASSED!");

    } catch (error) {
        console.error("Test Failed:", error.response?.data || error.message);
        process.exit(1);
    }
};

run();

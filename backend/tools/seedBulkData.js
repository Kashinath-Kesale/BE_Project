import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Recruiter from "../models/Recruiter.js";
import Candidate from "../models/Candidate.js";
import connectDB from "../config/db.js";
import bcrypt from "bcryptjs";

dotenv.config();
connectDB();

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};``

const seedBulk = async () => {
    try {
        console.log("🌱 Starting Bulk Seeding with Realistic Indian Data...");

        // Define Seeded Emails for targeted cleanup
        const recruiterEmails = ["hr@techsolutions.in", "hr@finstream.in", "hr@cloudsystems.in"];
        const candidateEmails = ["aryan@test.com", "sneha@test.com", "rohan@test.com", "priya@test.com"];
        const allSeededEmails = [...recruiterEmails, ...candidateEmails];

        // 0. Clean (Wipe) ONLY Seeded Data
        console.log("🧹 Cleaning existing seeded data...");

        // Find users to get their IDs
        const seededUsers = await User.find({ email: { $in: allSeededEmails } });
        const seededUserIds = seededUsers.map(u => u._id);

        if (seededUserIds.length > 0) {
            const jobsToDelete = await Job.find({ createdBy: { $in: seededUserIds } });
            const jobIds = jobsToDelete.map(j => j._id);
            
            // Delete associated applications first to prevent orphaned records in Analytics
            await import("../models/Application.js").then(async ({ default: Application }) => {
                await Application.deleteMany({
                    $or: [{ candidateId: { $in: seededUserIds } }, { jobId: { $in: jobIds } }]
                });
            });

            await Job.deleteMany({ createdBy: { $in: seededUserIds } });
            await Candidate.deleteMany({ userId: { $in: seededUserIds } });
            await Recruiter.deleteMany({ userId: { $in: seededUserIds } });
            await User.deleteMany({ _id: { $in: seededUserIds } });
            console.log(`✅ Removed ${seededUserIds.length} existing seeded users and their data.`);
        } else {
            console.log("ℹ️ No existing seeded data found to clean.");
        }

        // 1. Create Recruiters (Indian Tech Companies)
        const recruiters = [
            { name: "Rahul Verma", email: recruiterEmails[0], company: "TechSolutions India", location: "Pune" },
            { name: "Neha Deshmukh", email: recruiterEmails[1], company: "FinStream Analytics", location: "Mumbai" },
            { name: "Vikram Singh", email: recruiterEmails[2], company: "CloudSystems Pvt Ltd", location: "Bangalore" }
        ];

        let createdRecruiters = [];

        for (const data of recruiters) {
            let user = await User.findOne({ email: data.email });
            if (!user) {
                const hashedPassword = await hashPassword("password123");
                user = await User.create({ name: data.name, email: data.email, password: hashedPassword, role: "recruiter", isVerified: true });
            }
            let rec = await Recruiter.findOne({ userId: user._id });
            if (!rec) {
                rec = await Recruiter.create({
                    userId: user._id,
                    companyName: data.company,
                    location: data.location,
                    status: "approved"
                });
            }
            createdRecruiters.push({ rec, user });
        }
        console.log(`✅ Created/Found ${createdRecruiters.length} Recruiters`);

        // 2. Create Jobs (Targeted for Specific Roles)
        const jobsData = [
            // Job 1: Full Stack SDE (Matches Aryan - MERN)
            {
                title: "Full Stack Developer (MERN)", recruiterIndex: 0,
                desc: `## Job Description
TechSolutions India is looking for a skilled Full Stack Developer to build scalable web applications. The ideal candidate should be proficient in the MERN stack.

## Key Responsibilities
- Develop user-facing features using React.js and Redux.
- Build robust backend APIs with Node.js, Express, and MongoDB.
- Ensure high performance and responsiveness of applications.
- Collaborate with cross-functional teams to design and ship new features.

## Requirements
- Strong proficiency in JavaScript (ES6+), React.js, and Node.js.
- Experience with RESTful APIs and MongoDB.
- Knowledge of state management (Redux/Context API).
- Familiarity with version control (Git).`,
                keywords: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "Redux"],
                location: "Pune",
                criteria: { minTenthPercent: 80, minTwelfthPercent: 80, minCgpa: 8.0, gender: "Any", eligibleBranches: ["CS", "IT"] }
            },

            // Job 2: Java Backend Developer (Matches Sneha - Java)
            {
                title: "Backend Developer (Java)", recruiterIndex: 2,
                desc: `## Role Overview
CloudSystems Pvt Ltd is hiring Backend Developers to work on enterprise-grade distributed systems. You will handle core logic and database interactions.

## Responsibilities
- Design and develop microservices using Java and Spring Boot.
- Optimize SQL queries and database schemas (MySQL/PostgreSQL).
- Implement secure authentication and authorization protocols.
- Debug and resolve production issues in a timely manner.

## Qualifications
- Strong grasp of Core Java, Multithreading, and OOP concepts.
- Hands-on experience with Spring Boot and Hibernate.
- Proficiency in SQL and RDBMS (MySQL).
- Knowledge of Microservices architecture is a plus.`,
                keywords: ["Java", "Spring Boot", "SQL", "MySQL", "Microservices", "Hibernate"],
                location: "Bangalore",
                criteria: { minTenthPercent: 70, minTwelfthPercent: 70, minCgpa: 7.5, gender: "Any", eligibleBranches: ["CS", "IT", "ENTC"] }
            },

            // Job 3: Data Scientist / ML Engineer (Matches Rohan - AI/ML)
            {
                title: "Data Scientist / AI Engineer", recruiterIndex: 1,
                desc: `## About the Role
FinStream Analytics is seeking a Data Scientist to build predictive models and analyze large financial datasets.

## Key Duties
- Develop and deploy Machine Learning models using Python.
- Analyze complex datasets to derive actionable insights.
- Work with libraries like TensorFlow, PyTorch, and Scikit-learn.
- Visualize data trends using Matplotlib or Tableau.

## Requirements
- Proficiency in Python and ML libraries (Pandas, NumPy, Scikit-learn).
- Experience with Deep Learning frameworks (TensorFlow/PyTorch).
- Strong mathematical foundations (Statistics, Probability, Algebra).
- Ability to communicate findings clearly.`,
                keywords: ["Python", "Machine Learning", "TensorFlow", "Data Science", "Pandas", "Scikit-learn"],
                location: "Mumbai",
                criteria: { minTenthPercent: 75, minTwelfthPercent: 75, minCgpa: 8.0, gender: "Any", eligibleBranches: ["CS", "IT", "A&R"] }
            },

            // Job 4: Business Analyst / Generalist (Matches Priya - Mixed)
            {
                title: "Business Analyst / Consultant", recruiterIndex: 1,
                desc: `## Job Summary
We are looking for a versatile Business Analyst who understands both technology and business processes.

## Responsibilities
- Bridge the gap between IT and business teams.
- Document requirements and create functional specifications.
- Perform basic data analysis using Excel and SQL.
- Create presentations and reports for stakeholders.

## Skills Needed
- Basic understanding of programming (Python/Java) is a plus.
- Advanced proficiency in Excel and SQL.
- Excellent communication and presentation skills.`,
                keywords: ["Excel", "SQL", "Communication", "Management", "Analysis"],
                location: "Mumbai",
                criteria: { minTenthPercent: 60, minTwelfthPercent: 60, minCgpa: 6.5, gender: "Any", eligibleBranches: ["CS", "IT", "ME", "ENTC"] }
            }
        ];

        for (const j of jobsData) {
            const recruiterObj = createdRecruiters[j.recruiterIndex];
            const existingJob = await Job.findOne({
                title: j.title,
                companyName: recruiterObj.rec.companyName
            });

            if (!existingJob) {
                await Job.create({
                    title: j.title,
                    description: j.desc,
                    companyName: recruiterObj.rec.companyName,
                    recruiterId: recruiterObj.rec._id,
                    keywords: j.keywords,
                    location: j.location,
                    criteria: j.criteria,
                    createdBy: recruiterObj.user._id,
                    minExperience: "0-2 Years"
                });
            }
        }
        console.log(`✅ Processed ${jobsData.length} Jobs`);

        // 3. Create Candidates (Specific Profiles)
        const candidatesData = [
            // 1. Aryan Sharma: The "Full Stack" Guy (Matches Job 1)
            {
                name: "Aryan Sharma", email: candidateEmails[0],
                skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "Redux", "Git"],
                keyword_str: "React, Node.js, Express, MongoDB, JavaScript, Redux, Web Development, API Design",
                marks: { tenth: 92, twelfth: 89, cgpa: 9.2, btechYear: 2025 },
                loc: "Pune", branch: "CS", gender: "Male",
                summary: "Passionate Full Stack Developer with 2 years of freelance experience. Built multiple MERN stack applications including E-commerce platforms and Chat apps. Strong problem solver with a knack for clean UI/UX."
            },

            // 2. Sneha Patil: The "Java Backend" Specialist (Matches Job 2)
            {
                name: "Sneha Patil", email: candidateEmails[1],
                skills: ["Java", "Spring Boot", "SQL", "MySQL", "Hibernate", "Microservices"],
                keyword_str: "Java, Spring Boot, Hibernate, SQL, Database Management, Backend Development",
                marks: { tenth: 85, twelfth: 82, cgpa: 8.5, btechYear: 2025 },
                loc: "Bangalore", branch: "IT", gender: "Female",
                summary: "Backend Developer specializing in Java and Spring Boot. Experience in designing RESTful APIs and managing relational databases. Focused on building secure and scalable backend systems."
            },

            // 3. Rohan Gupta: The "AI/ML" Enthusiast (Matches Job 3)
            {
                name: "Rohan Gupta", email: candidateEmails[2],
                skills: ["Python", "TensorFlow", "Machine Learning", "Deep Learning", "Pandas", "Computer Vision"],
                keyword_str: "Python, Machine Learning, Data Science, TensorFlow, Neural Networks, Computer Vision",
                marks: { tenth: 88, twelfth: 90, cgpa: 9.0, btechYear: 2025 },
                loc: "Mumbai", branch: "CS", gender: "Male",
                summary: "AI/ML Researcher and Data Science enthusiast. Completed internships in Predictive Analytics. Proficient in Python, TensorFlow, and building deep learning models for real-world problems."
            },

            // 4. Priya Singh: The "Generalist" (Matches Job 4, partial match others)
            {
                name: "Priya Singh", email: candidateEmails[3],
                skills: ["Python", "Java", "Excel", "SQL", "Public Speaking", "Management"],
                keyword_str: "Python, Java, Data Analysis, Excel, SQL, Project Management, Communication",
                marks: { tenth: 78, twelfth: 75, cgpa: 7.8, btechYear: 2025 },
                loc: "Mumbai", branch: "ENTC", gender: "Female",
                summary: "Versatile engineering graduate with a diverse skillset in coding and management. Strong analytical skills utilizing Excel and SQL. Excellent communicator looking for roles in Analysis or Consultancy."
            }
        ];

        for (const c of candidatesData) {
            let user = await User.findOne({ email: c.email });
            if (!user) {
                const hashedPassword = await hashPassword("password123");
                user = await User.create({ name: c.name, email: c.email, password: hashedPassword, role: "candidate", isVerified: true });
            }

            const existingCand = await Candidate.findOne({ userId: user._id });
            if (!existingCand) {
                // Generate a rich parsed resume text for the AI matcher
                const richParsedText = `
                    ${c.name}
                    ${c.email} | +91-9876543210 | ${c.loc}, India
                    
                    PROFILE SUMMARY
                    ${c.summary}
                    
                    TECHNICAL SKILLS
                    ${c.keyword_str}
                    
                    EDUCATION
                    B.Tech in ${c.branch}, 2021-2025, CGPA: ${c.marks.cgpa}
                    Higher Secondary (12th), ${c.marks.twelfth}%
                    
                    PROJECTS
                    1. Portfolio Website: Built using ${c.skills[0]} and ${c.skills[1]}.
                    2. Data Analysis Tool: Analyzed datasets using ${c.skills[2] || "Python"}.
                `;

                await Candidate.create({
                    userId: user._id,
                    phone: "+91-9876543210",
                    rollNo: "UNIV" + Math.floor(Math.random() * 10000),
                    branch: c.branch,
                    location: c.loc,
                    education: {
                        tenth: { percentage: c.marks.tenth, year: 2019 },
                        twelfth: { percentage: c.marks.twelfth, year: 2021 },
                        btech: { percentage: 0, year: c.marks.btechYear, cgpa: c.marks.cgpa.toString() }
                    },
                    parsedText: richParsedText,
                    skills: c.skills,
                    keywords: c.skills,
                    gender: c.gender
                });
            }
        }
        console.log(`✅ Created/Found ${candidatesData.length} Candidates`);

        console.log("\n🎉 Bulk Seeding With Realistic Data Complete!");

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedBulk();

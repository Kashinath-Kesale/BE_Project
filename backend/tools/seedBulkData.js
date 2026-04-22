import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Recruiter from "../models/Recruiter.js";
import Candidate from "../models/Candidate.js";
import Application from "../models/Application.js";
import connectDB from "../config/db.js";
import bcrypt from "bcryptjs";

dotenv.config();
connectDB();

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const seedBulk = async () => {
    try {
        console.log("🌱 Starting Massive Conference Data Seed...");

        console.log("🧹 Cleaning existing demo data...");
        const seededUsers = await User.find({ email: { $regex: /\.demo\.com$/i } });
        const seededUserIds = seededUsers.map(u => u._id);

        if (seededUserIds.length > 0) {
            const jobsToDelete = await Job.find({ createdBy: { $in: seededUserIds } });
            const jobIds = jobsToDelete.map(j => j._id);
            
            await Application.deleteMany({
                $or: [{ candidateId: { $in: seededUserIds } }, { jobId: { $in: jobIds } }]
            });

            await Job.deleteMany({ createdBy: { $in: seededUserIds } });
            await Candidate.deleteMany({ userId: { $in: seededUserIds } });
            await Recruiter.deleteMany({ userId: { $in: seededUserIds } });
            await User.deleteMany({ _id: { $in: seededUserIds } });
            console.log(`✅ Removed ${seededUserIds.length} existing demo users and their data.`);
        }

        const recruitersData = [
            { name: "Rahul Verma", email: "rahul@techstart.demo.com", company: "TechStart", location: "Pune" },
            { name: "Neha Deshmukh", email: "neha@finanalytics.demo.com", company: "FinAnalytics", location: "Bangalore" },
            { name: "Vikram Singh", email: "vikram@cloudsys.demo.com", company: "CloudSys", location: "Mumbai" },
            { name: "Aditi Sharma", email: "aditi@logicworks.demo.com", company: "LogicWorks", location: "Pune" },
            { name: "Siddharth Rao", email: "siddharth@nexacore.demo.com", company: "NexaCore Analytics", location: "Chennai" },
            { name: "Pooja Patil", email: "pooja@cyberguard.demo.com", company: "CyberGuard Solutions", location: "Bangalore" },
            { name: "Arvind Gupta", email: "arvind@dataflow.demo.com", company: "DataFlow Systems", location: "Mumbai" },
            { name: "Meera Nair", email: "meera@applabs.demo.com", company: "AppLabs", location: "Noida" },
            { name: "Karan Johar", email: "karan@blockforge.demo.com", company: "BlockForge", location: "Pune" },
            { name: "Snehal Kadam", email: "snehal@cartnova.demo.com", company: "CartNova", location: "Bangalore" },
            { name: "Amitabh Raj", email: "amitabh@robotech.demo.com", company: "RoboTech Dynamics", location: "Pune" },
            { name: "Kavita Reddy", email: "kavita@siliconchips.demo.com", company: "SiliconChips Pvt Ltd", location: "Bangalore" },
        ];

        let createdRecruiters = [];
        const defaultPassword = await hashPassword("password123");

        for (const data of recruitersData) {
            let user = await User.create({ name: data.name, email: data.email, password: defaultPassword, role: "recruiter", isVerified: true });
            let rec = await Recruiter.create({
                userId: user._id, companyName: data.company, location: data.location, status: "approved"
            });
            createdRecruiters.push({ rec, user });
        }

        // Job Descriptions Helper
        const buildJD = (title, tech) => `## Overview
We are looking for a dedicated ${title} to join our team.

## Responsibilities
- Architect, build, and maintain scalable applications.
- Collaborate with engineering and product teams to define technical solutions.
- Enhance efficiency, performance, and reliability.

## Qualifications
- Bachelor's degree in Engineering or Computer Science.
- Mandatory hands-on expertise in the following: ${tech}.
- Willingness to operate in an agile environment and ship clean code.`;

        const jobsList = [
            { title: "React Frontend Engineer", rIdx: 0, keywords: ["React", "JavaScript", "Redux", "Tailwind", "CSS", "Frontend"], loc: "Pune", criteria: { minCgpa: 7.0, eligibleBranches: ["CS", "IT"] } },
            { title: "Node.js Backend Developer", rIdx: 1, keywords: ["Node.js", "Express", "MongoDB", "Backend", "API", "Microservices"], loc: "Bangalore", criteria: { minCgpa: 6.5, eligibleBranches: ["CS", "IT"] } },
            { title: "Full Stack SDE (MERN)", rIdx: 2, keywords: ["React", "Node.js", "MongoDB", "Express", "Full Stack", "JavaScript"], loc: "Mumbai", criteria: { minCgpa: 7.5, eligibleBranches: ["CS", "IT"] } },
            { title: "Python Data Scientist", rIdx: 3, keywords: ["Python", "Pandas", "Machine Learning", "Data Science", "Scikit", "NumPy"], loc: "Pune", criteria: { minCgpa: 8.0, eligibleBranches: ["CS", "IT"] } },
            { title: "AI/ML Engineer", rIdx: 4, keywords: ["Python", "TensorFlow", "Deep Learning", "AI", "NLP", "PyTorch"], loc: "Chennai", criteria: { minCgpa: 8.5, eligibleBranches: ["CS", "IT"] } },
            { title: "Java Spring Boot Developer", rIdx: 5, keywords: ["Java", "Spring Boot", "SQL", "Hibernate", "Microservices"], loc: "Bangalore", criteria: { minCgpa: 7.0, eligibleBranches: ["CS", "IT", "ECE"] } },
            { title: "Cloud Devops Engineer", rIdx: 6, keywords: ["AWS", "Docker", "Kubernetes", "DevOps", "CI/CD", "Linux"], loc: "Mumbai", criteria: { minCgpa: 6.0, eligibleBranches: ["CS", "IT"] } },
            { title: "Cybersecurity Analyst", rIdx: 7, keywords: ["Security", "Networking", "Penetration Testing", "Linux", "Ethical Hacking"], loc: "Noida", criteria: { minCgpa: 6.5, eligibleBranches: ["CS", "IT"] } },
            { title: "Android App Developer", rIdx: 8, keywords: ["Android", "Kotlin", "Mobile App", "Java", "Firebase"], loc: "Pune", criteria: { minCgpa: 7.0, eligibleBranches: ["CS", "IT"] } },
            { title: "Blockchain Developer", rIdx: 9, keywords: ["Blockchain", "Solidity", "Web3", "Ethereum", "Crypto"], loc: "Bangalore", criteria: { minCgpa: 8.0, eligibleBranches: ["CS", "IT"] } },
            { title: "QA Automation Engineer", rIdx: 0, keywords: ["Testing", "Selenium", "Cypress", "QA", "Java", "Python"], loc: "Pune", criteria: { minCgpa: 6.5, eligibleBranches: ["CS", "IT"] } },
            { title: "Go-lang Backend Developer", rIdx: 1, keywords: ["Golang", "Backend", "Microservices", "Docker"], loc: "Bangalore", criteria: { minCgpa: 7.5, eligibleBranches: ["CS", "IT"] } },
            { title: "Database Administrator (DBA)", rIdx: 2, keywords: ["SQL", "MySQL", "PostgreSQL", "Database", "Performance"], loc: "Mumbai", criteria: { minCgpa: 6.0, eligibleBranches: ["CS", "IT"] } },
            { title: "Frontend Vue.js Developer", rIdx: 3, keywords: ["Vue.js", "JavaScript", "Frontend", "CSS"], loc: "Pune", criteria: { minCgpa: 6.5, eligibleBranches: ["CS", "IT"] } },
            { title: "Software Engineer - C++", rIdx: 4, keywords: ["C++", "Algorithms", "Data Structures", "Linux"], loc: "Chennai", criteria: { minCgpa: 8.0, eligibleBranches: ["CS", "IT", "ECE"] } },
            { title: "Business Analyst (IT)", rIdx: 5, keywords: ["SQL", "Agile", "Excel", "Communication", "Management"], loc: "Bangalore", criteria: { minCgpa: 6.0, eligibleBranches: ["CS", "IT", "ECE", "MECH"] } },
            { title: "Embedded Systems Engineer", rIdx: 11, keywords: ["C", "Microcontrollers", "Embedded", "IoT", "ARM"], loc: "Bangalore", criteria: { minCgpa: 7.0, eligibleBranches: ["ECE", "EE", "Robotics"] } },
            { title: "VLSI Design Engineer", rIdx: 11, keywords: ["VLSI", "Verilog", "VHDL", "FPGA", "Hardware"], loc: "Bangalore", criteria: { minCgpa: 8.0, eligibleBranches: ["ECE"] } },
            { title: "Robotics Control Engineer", rIdx: 10, keywords: ["ROS", "Robotics", "C++", "Control Systems", "Automation", "Python"], loc: "Pune", criteria: { minCgpa: 7.5, eligibleBranches: ["Robotics", "MECH", "ECE"] } },
            { title: "Mechatronics Systems Lead", rIdx: 10, keywords: ["Mechatronics", "PLC", "AutoCAD", "Sensors", "Arduino"], loc: "Pune", criteria: { minCgpa: 7.0, eligibleBranches: ["Robotics", "MECH"] } }
        ];

        let createdJobs = [];
        for (const j of jobsList) {
            const rObj = createdRecruiters[j.rIdx];
            const job = await Job.create({
                title: j.title,
                description: buildJD(j.title, j.keywords.join(", ")),
                companyName: rObj.rec.companyName,
                recruiterId: rObj.rec._id,
                keywords: j.keywords,
                location: j.loc,
                criteria: { minTenthPercent: 50, minTwelfthPercent: 50, minCgpa: j.criteria.minCgpa, gender: "Any", eligibleBranches: j.criteria.eligibleBranches },
                createdBy: rObj.user._id,
                minExperience: "Fresher"
            });
            createdJobs.push(job);
        }

        const students = [
            { name: "Aarav Patel", branch: "CS", skills: ["React", "JavaScript", "HTML", "CSS", "Tailwind"], type: "Frontend" },
            { name: "Vihaan Sharma", branch: "IT", skills: ["Node.js", "Express", "MongoDB", "REST API"], type: "Backend" },
            { name: "Arjun Kesale", branch: "CS", skills: ["React", "Node.js", "MongoDB", "Express", "Full Stack"], type: "MERN" },
            { name: "Sai Krishna", branch: "CS", skills: ["Python", "Pandas", "Scikit", "SQL"], type: "Data" },
            { name: "Aditya Singh", branch: "IT", skills: ["Python", "TensorFlow", "Deep Learning", "NLP"], type: "AI" },
            { name: "Kabir Das", branch: "CS", skills: ["Java", "Spring Boot", "SQL", "Hibernate"], type: "Java" },
            { name: "Ishaan Iyer", branch: "CS", skills: ["AWS", "Docker", "Linux", "Kubernetes", "DevOps"], type: "Cloud" },
            { name: "Vivaan Joshi", branch: "IT", skills: ["Python", "Linux", "Networking", "Security", "Ethical Hacking"], type: "Sec" },
            { name: "Ananya Desai", branch: "CS", skills: ["Kotlin", "Android", "Java", "Firebase"], type: "App" },
            { name: "Diya Reddy", branch: "IT", skills: ["Solidity", "Blockchain", "Ethereum", "Crypto"], type: "Blockchain" },
            { name: "Riya Mehta", branch: "CS", skills: ["Selenium", "Testing", "Java", "Cypress"], type: "QA" },
            { name: "Isha Gupta", branch: "IT", skills: ["Golang", "Backend", "Docker", "REST API"], type: "Go" },
            { name: "Prisha Nair", branch: "CS", skills: ["SQL", "MySQL", "PostgreSQL", "Database"], type: "DBA" },
            { name: "Avni Bhat", branch: "IT", skills: ["Vue.js", "JavaScript", "CSS", "Frontend"], type: "Vue" },
            { name: "Kavya Menon", branch: "CS", skills: ["C++", "Data Structures", "Algorithms", "Linux"], type: "CPP" },
            { name: "Meher Kaur", branch: "IT", skills: ["Excel", "Communication", "Agile", "SQL"], type: "BA" },
            { name: "Rahul Tendulkar", branch: "CS", skills: ["React", "Next.js", "JavaScript", "Redux"], type: "Frontend" },
            { name: "Sneha Rao", branch: "IT", skills: ["Java", "Microservices", "Spring Boot", "SQL"], type: "Java" },
            { name: "Amit Kumar", branch: "CS", skills: ["Python", "Machine Learning", "Data Analysis", "Scikit"], type: "Data" },
            { name: "Kunal Sen", branch: "IT", skills: ["React", "Firebase", "CSS", "Frontend"], type: "Frontend" },
            { name: "Shruti Das", branch: "CS", skills: ["Node.js", "API", "Docker", "AWS", "Backend"], type: "Backend" },
            { name: "Tanya Kapoor", branch: "CS", skills: ["Java", "C++", "SQL", "HTML"], type: "General" },
            { name: "Raju Prasad", branch: "ECE", skills: ["C", "Microcontrollers", "Embedded", "IoT", "ARM"], type: "Embedded" },
            { name: "Simran Chatterjee", branch: "ECE", skills: ["Verilog", "VHDL", "VLSI", "Hardware"], type: "VLSI" },
            { name: "Vivek Roy", branch: "Robotics", skills: ["ROS", "C++", "Automation", "Robotics"], type: "Robotics" }
        ];

        let createdCandidates = [];
        for (let i = 0; i < students.length; i++) {
            const s = students[i];
            const firstName = s.name.split(" ")[0].toLowerCase();
            const email = `${firstName}${i+1}@student.demo.com`;
            let user = await User.create({ name: s.name, email: email, password: defaultPassword, role: "candidate", isVerified: true });
            
            const summaryStr = s.skills.join(", ");
            // Enhanced parsed text for AI Model TF-IDF accuracy
            const richParsedText = `
${s.name}
${email} | +91-9${Math.floor(Math.random()*1000000000)} | Pune, India

PROFESSIONAL SUMMARY
Highly motivated engineer with a strong foundation in ${s.type} technologies. Quick learner with excellent problem-solving skills and a passion for engineering. Capable of communicating complex ideas effectively and working cross-functionally. 

TECHNICAL EXPERTISE
Core Skills: ${summaryStr}
Additional: Git, GitHub, VS Code, Agile Methodologies, Problem Solving, Communication.

ACADEMIC HISTORY
B.Tech in ${s.branch} Engineering, State University (Graduating 2025)
Cumulative Grade Point Average: ${7 + Math.random() * 2}/10.0

KEY PROJECTS
1. Capstone Project: Architected and deployed an end-to-end solution utilizing ${s.skills[0]} and ${s.skills[1] || 'industry-standard tools'}. 
2. Real-time Analysis Module: Built a high-performance system minimizing latency by 30% using ${s.skills[2] || 'optimized algorithms'}.
            `;

            let cand = await Candidate.create({
                userId: user._id,
                phone: `+91-9${Math.floor(Math.random()*1000000000)}`,
                rollNo: "UNI" + (1000 + i),
                branch: s.branch,
                location: ["Pune", "Mumbai", "Bangalore"][i % 3],
                education: {
                    tenth: { percentage: 80, year: 2019 },
                    twelfth: { percentage: 80, year: 2021 },
                    btech: { percentage: 0, year: 2025, cgpa: (7.5 + Math.random() * 2).toFixed(1) }
                },
                parsedText: richParsedText,
                skills: s.skills,
                keywords: s.skills,
                gender: i%2===0 ? "Male" : "Female"
            });
            createdCandidates.push({ cand, user });
        }

        console.log("🚀 Simulating Candidates applying to Jobs...");
        let totalApps = 0;
        
        for (const c of createdCandidates) {         
            const shuffledJobs = [...createdJobs].sort(() => 0.5 - Math.random());
            const appliedJobs = shuffledJobs.slice(0, 4);

            for(const job of appliedJobs) {
                 const rand = Math.random();
                 let appStatus = "applied";
                 if(rand > 0.8) appStatus = "shortlisted";
                 else if (rand < 0.2) appStatus = "rejected"; // Added "rejected" status so charts look varied

                 await Application.create({
                     jobId: job._id,
                     candidateId: c.user._id,
                     status: appStatus
                 });
                 totalApps++;
            }
        }
        console.log(`✅ Automatically generated ${totalApps} Applications with simulated AI Matches!`);

        console.log("\n🔑 TEST CREDENTIALS - All passwords are 'password123'");
        console.log("\nRecruiters:");
        recruitersData.forEach(r => console.log(`- ${r.company}: ${r.email}`));
        console.log("\nCandidates:");
        students.slice(0, 5).forEach((s, i) => {
            const firstName = s.name.split(" ")[0].toLowerCase();
            console.log(`- ${s.name} (${s.type}): ${firstName}${i+1}@student.demo.com`);
        });
        console.log(`... and ${students.length - 5} more students.`);

        console.log("\n🎉 Conference Bulk Seeding Complete!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedBulk();

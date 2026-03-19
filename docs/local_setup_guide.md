# Local Setup Guide for Developers 🚀

Welcome to the project! This guide will walk you through setting up the entire platform on your local machine from scratch.

Our platform consists of **three** interconnected services:
1. **Frontend**: React + Vite UI
2. **Backend**: Node.js + Express + MongoDB Server
3. **AI Service**: Python + Flask NLP Engine

---

## 🛠️ Step 1: Install Prerequisites

Before you start, make sure you have the following installed on your laptop:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://www.python.org/downloads/) (v3.9 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally via MongoDB Compass or Service)
- [Git](https://git-scm.com/)

---

## 📥 Step 1.5: Clone the Repository

To download the code to your machine, open your terminal and run:

```bash
git clone https://github.com/Kashinath-Kesale/BE_Project.git
cd BE_Project
```

---

## 🌱 Step 2: Backend Setup (Database + API)

Open a terminal and navigate to the project root folder.

**1. Go to the backend directory and install packages:**
```bash
cd backend
npm install
```

**2. Setup your Environment Variables:**
Create a file named `.env` inside the `backend/` folder and paste the following:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/resumeDB
JWT_SECRET=supersecretkey
RESEND_API_KEY=your_key_here
MAIL_FROM=ResumeLab <onboarding@resend.dev>
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
SKIP_EMAIL=true
```

**3. Seed the Database with Dummy Data:**
This connects to your MongoDB and populates it with example candidates, recruiters, and jobs so you don't have an empty app!
```bash
node tools/seedBulkData.js
```

**4. Start the Backend Server:**
```bash
npm run dev
```
*(The backend runs on `http://localhost:5000`)*

---

## 🧠 Step 3: Python AI Matcher Setup

Open a **second separate terminal window** in your project root.

**1. Go to the AI directory:**
```bash
cd ai
```

**2. Create and activate a Virtual Environment (Recommended):**
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

**3. Install Python Dependencies:**
```bash
pip install -r requirements.txt
```

**4. Download the NLP English Model:**
(Crucial step: This downloads the spaCy language model used for skill extraction)
```bash
python -m spacy download en_core_web_sm
```

**5. Start the AI Server:**
```bash
python app.py
```
*(The AI Service runs on `http://localhost:8000`)*

---

## 💻 Step 4: Frontend Setup (React UI)

Open a **third separate terminal window** in your project root.

**1. Go to the frontend directory and install packages:**
```bash
cd frontend
npm install
```

**2. Setup your Environment Variables:**
Create a file named `.env` inside the `frontend/` folder and paste the following:
```env
VITE_BACKEND_URL=http://localhost:5000
```

**3. Start the React App:**
```bash
npm run dev
```

---

## 🎉 You're Done!

You can now open your browser and go to:
👉 **[http://localhost:5173](http://localhost:5173)**

Everything is completely set up. When you upload a resume, the Node instance will automatically route the PDF to the Python AI engine on port `8000` to be mapped against the jobs you seeded!

**Quick Troubleshooting:**
- **"Failed to load jobs"**: Check if your MongoDB is actively running in the background.
- **"AI Match Service failed"**: Ensure you have terminal #2 running `python app.py`.
- **"ModuleNotFoundError: No module named spacy"**: Re-run the `venv\Scripts\activate` command in your AI terminal before starting the Python script.

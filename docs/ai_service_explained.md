# AI Module & NLP Logic: Team Documentation

**Hey Team!** 👋

This document breaks down how our project's "Brain" (the AI Service) works. Since we are presenting this as our final year project, it's important we all understand the flow so we can answer questions from the external examiner confidently.

---

## 1. High-Level Overview
Think of our AI service as a **"Smart Assistant"** for the Recruiter.
Instead of a recruiter reading 100 resumes manually, our Python code:
1.  **READS** the resume (Parsing).
2.  **UNDERSTANDS** the skills (NLP).
3.  **SCORES** the candidate against the Job Description (Matching).

It runs on a separate server (Python/Flask) because Python has the best AI libraries.

---

## 2. File Structure Explained

Here's what each file in the `ai/` folder actually does:

### The "Core" Logic (What runs in production)
*   **`app.py`**: This is our **API Server**. It waits for requests from our Node.js backend.
    *   *Analogy*: The Receptionist.
    *   *Job*: "Hey, I got a request to parse this file. `parser`, you take it. `matcher`, you grade it."
*   **`resume_parser.py`**: This is the **Reader**.
    *   *Tech*: Uses **spaCy** (NLP library).
    *   *Job*: It scans the resume text to find Names, Emails, and most importantly, **Skills** (using our `data/skills.json` database).
*   **`matcher.py`**: This is the **Grader**.
    *   *Tech*: Uses **scikit-learn** (Math/Vectors).
    *   *Job*: It compares the Resume vs. Job Description and gives a score (0-100%).

### The "Testing" Files (Development & Debugging)
You might see files like `test_parser.py`, `test_matcher.py`, or `test_env.py`.
*   **What are they?**: These are widely used in industry to "Unit Test" our code.
*   **Why do we have them?**: Before connecting the AI to the smooth Frontend, we used these to test if the logic was working in isolation.
    *   `test_parser.py`: Checks if we can extract "React" from a sample text.
    *   `test_matcher.py`: Checks if the math formula gives a high score for a good match.
    *   *Note*: These are **NOT** used when the actual app runs. They are just for us developers to verify our code.

---

## 3. How the "Magic" Happens (The Workflow)

### Phase 1: Parsing (Reading the File)
1.  User uploads a PDF.
2.  We extract the raw text (using `pdfminer`).
3.  We feed this text into our **NLP Pipeline** (`resume_parser.py`).
4.  It labels words like "Aryan" as a `PERSON` and "Pune" as a `GPE` (Location).
5.  It aggressively looks for **Skills** from our list. If it sees "Java", it grabs it.

### Phase 2: Matching (The Scoring)
This is our project's **"Secret Sauce"**. We optimized it for Freshers.

We use a **80/20 Rule**:
1.  **80% Weight: Keyword Matching (The Checklist)**
    *   *Why?* For college placements, if a company wants "React" and you know "React", you are a good fit.
    *   *Logic*: `Matched Skills / Required Skills`.
    *   *Example*: Job needs [React, Node]. Candidate has [React]. Score = 50%.
2.  **20% Weight: Semantic Matching (The Context)**
    *   *Why?* To see if the *context* suggests you are a developer, even if you missed a keyword.
    *   *Logic*: Uses **TF-IDF Vectors** (Converting text to numbers) to measure similarity.

**Our Formula:**
```python
Final Score = (Keyword_Matches * 0.8) + (Semantic_Context * 0.2)
```

---

## 4. Why our Scores look "Human"
You might notice our scores are usually high (like 85-95%) for good matches.
This is intentional.
*   Raw computer matching is often harsh (e.g., getting a 40% typically means a great match in vector math).
*   We added a small **"Normalization Curve" (1.2x)** in the Backend.
*   This translates the "Computer Score" into a "Human Score" (A+ Grade).

---

## Summary for the Examiner
If asked: **"How does your AI work?"**
> "We use a hybrid approach. We use **spaCy** for Named Entity Recognition to extract skills, and **TF-IDF Vectorization** to understand context. We heavily weight (80%) exact skill matches to suit the recruitment needs of freshers."

Let me know if you need any part explained further!

# AI Module & NLP Logic: The Complete Guide

**Hey Team!** 👋

This is the **"One Stop Shop"** guide to our project's AI. It explains *everything*—from the high-level flow to the deep internal logic of spaCy and Vectors. Read this, and you will be able to answer any question the external examiner throws at you.

---

## 1. The "Big Picture" Workflow
Imagine a candidate named **Sneha** applies for a **Full Stack Developer** role. Here is exactly what happens, step-by-step:

1.  **Upload**: Sneha uploads `resume.pdf`.
2.  **Extraction**: The system reads the PDF and converts it to raw text string:
    > "Sneha Patil. Java Developer. Expertise in Spring Boot and SQL..."
3.  **Parsing (The Reader)**: Our AI reads this text and extracts:
    *   **Name**: Sneha Patil
    *   **Skills**: [Java, Spring Boot, SQL]
4.  **Matching (The Grader)**:
    *   **Job Needs**: [React, Node.js, MongoDB]
    *   **Sneha Has**: [Java, Spring Boot, SQL]
    *   **Result**: 0% Keyword Match (She is a backend dev, job is frontend).
5.  **Scoring**: The logic calculates a final score (e.g., 30% largely due to academic marks) and shows it to the recruiter.

---

## 2. Deep Dive: Parsing (How `resume_parser.py` works)
We use a library called **spaCy**. Think of it as a pre-trained "English Teacher" inside our code.

### The Problem with Standard NLP
A standard NLP model knows that "Google" is a Company and "Mumbai" is a Location.
**BUT**, it does *not* know that "React.js" is a Technical Skill. It just thinks it's a noun.

### Our Solution: The `EntityRuler`
We customized spaCy by adding a "Rule Book" (`data/skills.json`).
*   **Internal Logic**:
    1.  We load the standard English model (`en_core_web_sm`).
    2.  We insert a special pipe called `entity_ruler` **before** the standard Name Recognizer (`ner`).
    3.  We feed it our list: `["React", "Java", "Python", ...]`.
    4.  Now, when spaCy reads the text, if it sees "React", it immediately screams **"SKILL!"** and tags it.

**Code Visualized:**
```python
# Standard spaCy: "I know React." -> "React" is just a word.
# Our spaCy:      "I know React." -> "React" is a SKILL (Entity).
```

---

## 3. Deep Dive: Matching (How `matcher.py` works)
This is where the math happens. We use two strategies:

### A. Keyword Matching (The Checklist) - 80% Weight
This is simple Set Theory.
*   **Formula**: `(Skills Found) / (Skills Required)`
*   **Why 80%?**: For freshers, specific tools matter most. If a job needs Java and you don't know Java, you can't do the job.
*   **Example**:
    *   Job: `[Java, SQL]`
    *   Resume: `[Java, Python]`
    *   Match: 1/2 = **50%**

### B. Semantic Matching (Vectors) - 20% Weight
This uses **TF-IDF** (Term Frequency - Inverse Document Frequency).
*   **The Concept**: Imagine every word is a coordinate on a graph.
    *   "Developer" is at coordinates (10, 5).
    *   "Coder" is at coordinates (10, 6).
    *   "Chef" is at coordinates (0, 0).
*   **The Math**:
    1.  We turn the **Resume Text** into a Vector (Line A).
    2.  We turn the **Job Description** into a Vector (Line B).
    3.  We calculate the **Cosine Similarity** (The angle between the lines).
    *   If the angle is 0° (Lines point same way), it's a 100% match.
    *   If the angle is 90° (Lines are unrelated), it's a 0% match.
*   **Why use this?**: It catches context. If you wrote "Experience in building servers" but didn't write the exact word "Backend", Vectors will still know you are a match.

---

## 4. The Exact Logic Flow (Trace)

Let's trace **Aryan Sharma** (The Perfect Match) vs. **Sneha** (The Mismatch).

### Scenario A: Aryan (Full Stack Dev) applies for MERN Stack Job
*   **Job Keywords**: `[React, Node.js, Redux]`
*   **Aryan's Skills**: `[React, Node.js, Redux, MongoDB]`
*   **Step 1 (Keywords)**: 3/3 matches = **100%**.
*   **Step 2 (Semantic)**: His summary says "MERN Stack Developer". Job says "MERN Stack". Vector Match = **90%**.
*   **Final AI Score**: `(100 * 0.8) + (90 * 0.2)` = **98%**.
*   **Backend Polish**: `98 * 1.2` = **Cap at 100%**.
*   **Display**: **98% Match** (User sees Green Badge).

### Scenario B: Sneha (Java Dev) applies for MERN Stack Job
*   **Job Keywords**: `[React, Node.js, Redux]`
*   **Sneha's Skills**: `[Java, Spring Boot, SQL]`
*   **Step 1 (Keywords)**: 0/3 matches = **0%**.
*   **Step 2 (Semantic)**: She talks about "Backend" (which is partly relevant), so maybe **20%**.
*   **Final AI Score**: `(0 * 0.8) + (20 * 0.2)` = **4%**.
*   **Backend Polish**: The backend adds her **Academic Score (30%)**.
*   **Display**: **~30% Match** (User sees Red Badge).

**This proves the system works.** It correctly identifies that Sneha is smart (Academic Score) but *not fit for this specific job* (AI Score).

---

## 5. Summary for the Examiner
**Q: "What technology stack are you using for AI?"**
> "We use **Python (Flask)**. For parsing, we use **spaCy** with a custom **EntityRuler** pipeline to identify technical skills. For matching, we use **scikit-learn** to calculate **TF-IDF Vectors** and Cosine Similarity."

**Q: "Why did you choose this logic?"**
> "We analyzed that for freshers, exact skill matches are more critical than general experience. That's why we weighted Keyword Matching at 80% and Semantic Context at 20%."

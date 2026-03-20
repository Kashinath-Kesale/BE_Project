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

### B. Semantic Matching (Vectors using TF-IDF & Cosine Similarity) - 20% Weight
This is where we use `scikit-learn` to calculate **TF-IDF Vectors** and **Cosine Similarity**. 

As a Software Engineer, here is the easiest way to explain this in an interview without needing an ML background:

**1. What is TF-IDF? (Term Frequency - Inverse Document Frequency)**
TF-IDF calculates a mathematical "weight" (a decimal score) for each word. The arrays created do NOT store actual strings (words). Instead, they store these decimal weights.

Here is exactly how the decimal arrays are built and populated:
*   **Step 1 (The Vocabulary Index)**: The system scans both the Resume and the Job Description to create a master list of all unique words (ignoring basic words like "the" or "and"). 
    *   *Example Vocabulary:* `[index 0: "java", index 1: "react", index 2: "spring", index 3: "backend"]`
*   **Step 2 (Term Frequency - TF)**: This evaluates *one specific document* (like just the resume). If the word "java" appears 3 times in a 100-word resume, its TF score is `3/100 = 0.03`. It simply measures how often a word is used locally.
*   **Step 3 (Inverse Document Frequency - IDF)**: This evaluates *all documents combined*. If a word like "developer" appears in *every* resume, it is not a special differentiator, so its IDF score drops to near `0`. If "spring" only appears in *this specific* resume, its IDF score shoots up. It measures how "rare and valuable" the word is globally.
*   **Step 4 (The Final Decimal Array)**: We multiply TF * IDF. `scikit-learn` builds an array matching the exact size of the Vocabulary. If a word is missing, its slot gets a `0.0`.
    *   **Resume Array:** `[0.4, 0.0, 0.7, 0.5]` *(Java is present, React is 0.0 because it's missing, Spring is highly weighted, Backend is present).*
    *   **Job Array:** `[0.4, 0.0, 0.0, 0.8]` *(Java is present, React is missing, Spring is missing, Backend is heavily demanded).*

**2. What is Cosine Similarity?**
Now that we have two arrays of floating-point numbers (one for the Resume, one for the Job), how do we securely compare them?
- Imagine plotting these two arrays as **lines (vectors)** on a mathematical graph.
- **Cosine Similarity** measures the *angle* between these two lines using the dot product formula: `(A · B) / (||A|| * ||B||)`.
- If the angle is **0°** (the lines point in the exact same direction), the `cosine(0)` is **1** (100% Match because the decimal patterns align).
- If the angle is **90°** (the lines are completely perpendicular/unrelated), the `cosine(90)` is **0** (0% Match).

**Why use this alongside Keyword matching?**
Basic keyword matching is easily fooled if the job asks for "Backend Developer" but the candidate wrote "Server-side Engineer". TF-IDF & Cosine Similarity look at the mathematical weights of all surrounding words to mathematically catch the overall *contextual theme* of the document, giving us a smart **20% semantic bump** to the candidate's score.

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

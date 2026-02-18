import sys
print("Script starting...", file=sys.stderr)

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import re
    print("Imports successful", file=sys.stderr)
except ImportError as e:
    print(f"Import Error: {e}", file=sys.stderr)
    sys.exit(1)

def clean_text(text):
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text.lower().strip()

# User's Resume Text (Truncated for brevity but representative)
resume_text = """
Kashinath Kesale
Pune, India
Profile
Final-year undergraduate focused on backend and distributed systems.
Strong foundation in DSA and core CS fundamentals.
Experience
Software Engineering Intern GoBasera Oct 2025 – Dec 2025
• Built features using NestJS, TypeScript, React, PostgreSQL, and Docker.
Projects
PayFlowX – Transactional Payment System (NestJS, TypeScript, PostgreSQL, Prisma)
• Built a transactional engine with idempotency.
Resilient Real-Time Live Polling System (Socket.io, React.js, Node.js, MongoDB)
• Built a real-time polling system.
Technical Skills
Programming Languages: Java, JavaScript, TypeScript, Python
Full-Stack Development: Nest.js, React.js, Next.js, Node.js, Express.js, REST APIs
Databases: PostgreSQL, MongoDB, SQL, MySQL
"""

# Job Description (MERN Stack)
job_desc = """
TechSolutions India is looking for a skilled Full Stack Developer.
Key Responsibilities
- Develop user-facing features using React.js and Redux.
- Build backend APIs with Node.js, Express, and MongoDB.
Requirements
- Strong proficiency in JavaScript (ES6+), React.js, and Node.js.
- Experience with RESTful APIs and MongoDB.
"""

cleaned_resume = clean_text(resume_text)
cleaned_job = clean_text(job_desc)

print(f"Cleaned Resume Length: {len(cleaned_resume)}")
print(f"Cleaned Job Length: {len(cleaned_job)}")

vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform([cleaned_resume, cleaned_job])
similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

score = round(similarity * 100, 2)
print(f"RAW Semantic SCORE: {score}")

# 3. Simulate "Presentation Mode" Score
# Formula: (Semantic*0.9 + Keyword*0.1) -> Then Curve -> Then Weight

# 1. AI Service Calculation (90/10)
# Assuming 30% keyword overlap for this example (since resume has NestJS but job wants Node)
keyword_score = 30.0 
ai_service_output = (score * 0.9) + (keyword_score * 0.1) 
print(f"AI Service Output: {round(ai_service_output, 2)}%")

# 2. Backward Scoring (Presentation Curve)
# AI Weight: 70%, Acad Weight: 30%
# Curve: min(ai * 1.6, 100)

curved_ai = min(ai_service_output * 1.6, 100)
final_ai_contribution = (curved_ai / 100) * 70

academic_contribution = 30 # Assuming full academic marks
final_total = final_ai_contribution + academic_contribution

print(f"Curved AI Score: {round(curved_ai, 2)}%")
print(f"Final Presentation Score: {round(final_total, 2)}%")

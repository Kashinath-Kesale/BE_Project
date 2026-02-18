from matcher import JobMatcher
import json

matcher = JobMatcher()

resume_text = """
Experienced Python Developer with strong skills in Django, Flask, and AWS.
Worked on scalable microservices and REST APIs.
Knowledge of Docker and Kubernetes.
"""

job_description = """
We are looking for a Backend Engineer with experience in Python and Cloud technologies.
Responsibilities:
- Build RESTful APIs using Django or Flask.
- Deploy applications on AWS.
- Containerize apps using Docker.
"""

job_keywords = ["Python", "Django", "AWS", "Docker", "Kubernetes", "React"]

print("Testing Matching Engine...")
try:
    result = matcher.match(resume_text, job_description, job_keywords)
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error: {e}")

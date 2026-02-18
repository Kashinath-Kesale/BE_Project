from resume_parser import parser
import json

sample_text = """
Arjun Kesale
arjun.kesale@example.com
(555) 123-4567

Summary
Experienced Software Engineer with expertise in Python, React, and AWS.
Worked at Google as a Senior Developer.

Education
B.S. Computer Science, Stanford University

Skills: Docker, Kubernetes, SQL, MongoDB, Postman.
"""

print("Testing Resume Parser...")
try:
    data = parser.parse(sample_text)
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")

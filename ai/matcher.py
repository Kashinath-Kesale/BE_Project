from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from resume_parser import parser

class JobMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def calculate_similarity(self, text1, text2):
        """
        Calculates Cosine Similarity between two texts using TF-IDF.
        Returns a float between 0 and 1.
        """
        if not text1 or not text2:
            return 0.0
            
        try:
            # Fit and transform the texts
            tfidf_matrix = self.vectorizer.fit_transform([text1, text2])
            
            # Calculate Cosine Similarity
            # Matrix is 2x2: [[Sim(A,A), Sim(A,B)], [Sim(B,A), Sim(B,B)]]
            # We want Sim(A,B) which is at [0,1]
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            
            return float(cosine_sim[0][0])
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0

    def match(self, resume_text, job_description, job_keywords=[], candidate_skills=[]):
        """
        Computes a hybrid match score based on:
        1. Semantic Similarity (TF-IDF) - 70%
        2. Keyword Overlap (Jaccard-ish) - 30%
        """
        # 1. Semantic Score
        semantic_score = self.calculate_similarity(resume_text, job_description)
        
        # 2. Keyword Match Score
        keyword_score = 0.0
        missing_keywords = []
        
        if job_keywords:
            if candidate_skills:
                raw_resume_skills = candidate_skills
            else:
                # Fallback: Extract skills from resume using our NLP parser
                resume_data = parser.parse(resume_text)
                raw_resume_skills = resume_data["skills"]
            
            # Common aliases to map everything to a standard name
            aliases = {
                "express": "express.js",
                "react": "react.js",
                "node": "node.js",
                "vue": "vue.js",
                "next": "next.js",
                "nest": "nestjs",
                "mongo": "mongodb",
                "postgres": "postgresql"
            }
            
            def normalize(skill):
                s = skill.lower().strip()
                return aliases.get(s, s)
                
            # Map normalized -> original to keep original case for missing keywords display
            job_skills_map = {normalize(k): k for k in job_keywords}
            normalized_job_skills = set(job_skills_map.keys())
            
            normalized_resume_skills = set(normalize(s) for s in raw_resume_skills)
            
            if normalized_job_skills:
                matching_skills = normalized_resume_skills.intersection(normalized_job_skills)
                keyword_score = len(matching_skills) / len(normalized_job_skills)
                
                # The missing normalized skills
                missing_normalized = normalized_job_skills - normalized_resume_skills
                # Map back to what the JD actually asked for
                missing_keywords = [job_skills_map[mn] for mn in missing_normalized]
        
        # Weighted Average
        # If no keywords provided, rely 100% on semantic score
        if not job_keywords:
            final_score = semantic_score * 100
        else:
            # Shifted to 80% Keyword / 20% Semantic for "Fresher/College" Optimization
            # For freshers, specific skills (React, Node, Python) matter 80%.
            # Context/Experience descriptions matter less (20%).
            final_score = (semantic_score * 0.2 + keyword_score * 0.8) * 100
            
        return {
            "match_percentage": round(final_score, 2),
            "semantic_score": round(semantic_score * 100, 2),
            "keyword_score": round(keyword_score * 100, 2),
            "missing_keywords": missing_keywords
        }

matcher = JobMatcher()

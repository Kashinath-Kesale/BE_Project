import spacy
from spacy.pipeline import EntityRuler
import json
import os
import re

class ResumeParser:
    """
    A class to parse resumes using spaCy NLP.
    Extracts identifiable information (Name, Email, Phone) and technical skills.
    """
    def __init__(self, model_name="en_core_web_sm"):
        print("Loading NLP Model...")
        try:
            self.nlp = spacy.load(model_name)
        except OSError:
            print(f"Model '{model_name}' not found. Downloading...")
            from spacy.cli import download
            download(model_name)
            self.nlp = spacy.load(model_name)
        
        # Load Skills Database
        skills_path = os.path.join(os.path.dirname(__file__), "data", "skills.json")
        self.skill_patterns = []
        if os.path.exists(skills_path):
            with open(skills_path, "r") as f:
                skills_data = json.load(f)
                for category, skills in skills_data.items():
                    for skill in skills:
                        # Create case-insensitive patterns for EntityRuler
                        self.skill_patterns.append({"label": "SKILL", "pattern": [{"LOWER": skill.lower()}], "id": category})
        
        # Add EntityRuler pipeline component
        # Added before 'ner' to prioritize our custom skills over generic entities
        if "entity_ruler" not in self.nlp.pipe_names:
            ruler = self.nlp.add_pipe("entity_ruler", before="ner")
            ruler.add_patterns(self.skill_patterns)
        
        print("NLP Model Loaded.")

    def extract_contact_info(self, text):
        """
        Extracts email and phone number using regex patterns.
        """
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        # Simplified phone regex to avoid capturing dates/years
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        
        emails = re.findall(email_pattern, text)
        phones = re.findall(phone_pattern, text)
        
        # Clean and validate extracted phone numbers
        valid_phones = []
        for p in phones:
            if len(p) > 9:
                valid_phones.append(p)

        return {
            "email": emails[0] if emails else None,
            "phone": valid_phones[0] if valid_phones else None
        }

    def parse(self, text):
        """
        Main parsing method.
        Returns a dictionary containing Name, Contact Info, and Skills.
        """
        doc = self.nlp(text)
        
        data = {
            "name": None,
            "email": None,
            "phone": None,
            "skills": [],
            "education": [], 
            "experience": [] 
        }
        
        # Extract Contact Info
        contact = self.extract_contact_info(text)
        data["email"] = contact["email"]
        data["phone"] = contact["phone"]
        
        # Extract Entities (Name & Skills)
        for ent in doc.ents:
            # Name Heuristic: First PERSON entity that looks like a name (2+ words)
            if ent.label_ == "PERSON" and not data["name"]:
                clean_name = ent.text.strip().title()
                if len(clean_name.split()) >= 2 and "@" not in clean_name:
                    data["name"] = clean_name
            
            if ent.label_ == "SKILL":
                if ent.text not in data["skills"]:
                    data["skills"].append(ent.text)
                    
        return data

# Singleton initialization
parser = ResumeParser()

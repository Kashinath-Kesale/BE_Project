/**
 * Skill Suggester Utility
 * 
 * Takes an array of a candidate's current skills and returns
 * a list of suggested skills they can learn next to strengthen their profile.
 * Uses a simple rule-based graph to avoid heavy NLP computations dynamically.
 */

// Mapping of foundational skills to advanced/related skills
const skillGraph = {
  // Frontend
  "React": ["Next.js", "TypeScript", "Redux", "Tailwind CSS", "GraphQL"],
  "JavaScript": ["TypeScript", "React", "Node.js", "Express.js"],
  "HTML": ["CSS", "JavaScript", "React"],
  "CSS": ["Tailwind CSS", "Sass", "Bootstrap"],
  "Vue": ["Vuex", "Nuxt.js", "TypeScript"],
  "Angular": ["RxJS", "TypeScript", "NGRX"],

  // Backend
  "Node.js": ["Express.js", "NestJS", "Docker", "GraphQL", "Microservices"],
  "Python": ["Django", "FastAPI", "Pandas", "Machine Learning", "AWS"],
  "Java": ["Spring Boot", "Hibernate", "Microservices", "Kafka"],
  "Spring Boot": ["Microservices", "Docker", "Kubernetes", "AWS"],
  "C++": ["Data Structures", "Algorithms", "System Design"],
  "C#": [".NET Core", "Azure", "Entity Framework"],
  "PHP": ["Laravel", "MySQL", "Vue"],
  "Ruby": ["Ruby on Rails", "PostgreSQL", "Redis"],
  "Go": ["Docker", "Kubernetes", "gRPC", "Microservices"],

  // Database
  "SQL": ["PostgreSQL", "MySQL", "Database Optimization", "Redis"],
  "MongoDB": ["Mongoose", "NoSQL", "Express.js", "Redis"],
  "MySQL": ["Database Design", "Performance Tuning"],
  "PostgreSQL": ["PL/pgSQL", "Docker", "Redis"],

  // AI & Data
  "Machine Learning": ["Deep Learning", "TensorFlow", "PyTorch", "NLP"],
  "Data Science": ["Pandas", "NumPy", "Scikit-learn", "Matplotlib"],
  "TensorFlow": ["Deep Learning", "Computer Vision", "Keras"],

  // DevOps & Tools
  "Docker": ["Kubernetes", "CI/CD", "AWS", "Jenkins"],
  "AWS": ["EC2", "S3", "Lambda", "Terraform", "Serverless"],
  "Git": ["GitHub Actions", "GitLab CI", "CI/CD"]
};

/**
 * Suggests skills based on the candidate's existing skills.
 * @param {string[]} currentSkills Array of strings representing candidate's skills.
 * @param {number} limit Maximum number of suggestions to return.
 * @returns {string[]} Array of suggested skill names.
 */
export const suggestSkills = (currentSkills, limit = 5) => {
  if (!currentSkills || currentSkills.length === 0) {
    // Default suggestions for empty profiles
    return ["JavaScript", "Python", "React", "SQL", "Git"];
  }

  // Common aliases to map everything to a standard name matching the graph
  const aliases = {
    "express": "express.js",
    "express.js": "express.js",
    "react.js": "react",
    "react": "react",
    "node": "node.js",
    "node.js": "node.js",
    "vue.js": "vue",
    "vue": "vue",
    "next": "next.js",
    "nest": "nestjs",
    "mongo": "mongodb",
    "postgres": "postgresql"
  };

  const normalize = (s) => {
    if (!s) return "";
    let ns = s.toLowerCase().trim();
    return aliases[ns] || ns;
  };

  // Normalize current skills for easier comparison
  const normalizedCurrent = currentSkills.map(normalize);
  const suggestionsSet = new Set();

  for (const skill of currentSkills) {
    const normalizedSkill = normalize(skill);

    // Custom case-insensitive lookup against normalized keys
    const graphKeys = Object.keys(skillGraph);
    const matchedKey = graphKeys.find(k => normalize(k) === normalizedSkill);

    if (matchedKey) {
      const relatedSkills = skillGraph[matchedKey];
      for (const related of relatedSkills) {
        // Ensure the candidate doesn't already have this skill
        if (!normalizedCurrent.includes(normalize(related))) {
          suggestionsSet.add(related);
        }
      }
    }
  }

  // Convert Set array to limit
  const suggestionsArray = Array.from(suggestionsSet);

  // If no specific suggestions found, provide general popular skills not in current profile
  if (suggestionsArray.length === 0) {
    const popularFallbacks = ["Docker", "AWS", "TypeScript", "Redis", "Next.js"];
    for (const fb of popularFallbacks) {
      if (!normalizedCurrent.includes(fb.toLowerCase())) {
        suggestionsSet.add(fb);
      }
    }
  }

  // Shuffle or take top 'limit' (taking top for simplicity)
  return Array.from(suggestionsSet).slice(0, limit);
};

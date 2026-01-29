// backend/utils/matching.js

/**
 * Compute Match Percentage
 * Weight Distribution:
 * - Skills: 40%
 * - Academic (10th, 12th, CGPA): 30%
 * - Location: 20%
 * - Bonus (Gender/Other): 10%
 */
export const computeMatchPercentage = (candidate, job) => {
  let score = 0;
  let maxScore = 100;

  // 1. SKILLS MATCH (40%)
  const jobMethods = job.keywords || [];
  const candSkills = candidate.skills || [];

  // Also include keywords extracted from resume if explicit skills are empty
  const allCandSkills = [...new Set([...candSkills, ...(candidate.keywords || [])])];

  if (jobMethods.length > 0) {
    const jobSet = new Set(jobMethods.map(k => k.toLowerCase()));

    // Count matches
    const matches = allCandSkills.filter(s => jobSet.has(s.toLowerCase())).length;

    // Score calculation: (Matches / Total Job Skills) * 40
    // If job has no skills defined, full points? No, 0 points for this section usually.
    // Let's give proportional score.
    const skillRatio = Math.min(matches / jobMethods.length, 1);
    score += skillRatio * 40;
  } else {
    // If job has no skill requirements, give full points for this section? 
    // Or ignore? Let's give full points to avoid punishing candidate.
    score += 40;
  }

  // 2. ACADEMIC MATCH (30%)
  // 10th (10%), 12th (10%), CGPA (10%)
  const criteria = job.criteria || {};
  const edu = candidate.education || {};

  // 10th
  if (criteria.minTenthPercent) {
    const candTenth = edu.tenth?.percentage || 0;
    if (candTenth >= criteria.minTenthPercent) score += 10;
  } else {
    score += 10; // No requirement = Full points
  }

  // 12th
  if (criteria.minTwelfthPercent) {
    const candTwelfth = edu.twelfth?.percentage || 0;
    if (candTwelfth >= criteria.minTwelfthPercent) score += 10;
  } else {
    score += 10;
  }

  // CGPA
  if (criteria.minCgpa) {
    // Normalize CGPA: if candidate has percentage, approx convert / 9.5 or check if field matches
    // Assuming both are same unit or user handled. If field is string, parsing needed.
    // Candidate btech.cgpa might be mixed.
    let candCgpa = parseFloat(edu.btech?.cgpa || edu.cgpa || 0); // fallback to old field
    // Simple verification
    if (candCgpa >= criteria.minCgpa) score += 10;
  } else {
    score += 10;
  }

  // 3. LOCATION MATCH (20%)
  if (job.location) {
    const jobLoc = job.location.toLowerCase();
    const candLoc = (candidate.location || "").toLowerCase();

    // Partial match: "Pune" matches "Pune, India"
    if (candLoc && (candLoc.includes(jobLoc) || jobLoc.includes(candLoc))) {
      score += 20;
    }
  } else {
    score += 20; // No location preference
  }

  // 4. BONUS / RESTRICTIONS (10%)
  // Gender Preference
  if (criteria.gender && criteria.gender !== "Any") {
    if (candidate.gender && candidate.gender === criteria.gender) {
      score += 10;
    } else {
      // If gender mismatch, strict penalty? or just 0 bonus?
      // Usually strict filters filter OUT, but matching ranks.
      // If strict, we should've filtered before. This is ranking.
      score += 0;
    }
  } else {
    score += 10;
  }

  return Math.round(score);
};

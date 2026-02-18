// backend/utils/matching.js

/**
 * Computes the weighted match percentage between a candidate and a job.
 * 
 * Weight Distribution:
 * - AI Score (Semantic + Skills): 70% (Curved 1.5x)
 * - Academic (Criteria): 30%
 * - Location: 0% (Removed)
 * - Bonus: 0% (Removed)
 * 
 * @param {Object} candidate - The candidate profile
 * @param {Object} job - The job posting
 * @param {number} aiScore - The semantic match score from Python service (0-100)
 * @returns {number} - Final match percentage (0-100)
 */
export const computeMatchPercentage = (candidate, job, aiScore = 0) => {
  let score = 0;

  // 1. AI MATCH (70%) - "Fresher Mode" (Keyword Heavy)
  // Since we now rely 80% on exact keywords, the raw score will be naturally high (e.g. 80-90%).
  // We use a tiny 1.2x polish just to round up near-perfect matches.
  if (aiScore) {
    const curvedAiScore = Math.min(aiScore * 1.2, 100);
    score += (curvedAiScore / 100) * 70;
  }

  // 2. ACADEMIC MATCH (30%) - High weight for presentation
  const criteria = job.criteria || {};
  const edu = candidate.education || {};

  let criteriaMet = 0;
  let totalCriteria = 0;

  // Check 10th
  if (criteria.minTenthPercent) {
    totalCriteria++;
    if ((edu.tenth?.percentage || 0) >= criteria.minTenthPercent) criteriaMet++;
  }

  // Check 12th
  if (criteria.minTwelfthPercent) {
    totalCriteria++;
    if ((edu.twelfth?.percentage || 0) >= criteria.minTwelfthPercent) criteriaMet++;
  }

  // Check CGPA
  if (criteria.minCgpa) {
    totalCriteria++;
    // Handle potential string vs number inputs
    const candCgpa = parseFloat(edu.btech?.cgpa || 0);
    if (!isNaN(candCgpa) && candCgpa >= criteria.minCgpa) criteriaMet++;
  }

  // Calculate Academic Score
  if (totalCriteria === 0) {
    score += 30; // No criteria = Full 30 points
  } else {
    score += (criteriaMet / totalCriteria) * 30;
  }

  // Removed Location and Bonus to focus on Resume & Academics as requested.

  return Math.round(Math.min(score, 100));
};

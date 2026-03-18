// utils/profileCompletion.js

export const calculateProfileCompletion = (candidate) => {
  let completion = 0;

  // Personal Info (20%)
  if (candidate.phone) completion += 5;
  if (candidate.gender) completion += 5;
  if (candidate.location) completion += 5;
  if (candidate.branch) completion += 5;

  // Academic Details (40%)
  if (candidate.education?.btech?.year && candidate.education?.btech?.cgpa) completion += 20; // Undergraduate
  if (candidate.education?.tenth?.percentage) completion += 10; // 10th
  if (candidate.education?.twelfth?.percentage) completion += 10; // 12th

  // Skills & Socials (20%)
  if (candidate.skills && candidate.skills.length > 0) completion += 15;
  if (candidate.githubProfile || candidate.linkedinProfile) completion += 5;

  // Resume (20%)
  if (candidate.resumeUrl) completion += 20;

  return Math.min(completion, 100);
};

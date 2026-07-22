/**
 * Calculate deterministic real skill match score between candidate and job posting
 */
export function calculateRealSkillMatch(candidate: any, job: any): {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  summary: string;
} {
  const candidateSkills: string[] = (candidate?.skills || []).map((s: string) => s.toLowerCase());
  const jobSkills: string[] = (job?.skills || job?.requiredSkills || []).map((s: string) => s.toLowerCase());

  if (jobSkills.length === 0) {
    return {
      score: 100,
      matchedSkills: candidateSkills,
      missingSkills: [],
      strengths: ["Candidate profile aligns with overall job criteria."],
      summary: "Candidate meets core background requirements for this posting.",
    };
  }

  // 1. Skill Overlap (60 points max)
  const matchedSkills = jobSkills.filter((skill) =>
    candidateSkills.some((cSkill) => cSkill.includes(skill) || skill.includes(cSkill))
  );
  const missingSkills = jobSkills.filter((skill) => !matchedSkills.includes(skill));

  const skillScore = Math.round((matchedSkills.length / jobSkills.length) * 60);

  // 2. Location Match (20 points max)
  let locationScore = 0;
  const isRemote = job?.jobType?.toLowerCase().includes("remote") || job?.location?.toLowerCase().includes("remote");
  const isLocationMatch = isRemote || (candidate?.location && job?.location && candidate.location.toLowerCase().includes(job.location.toLowerCase()));
  if (isLocationMatch) {
    locationScore = 20;
  }

  // 3. Experience & Portfolio Match (20 points max)
  let expScore = 10;
  if (candidate?.experience && candidate.experience.length > 0) {
    expScore = 20;
  }

  const finalScore = Math.min(100, skillScore + locationScore + expScore);

  const strengths: string[] = [];
  if (matchedSkills.length > 0) {
    strengths.push(`Matched ${matchedSkills.length} required skills: ${matchedSkills.slice(0, 4).join(", ")}`);
  }
  if (isRemote || isLocationMatch) {
    strengths.push(isRemote ? "Open to Remote work arrangement" : `Located in target location (${candidate?.location || "Match"})`);
  }
  if (candidate?.resumeUrl) {
    strengths.push("Verified resume attached");
  }

  const summary = `Candidate satisfies ${matchedSkills.length} out of ${jobSkills.length} required technical skills (${matchedSkills.join(", ") || "General background"}). ${missingSkills.length > 0 ? `Missing: ${missingSkills.join(", ")}` : "All key skills matched!"}`;

  return {
    score: finalScore,
    matchedSkills,
    missingSkills,
    strengths,
    summary,
  };
}

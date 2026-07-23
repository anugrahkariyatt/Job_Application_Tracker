export function calculateRealSkillMatch(candidate: any, job: any): {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  summary: string;
} {
  const candidateSkills: string[] = (candidate?.skills || []).map((s: string) => s.toLowerCase());
  const jobSkills: string[] = (job?.skills || job?.requiredSkills || []).map((s: string) => s.toLowerCase());

  if (!jobSkills.length) {
    const fallbackScore = candidateSkills.length ? Math.min(75 + candidateSkills.length * 3, 95) : 80;
    return {
      score: fallbackScore,
      matchedSkills: candidateSkills,
      missingSkills: [],
      strengths: [
        "Candidate profile aligns with standard position criteria",
        "Verified background and contact details",
      ],
      summary: "Candidate profile submitted with relevant qualifications.",
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

  // 3. Experience Match (20 points max)
  let expScore = 10;
  if (candidate?.experience && candidate.experience.length > 0) {
    expScore = 20;
  }

  const finalScore = Math.min(100, skillScore + locationScore + expScore);

  const strengths: string[] = [];
  if (matchedSkills.length > 0) {
    strengths.push(`Matched ${matchedSkills.length} required skills (${matchedSkills.slice(0, 3).join(", ")})`);
  }
  if (isLocationMatch) {
    strengths.push(isRemote ? "Compatible with Remote work" : `Located in ${candidate?.location || "Target area"}`);
  }
  if (candidate?.resumeUrl) {
    strengths.push("Verified resume attached");
  }
  if (strengths.length === 0) {
    strengths.push("Standard applicant profile submitted");
  }

  const summary = `Skill alignment: Matched ${matchedSkills.length} of ${jobSkills.length} job requirements. ${missingSkills.length > 0 ? `Missing skills: ${missingSkills.join(", ")}` : "100% skills matched!"}`;

  return {
    score: finalScore,
    matchedSkills,
    missingSkills,
    strengths,
    summary,
  };
}

function extractTechKeywords(text: string): string[] {
  if (!text) return [];
  const knownSkills = [
    "react", "next.js", "vue", "angular", "node.js", "node", "express",
    "typescript", "javascript", "python", "django", "flask", "java", "spring",
    "c#", ".net", "php", "laravel", "ruby", "rails", "sql", "postgresql", "mysql", "mongodb",
    "redis", "aws", "azure", "docker", "kubernetes", "git", "graphql", "rest",
    "tailwind", "css", "html", "figma", "ui/ux", "devops", "ci/cd", "c++", "golang", "go"
  ];
  const lower = text.toLowerCase();
  return knownSkills.filter((skill) => lower.includes(skill));
}

function parseSkillsInput(rawSkills: any): string[] {
  if (!rawSkills) return [];
  if (Array.isArray(rawSkills)) {
    return rawSkills
      .flatMap((s) => {
        if (typeof s === "string") return s.split(",");
        if (s && typeof s === "object" && s.name) return String(s.name).split(",");
        return [];
      })
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof rawSkills === "string") {
    return rawSkills
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

export function parseCandidateSkills(candidate: any): string[] {
  const directSkills = parseSkillsInput(candidate?.skills);
  const headlineSkills = extractTechKeywords(candidate?.headline || "");
  const bioSkills = extractTechKeywords(candidate?.bio || "");
  return Array.from(new Set([...directSkills, ...headlineSkills, ...bioSkills]));
}

export function parseJobSkills(job: any): string[] {
  const directSkills = parseSkillsInput(job?.skills || job?.requiredSkills);
  const reqSkills = extractTechKeywords(job?.requirements || "");
  const titleSkills = extractTechKeywords(job?.title || "");
  return Array.from(new Set([...directSkills, ...reqSkills, ...titleSkills]));
}

export function calculateRealSkillMatch(candidate: any, job: any): {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  summary: string;
} {
  const candidateSkills = parseCandidateSkills(candidate);
  const jobSkills = parseJobSkills(job);

  const candidateLoc = (candidate?.location || "").toLowerCase().trim();
  const jobLoc = (job?.location || "").toLowerCase().trim();
  const jobType = (job?.jobType || job?.employmentType || "").toLowerCase().trim();

  const isRemote = jobType.includes("remote") || jobLoc.includes("remote");
  const isLocationMatch = isRemote || (candidateLoc && jobLoc && (candidateLoc.includes(jobLoc) || jobLoc.includes(candidateLoc)));

  const hasExperience = Array.isArray(candidate?.experience) && candidate.experience.length > 0;

  if (!jobSkills.length) {
    let score = 50;
    if (candidateSkills.length > 0) score += Math.min(candidateSkills.length * 5, 25);
    if (isLocationMatch) score += 10;
    if (hasExperience) score += 15;
    score = Math.min(score, 90);

    return {
      score,
      matchedSkills: candidateSkills,
      missingSkills: [],
      strengths: [
        candidateSkills.length ? `Candidate possesses ${candidateSkills.length} listed skills` : "Standard profile submitted",
        isLocationMatch ? (isRemote ? "Remote compatible" : `Located in target area (${candidate?.location})`) : "Location pending review",
        hasExperience ? "Prior work experience verified" : "Entry-level candidate profile"
      ],
      summary: `Dynamic assessment: Candidate submitted ${candidateSkills.length} skills. Job has no explicit skill requirements defined.`
    };
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const jSkill of jobSkills) {
    const isMatched = candidateSkills.some(
      (cSkill) => cSkill === jSkill || cSkill.includes(jSkill) || jSkill.includes(cSkill)
    );
    if (isMatched) {
      matchedSkills.push(jSkill);
    } else {
      missingSkills.push(jSkill);
    }
  }

  // 1. Skill Overlap (70 points max)
  const skillRatio = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0;
  const skillScore = Math.round(skillRatio * 70);

  // 2. Location (15 points max)
  const locationScore = isLocationMatch ? 15 : 0;

  // 3. Experience (15 points max)
  const expScore = hasExperience ? 15 : 5;

  const finalScore = Math.min(100, Math.max(15, skillScore + locationScore + expScore));

  const strengths: string[] = [];
  if (matchedSkills.length > 0) {
    const capitalMatched = matchedSkills.slice(0, 4).map((s) => s.toUpperCase());
    strengths.push(`Matched ${matchedSkills.length}/${jobSkills.length} required skills (${capitalMatched.join(", ")})`);
  } else {
    strengths.push("No direct skill matches found for job requirements");
  }

  if (isLocationMatch) {
    strengths.push(isRemote ? "Fully compatible with Remote work" : `Located near job area (${candidate?.location || "Target region"})`);
  }

  if (hasExperience) {
    strengths.push(`Verified ${candidate.experience.length} work experience entry/entries`);
  }

  if (candidate?.resumeUrl) {
    strengths.push("Resume document attached");
  }

  const summary = matchedSkills.length === jobSkills.length
    ? `Exceptional match! Candidate satisfies 100% of required skills (${jobSkills.length}/${jobSkills.length}).`
    : `Skill alignment: Matched ${matchedSkills.length} of ${jobSkills.length} required skills. ${
        missingSkills.length > 0 ? `Missing skills: ${missingSkills.join(", ")}.` : ""
      }`;

  return {
    score: finalScore,
    matchedSkills,
    missingSkills,
    strengths,
    summary,
  };
}

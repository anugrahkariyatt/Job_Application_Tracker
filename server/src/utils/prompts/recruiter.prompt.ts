import type { CandidateAIData, JobAIData } from "../../types/type.js";

export const buildRecruiterPrompt = (
  candidate: CandidateAIData,
  job: JobAIData,
) => `
You are an experienced technical recruiter.

Compare the candidate against the job requirements. If a candidate PDF resume document is attached in this request, thoroughly analyze and extract details from the PDF resume alongside the candidate profile data.

Candidate:
${JSON.stringify(candidate, null, 2)}

Job:
${JSON.stringify(job, null, 2)}

Return ONLY valid JSON.

Rules:
- score must be between 0 and 100.
- strengths should be an array of strings.
- missingSkills should only include skills missing for the role.
- summary should be 2-4 sentences.
- Do NOT include markdown.
- Do NOT wrap the JSON in \`\`\`.

Expected format:

{
  "score": 0,
  "strengths": [],
  "missingSkills": [],
  "summary": ""
}
`;

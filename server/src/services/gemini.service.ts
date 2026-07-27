import { gemini } from "../config/gemini.config.js";
import type {
    CandidateAIData,
    JobAIData,
} from "../types/type.js";
import { buildRecruiterPrompt } from "../utils/prompts/recruiter.prompt.js";
import { buildCandidatePrompt } from "../utils/prompts/candidate.prompt.js";

export interface RecruiterAIMatch {
    score: number;
    strengths: string[];
    missingSkills: string[];
    summary: string;
}

export interface CandidateAIMatch {
    score: number;
    strengths: string[];
    missingSkills: string[];
    summary: string;
    recommendation: string;
}

async function buildGeminiContents(promptText: string, resumeUrl?: string) {
    if (resumeUrl && (resumeUrl.startsWith("http://") || resumeUrl.startsWith("https://"))) {
        try {
            console.log(`[GEMINI SERVICE] Fetching candidate PDF resume from URL: ${resumeUrl}`);
            const res = await fetch(resumeUrl);
            if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                const base64Data = Buffer.from(arrayBuffer).toString("base64");
                const contentType = res.headers.get("content-type") || "application/pdf";
                const mimeType = contentType.includes("pdf") ? "application/pdf" : contentType;
                console.log(`[GEMINI SERVICE] Successfully loaded PDF resume (${base64Data.length} chars base64). Attaching inline to Gemini request.`);
                return [
                    {
                        inlineData: {
                            mimeType,
                            data: base64Data,
                        },
                    },
                    promptText,
                ];
            } else {
                console.warn(`[GEMINI SERVICE WARNING] HTTP ${res.status} fetching resume from ${resumeUrl}. Proceeding with text prompt.`);
            }
        } catch (err: any) {
            console.warn(`[GEMINI SERVICE WARNING] Failed to fetch PDF resume: ${err?.message || err}. Proceeding with text prompt.`);
        }
    }
    return promptText;
}

export const getRecruiterAIMatch = async (
    candidate: CandidateAIData,
    job: JobAIData,
): Promise<RecruiterAIMatch> => {
    const prompt = buildRecruiterPrompt(candidate, job);
    const contents = await buildGeminiContents(prompt, candidate.resumeUrl);

    let response: any;
    try {
        response = await gemini.models.generateContent({
            model: "gemini-3.6-flash",
            contents,
        });
    } catch (err: any) {
        console.warn(`[GEMINI AI MATCHER WARNING] "gemini-3.6-flash" failed: ${err?.message || err}. Trying fallback "gemini-2.0-flash"...`);
        response = await gemini.models.generateContent({
            model: "gemini-2.0-flash",
            contents,
        });
    }

    const text = response?.text ?? "";
    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        const parsed = JSON.parse(cleaned) as RecruiterAIMatch;
        return parsed;
    } catch (error) {
        console.error(`[GEMINI AI MATCHER ERROR] Failed to parse Gemini response as JSON. Cleaned output was:\n"${cleaned}"`, error);
        throw new Error("Gemini returned invalid JSON format.");
    }
};

export const getCandidateAIMatch = async (
    candidate: CandidateAIData,
    job: JobAIData,
): Promise<CandidateAIMatch> => {
    const prompt = buildCandidatePrompt(candidate, job);
    const contents = await buildGeminiContents(prompt, candidate.resumeUrl);

    let response: any;
    try {
        response = await gemini.models.generateContent({
            model: "gemini-3.6-flash",
            contents,
        });
    } catch (err: any) {
        console.warn(`[GEMINI CANDIDATE MATCHER WARNING] "gemini-3.6-flash" failed: ${err?.message || err}. Trying fallback "gemini-2.0-flash"...`);
        response = await gemini.models.generateContent({
            model: "gemini-2.0-flash",
            contents,
        });
    }

    const text = response?.text ?? "";
    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        const parsed = JSON.parse(cleaned) as CandidateAIMatch;
        return parsed;
    } catch (error) {
        console.error(`[GEMINI CANDIDATE MATCHER ERROR] Failed to parse Gemini response as JSON. Cleaned output was:\n"${cleaned}"`, error);
        throw new Error("Gemini returned invalid JSON format.");
    }
};
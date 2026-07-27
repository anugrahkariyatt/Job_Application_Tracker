import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});
// const models = await gemini.models.list();

// console.log(models);
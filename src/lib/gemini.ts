import { GoogleGenerativeAI } from "@google/generative-ai";

export function createGeminiClient() {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        throw new Error("Missing API Key. Please configure GOOGLE_API_KEY in your .env file.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
}

import OpenAI from 'openai';
import { decrypt } from '@/lib/encryption';
import { headers } from 'next/headers';

export function createOpenAIClient(encryptedKey: string) {
    const apiKey = decrypt(encryptedKey);
    if (!apiKey) {
        throw new Error("Invalid API Key");
    }
    return new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
            "HTTP-Referer": "http://localhost:3000/",
            "X-Title": "SEO Engine",
        }
    });
}

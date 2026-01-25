import OpenAI from 'openai';
import { decrypt } from '@/lib/encryption';
import { getAppUrl } from '@/lib/utils';

export function createOpenAIClient(encryptedKey?: string) {
    let apiKey = process.env.OPENROUTER_API_KEY;

    if (encryptedKey) {
        apiKey = decrypt(encryptedKey);
    }

    if (!apiKey) {
        throw new Error("Missing API Key. Please configure OPENROUTER_API_KEY.");
    }

    return new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
            "HTTP-Referer": getAppUrl(),
            "X-Title": "SEO Engine",
        }
    });
}

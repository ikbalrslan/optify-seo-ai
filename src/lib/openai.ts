import OpenAI from 'openai';
import { decrypt } from '@/lib/encryption';
import { getAppUrl } from '@/lib/utils';

export function createOpenAIClient(encryptedKey: string) {
    const apiKey = decrypt(encryptedKey);
    if (!apiKey) {
        throw new Error("Invalid API Key");
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

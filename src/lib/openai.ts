import OpenAI from 'openai';
import { decrypt } from '@/lib/encryption';
import { getAppUrl } from '@/lib/utils';

export function createOpenAIClient(encryptedKey?: string) {
    let apiKey = process.env.OPENAI_API_KEY;

    if (encryptedKey) {
        apiKey = decrypt(encryptedKey);
    }

    if (!apiKey) {
        throw new Error("Missing API Key. Please configure OPENAI_API_KEY.");
    }

    return new OpenAI({
        apiKey: apiKey,
    });
}

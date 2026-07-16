import Anthropic from "@anthropic-ai/sdk";

export function createAnthropicClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error("Missing API Key. Please configure ANTHROPIC_API_KEY.");
    }

    return new Anthropic({ apiKey });
}

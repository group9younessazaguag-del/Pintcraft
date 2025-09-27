
import { GoogleGenAI } from '@google/genai';
import type { ImageStyle } from '../types';

// Helper to parse complex API errors
const getApiErrorDetails = (error: any): { type: 'quota' | 'service' | 'generic', message: string, helpLink?: string } => {
    let errorBody: any = null;
    let isQuotaError = false;
    let isServiceUnavailable = false;
    let helpLink = '';

    try {
        if (typeof error === 'object' && error !== null) {
            if (error.error) {
                errorBody = error.error;
            } else if (error.code && error.status) {
                errorBody = error;
            } else if (typeof error.message === 'string') {
                try {
                    const parsedMessage = JSON.parse(error.message);
                    if (parsedMessage.error) {
                        errorBody = parsedMessage.error;
                    }
                } catch (e) { /* Not JSON */ }
            }
        }
    } catch (e) {
        console.error("Could not extract detailed error body:", e);
    }
    
    if (errorBody) {
        isQuotaError = errorBody.status === 'RESOURCE_EXHAUSTED' || errorBody.code === 429;
        isServiceUnavailable = errorBody.status === 'UNAVAILABLE' || errorBody.code === 503;

        if (isQuotaError && errorBody.details && Array.isArray(errorBody.details)) {
            try {
                const helpDetail = errorBody.details.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.Help');
                if (helpDetail && helpDetail.links && helpDetail.links[0]?.url) {
                    helpLink = helpDetail.links[0].url;
                }
            } catch (e) { /* ignore */ }
        }
    }

    if (isQuotaError) return { type: 'quota', message: 'API Quota Exceeded.', helpLink };
    if (isServiceUnavailable) return { type: 'service', message: 'Image generation service is temporarily unavailable.' };
    return { type: 'generic', message: error.message || 'An unknown error occurred.' };
};


const stylePromptMap: { [key in ImageStyle]: string } = {
    photorealistic: 'A hyper-realistic, professional photograph. Cinematic lighting, dramatic, highly detailed, photorealistic.',
    realistic: 'A realistic, true-to-life image. Natural lighting, sharp focus, high fidelity, looking like a real photograph.',
    fantasy: 'A vibrant digital painting in a fantasy art style. Epic, illustrative, highly detailed, magical.',
    anime: 'A high-quality anime style artwork. Vibrant colors, clean lines, detailed characters, Japanese animation style.',
    minimalist: 'A minimalist and clean product shot. Simple background, soft lighting, focus on the subject.',
    vintage: 'A retro-style photograph with a vintage film look. Grainy texture, faded colors, nostalgic feel.',
    vibrant: 'An incredibly vibrant and colorful image. Saturated colors, high contrast, energetic, and eye-catching.',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateImage = async (
    prompt: string,
    model: string,
    style: ImageStyle,
    aspectRatio: '3:4' | '9:16'
): Promise<string> => {
    const MAX_RETRIES = 3;
    let attempt = 0;
    
    while (attempt < MAX_RETRIES) {
        try {
            // FIX: Initialize with API_KEY from environment variables as per guidelines.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const styleDescription = stylePromptMap[style] || stylePromptMap.photorealistic;
            const enhancedPrompt = `${styleDescription} For a Pinterest pin about: ${prompt}.`;

            const response = await ai.models.generateImages({
                model: model,
                prompt: enhancedPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });

            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } catch (error: any) {
            console.error(`Error generating image (attempt ${attempt + 1}):`, error);
            const errorDetails = getApiErrorDetails(error);

            if (errorDetails.type === 'service' && attempt < MAX_RETRIES - 1) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Service unavailable. Retrying in ${delay / 1000} seconds...`);
                await sleep(delay);
                attempt++;
            } else {
                // FIX: Removed key rotation logic; now we throw on any un-retryable error, including quota.
                const specificError = new Error(errorDetails.message);
                (specificError as any).type = errorDetails.type;
                (specificError as any).helpLink = errorDetails.helpLink;
                throw specificError;
            }
        }
    }
    throw new Error('Failed to generate image after multiple retries.');
};

export const generateKeywords = async (title: string): Promise<string> => {
    if (!title) return '';
    try {
        // FIX: Initialize with API_KEY from environment variables as per guidelines.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are a Pinterest SEO expert. Based on the pin title "${title}", generate a comma-separated list of 5-10 highly relevant keywords that users would search for on Pinterest. Focus on long-tail keywords and popular search terms. Do not include hashtags, quotes, or any other text, just the keywords. Example output: recipe, easy recipe, dinner ideas, healthy food`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text
            .trim()
            .replace(/\n/g, ', ')
            .replace(/, ,/g, ',')
            .replace(/['"]+/g, '');
    } catch (error: any) {
        console.error(`Failed to generate keywords for title: "${title}"`, error);
        const errorDetails = getApiErrorDetails(error);
        const specificError = new Error(errorDetails.message);
        (specificError as any).type = errorDetails.type;
        throw specificError;
    }
};

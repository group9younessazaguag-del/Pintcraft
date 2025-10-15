import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { TemplateData } from '../types';

let ai: GoogleGenAI | null = null;

const getAi = (apiKey?: string) => {
    // The API key must be obtained exclusively from the environment variable `process.env.API_KEY`.
    const key = process.env.API_KEY;
    if (!key) {
        throw new Error("API_KEY is not configured in environment variables. Please follow the setup instructions.");
    }

    if (!ai) {
        ai = new GoogleGenAI({ apiKey: key });
    }
    return ai;
};

// Function to generate keywords for a pin
export const generateKeywords = async (title: string, apiKey?: string): Promise<string> => {
    const aiInstance = getAi(apiKey);
    const prompt = `Generate 5-7 relevant, comma-separated SEO keywords for a Pinterest pin with the title: "${title}". Focus on popular search terms. Do not include hashtags or quotes. Just the keywords.`;
    
    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating keywords:", error);
        throw error;
    }
};

// Function to generate an image based on a prompt
export const generateImage = async (prompt: string, apiKey?: string): Promise<string | null> => {
    const aiInstance = getAi(apiKey);
    try {
        const response = await aiInstance.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '3:4', // Common pin aspect ratio
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
};

// Function to generate pin content ideas
export const generatePinIdeas = async (topic: string, apiKey?: string): Promise<TemplateData[]> => {
    const aiInstance = getAi(apiKey);
    const prompt = `You are a Pinterest marketing expert. Generate 5 creative and engaging pin ideas for the topic: "${topic}". For each idea, provide a catchy title, a short subtitle or description, and a website placeholder like "yourwebsite.com". Format the output as a valid JSON array of objects. Each object should have keys "title", "subtitle", and "website".`;

    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            subtitle: { type: Type.STRING },
                            website: { type: Type.STRING },
                        },
                        required: ["title", "subtitle", "website"],
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const ideas = JSON.parse(jsonText);

        // Map to TemplateData structure
        return ideas.map((idea: any, index: number) => ({
            id: `idea-${Date.now()}-${index}`,
            title: idea.title || '',
            subtitle: idea.subtitle || '',
            website: idea.website || 'yourwebsite.com',
            backgroundImage: null,
            backgroundImage2: null,
            backgroundImage3: null,
            templateId: '5', // Default to classic template
            pinSize: 'standard',
        }));

    } catch (error) {
        console.error("Error generating pin ideas:", error);
        throw error;
    }
};

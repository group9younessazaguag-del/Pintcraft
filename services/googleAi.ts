
import { GoogleGenAI, Type } from '@google/genai';
import { GeneratedContentRow } from '../types';

// Helper to parse complex API errors
const getApiErrorDetails = (error: any): { type: 'quota' | 'service' | 'generic', message: string, helpLink?: string } => {
    let errorBody: any = null;
    let message: string = 'An unknown error occurred.';
    if (typeof error?.message === 'string') {
        try {
            JSON.parse(error.message);
        } catch (e) {
            message = error.message;
        }
    }
    
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
        message = errorBody.message || message;
    }

    if (typeof message === 'string') {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const match = message.match(urlRegex);
        if (match) {
            helpLink = match[0].replace(/[.,\\]$/, '');
        }
    }

    if (!helpLink && errorBody?.details && Array.isArray(errorBody.details)) {
        try {
            const helpDetail = errorBody.details.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.Help');
            if (helpDetail && helpDetail.links && helpDetail.links[0]?.url) {
                helpLink = helpDetail.links[0].url;
            }
        } catch (e) { /* ignore */ }
    }

    if (errorBody) {
        const isQuotaError = errorBody.status === 'RESOURCE_EXHAUSTED' || errorBody.code === 429;
        const isServiceUnavailable = errorBody.status === 'UNAVAILABLE' || errorBody.code === 503;
        
        if (isQuotaError) {
            return { type: 'quota', message: 'API Quota Exceeded.', helpLink: helpLink || undefined };
        }
        if (isServiceUnavailable) {
            return { type: 'service', message: 'Image generation service is temporarily unavailable.', helpLink: helpLink || undefined };
        }
    }
    
    // Add this to provide a more helpful message for the specific error reported by the user
    if (message.includes('An internal error has occurred')) {
        message = 'The AI model experienced an internal error. This is often temporary. Please try again in a few moments.';
    }


    return { type: 'generic', message, helpLink: helpLink || undefined };
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const generateImage = async (
    apiKey: string, // Fal.ai API key
    model: string,
    prompt: string,
    aspectRatio: '3:4' | '9:16'
): Promise<string> => {
    try {
        if (!model.includes('/')) {
            throw new Error('Invalid Fal.ai model name. It must be in the format "author/model-name", e.g., "fal-ai/stable-diffusion-v3-medium".');
        }

        const url = `https://fal.run/${model}`;

        const body = JSON.stringify({
            prompt: prompt,
            aspect_ratio: aspectRatio,
            num_images: 1,
            output_format: "jpeg",
            sync_mode: true
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: body,
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fal.ai API error:', errorData);
            const message = errorData.detail || `Image generation failed with status: ${response.status}`;
            const specificError = new Error(message);
            (specificError as any).type = response.status === 429 ? 'quota' : 'generic';
            throw specificError;
        }

        const result = await response.json();
        const imageUrl = result?.images?.[0]?.url;

        if (!imageUrl) {
            throw new Error('The AI model did not return a valid image URL.');
        }

        if (imageUrl.startsWith('data:image')) {
            return imageUrl;
        }

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to download the generated image from ${imageUrl}`);
        }
        const imageBlob = await imageResponse.blob();
        return await blobToBase64(imageBlob);

    } catch (error: any) {
        console.error('Error generating image with Fal.ai:', error);
        if (error.type) {
            throw error;
        }
        const specificError = new Error(error.message || 'An unknown error occurred during image generation.');
        (specificError as any).type = 'generic';
        throw specificError;
    }
};


export const generateDescription = async (
    apiKey: string, // FIX: Added apiKey parameter
    model: string,
    title: string,
    subtitle: string
): Promise<string> => {
    try {
        // FIX: Instantiate GoogleGenAI with user-provided API key.
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Write a short, engaging Pinterest description for a pin with the title "${title}" and board "${subtitle}". The description should be under 250 characters, use natural language, and end with a clear call to action. Do not include hashtags.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        const text = response.text.trim();

        if (!text) {
            throw new Error('The AI model returned an empty description.');
        }
        return text;

    } catch (error: any) {
        console.error('Error generating description with AI:', error);
        const errorDetails = getApiErrorDetails(error);
        const specificError = new Error(errorDetails.message);
        (specificError as any).type = errorDetails.type;
        (specificError as any).helpLink = errorDetails.helpLink;
        throw specificError;
    }
};

export const generateKeywords = async (
    apiKey: string, // FIX: Added apiKey parameter
    model: string,
    title: string,
    subtitle: string
): Promise<string> => {
    try {
        // FIX: Instantiate GoogleGenAI with user-provided API key.
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate 8-12 relevant, comma-separated SEO keywords for a Pinterest pin with the title "${title}" for the board "${subtitle}". Focus on a mix of broad and long-tail keywords. Do not use hashtags. Do not use quotation marks. Return only the keywords.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        const text = response.text.trim().replace(/"/g, '');

        if (!text) {
            throw new Error('The AI model returned empty keywords.');
        }
        return text;

    } catch (error: any) {
        console.error('Error generating keywords with AI:', error);
        const errorDetails = getApiErrorDetails(error);
        const specificError = new Error(errorDetails.message);
        (specificError as any).type = errorDetails.type;
        (specificError as any).helpLink = errorDetails.helpLink;
        throw specificError;
    }
};

export const generateShortTitle = async (
    apiKey: string, // FIX: Added apiKey parameter
    model: string,
    longTitle: string
): Promise<string> => {
    try {
        // FIX: Instantiate GoogleGenAI with user-provided API key.
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Rewrite this Pinterest title to be more catchy and concise. It must be under 35 characters. Return only the new title, without quotation marks.\n\nOriginal Title: "${longTitle}"`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        const text = response.text.trim().replace(/"/g, '');

        if (!text) {
            throw new Error('The AI model returned an empty title.');
        }
        return text;

    } catch (error: any) {
        console.error('Error generating short title with AI:', error);
        const errorDetails = getApiErrorDetails(error);
        const specificError = new Error(errorDetails.message);
        (specificError as any).type = errorDetails.type;
        (specificError as any).helpLink = errorDetails.helpLink;
        throw specificError;
    }
};

export const DEFAULT_CONTENT_PROMPT = `You are a helpful assistant for creating Pinterest content for a food blog. Your task is to generate content based on a provided keyword. The output must be in JSON format and adhere to the specified schema.

{instructions}

Here are the details for each field:
- "title": A catchy and SEO-friendly recipe title between 50 and 90 characters (e.g., 'Easy Creamy Chicken Pasta Recipe for Busy Weeknights').
- "board": The name of the Pinterest board. If a list of boards is provided, you are strictly required to select one from that list and only that list. Do not invent a new board name.
- "imagePrompt": A detailed, descriptive prompt for an AI image generator to create a delicious-looking photo of the final dish. Describe the lighting, composition, and details.
- "description": An engaging Pinterest pin description (under 500 characters) that includes a call-to-action. Do not include hashtags.
- "altText": A concise and descriptive alt text for the image for accessibility purposes.
- "interests": A comma-separated list of 5-7 relevant Pinterest interests for targeting.
- "category": The recipe category. If a list of categories is provided, you are strictly required to select one from that list and only that list. Do not invent a new category name.`;


export const generatePinContentFromKeyword = async (
    apiKey: string,
    model: string,
    keyword: string,
    promptTemplate: string,
    boardOptions?: string[],
    categoryOptions?: string[]
): Promise<Omit<GeneratedContentRow, 'keyword'>> => {
    try {
        const ai = new GoogleGenAI({ apiKey });

        let instructions: string[] = [];
        if (boardOptions && boardOptions.length > 0) {
            instructions.push(`For the 'board' field, you are strictly required to choose exactly one value from this list: [${boardOptions.join(', ')}]. Do not return any other value.`);
        }
        if (categoryOptions && categoryOptions.length > 0) {
            instructions.push(`For the 'category' field, you are strictly required to choose exactly one value from this list: [${categoryOptions.join(', ')}]. Do not return any other value.`);
        }
        const instructionBlock = instructions.join('\n');

        const systemInstruction = promptTemplate.replace('{instructions}', instructionBlock);
        const userContent = `Keyword: "${keyword}"`;
        
        const schemaProperties: any = {
            title: { type: Type.STRING, description: "Catchy, SEO-friendly recipe title." },
            board: { type: Type.STRING, description: "Suitable Pinterest board name." },
            imagePrompt: { type: Type.STRING, description: "Detailed prompt for an AI image generator." },
            description: { type: Type.STRING, description: "Engaging Pinterest pin description with a call-to-action. Do not include hashtags." },
            altText: { type: Type.STRING, description: "Concise, descriptive alt text for the image." },
            interests: { type: Type.STRING, description: "Comma-separated list of relevant Pinterest interests." },
            category: { type: Type.STRING, description: "The most appropriate recipe category." },
        };

        if (boardOptions && boardOptions.length > 0) {
            schemaProperties.board.enum = boardOptions;
            schemaProperties.board.description = `The Pinterest board name. MUST be one of the following: ${boardOptions.join(', ')}.`;
        }

        if (categoryOptions && categoryOptions.length > 0) {
            schemaProperties.category.enum = categoryOptions;
            schemaProperties.category.description = `The recipe category. MUST be one of the following: ${categoryOptions.join(', ')}.`;
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: userContent,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: schemaProperties,
                    required: ['title', 'board', 'imagePrompt', 'description', 'altText', 'interests', 'category']
                }
            }
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('The AI model returned an invalid JSON object.');
        }

        return {
            title: parsedData.title || '',
            board: parsedData.board || '',
            imagePrompt: parsedData.imagePrompt || '',
            description: parsedData.description || '',
            altText: parsedData.altText || '',
            interests: parsedData.interests || '',
            category: parsedData.category || '',
        };
    } catch (error: any) {
        console.error(`Error generating content for keyword "${keyword}":`, error);
        // Re-use existing error handling logic
        const errorDetails = getApiErrorDetails(error);
        const specificError = new Error(`Failed on keyword "${keyword}": ${errorDetails.message}`);
        (specificError as any).type = errorDetails.type;
        (specificError as any).helpLink = errorDetails.helpLink;
        throw specificError;
    }
};

export const generatePlaceholderDescription = (
    title: string,
    subtitle: string
): string => {
    const templates = [
        `Discover everything you need to know about ${title}! This pin is perfect for your '${subtitle}' board. Find more tips and ideas on our website!`,
        `Looking for ${title}? You've come to the right place! Get inspired for your '${subtitle}' collection. Click through to learn more.`,
        `Save this pin! An essential guide to ${title}. A great addition to your '${subtitle}' board. Visit our site for the full story!`
    ];
    
    // Pick a template based on title length to add variety
    const index = title.length % templates.length;
    return templates[index];
};

export const generatePlaceholderKeywords = (
    title: string,
    subtitle: string
): string => {
    const titleWords = title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 2);
    const subtitleWords = subtitle.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 2);
    
    const combined = [...new Set([...titleWords, ...subtitleWords])];
    
    if (subtitle.toLowerCase().includes('recipe')) {
        combined.push('recipe', 'easy recipe', 'dinner ideas');
    }
    if (subtitle.toLowerCase().includes('diy')) {
        combined.push('diy project', 'crafts');
    }

    return combined.slice(0, 10).join(', ');
};


export const generatePlaceholderImage = async (
    prompt: string,
    aspectRatio: '3:4' | '9:16'
): Promise<string> => {
    const width = 600;
    const height = aspectRatio === '3:4' ? 800 : 1067;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to create canvas context.');
    }

    // Create a unique gradient based on the prompt
    const hash = prompt.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const c1 = `hsl(${hash % 360}, 70%, 85%)`;
    const c2 = `hsl(${(hash * 7) % 360}, 70%, 90%)`;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const words = prompt.toUpperCase().split(' ');
    let lines: string[] = [];
    let currentLine = words[0] || '';

    // Set an initial font size and fit text within the canvas width
    let fontSize = 100;
    ctx.font = `900 ${fontSize}px Poppins, sans-serif`;

    for (let i = 1; i < words.length; i++) {
        const testLine = `${currentLine} ${words[i]}`;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width * 0.85) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);

    // Recalculate font size based on the longest line to ensure it fits
    const longestLine = lines.reduce((a: string, b: string) => (a.length > b.length ? a : b), '');
    const textWidth = ctx.measureText(longestLine).width;
    if (textWidth > width * 0.85) {
        fontSize *= (width * 0.85) / textWidth;
    }
    
    // Final check for total text height
    const lineHeight = fontSize * 1.1;
    const totalTextHeight = lines.length * lineHeight;
    if (totalTextHeight > height * 0.8) {
        fontSize *= (height * 0.8) / totalTextHeight;
    }

    ctx.font = `900 ${fontSize}px Poppins, sans-serif`;
    
    const finalLineHeight = fontSize * 1.1;
    const startY = (height - (lines.length - 1) * finalLineHeight) / 2;
    
    // Draw the final text with a subtle shadow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + i * finalLineHeight);
    });

    return canvas.toDataURL('image/png');
};

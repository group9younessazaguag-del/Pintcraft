import { GoogleGenAI, Modality } from '@google/genai';

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

    return { type: 'generic', message, helpLink: helpLink || undefined };
};

export const generateImage = async (
    apiKey: string,
    model: string,
    prompt: string,
    aspectRatio: '3:4' | '9:16'
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });

        // Create a small, neutral base image for the AI to edit from.
        const width = 300;
        const height = aspectRatio === '3:4' ? 400 : 533;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create canvas context.');
        }
        ctx.fillStyle = '#cccccc'; // A neutral gray
        ctx.fillRect(0, 0, width, height);
        const baseImage = canvas.toDataURL('image/jpeg');
        const base64Data = baseImage.split(',')[1];

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: 'image/jpeg',
                        },
                    },
                    {
                        // Instruct the model to generate a new image based on the prompt, ignoring the placeholder.
                        text: `Generate a new, complete image based on the following description, ignoring the placeholder background image: "${prompt}". The final image should be in a ${aspectRatio === '3:4' ? 'portrait' : 'tall portrait'} orientation.`,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        
        const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
        if (textPart && textPart.text) {
             throw new Error(`AI model returned text instead of an image: ${textPart.text}`);
        }

        throw new Error('The AI model did not return a valid image. Please try again.');

    } catch (error: any) {
        console.error('Error generating image with AI:', error);
        const errorDetails = getApiErrorDetails(error);
        const specificError = new Error(errorDetails.message);
        (specificError as any).type = errorDetails.type;
        (specificError as any).helpLink = errorDetails.helpLink;
        throw specificError;
    }
};

export const generateDescription = async (
    apiKey: string,
    model: string,
    title: string,
    subtitle: string
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Write a short, engaging Pinterest description for a pin with the title "${title}" and board "${subtitle}". The description should be under 250 characters, use natural language, include 3-5 relevant hashtags, and end with a clear call to action.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        const text = response.text?.trim();

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
    apiKey: string,
    model: string,
    title: string,
    subtitle: string
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate 8-12 relevant, comma-separated SEO keywords for a Pinterest pin with the title "${title}" for the board "${subtitle}". Focus on a mix of broad and long-tail keywords. Do not use hashtags. Do not use quotation marks. Return only the keywords.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        const text = response.text?.trim().replace(/"/g, '');

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

export const generatePlaceholderDescription = (
    title: string,
    subtitle: string
): string => {
    const cleanedTitle = title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\s]/g, '').split(' ').filter(Boolean);
    const hashtags = cleanedTitle.slice(0, 3).map(word => `#${word}`).join(' ');

    const templates = [
        `Discover everything you need to know about ${title}! This pin is perfect for your '${subtitle}' board. Find more tips and ideas on our website! ${hashtags}`,
        `Looking for ${title}? You've come to the right place! Get inspired for your '${subtitle}' collection. Click through to learn more. ${hashtags}`,
        `Save this pin! An essential guide to ${title}. A great addition to your '${subtitle}' board. Visit our site for the full story! ${hashtags}`
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
    const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, '');
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
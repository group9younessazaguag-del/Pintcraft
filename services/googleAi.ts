

import { GoogleGenAI, Type } from '@google/genai';
import { GeneratedContentRow, PinterestAccount, ImageAspectRatio } from '../types';

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
    aspectRatio: ImageAspectRatio
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

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateImageWithMidjourney = async (
    apiKey: string, // APIFrame.pro API key
    prompt: string,
    aspectRatio: ImageAspectRatio
): Promise<string[]> => {
    const BASE_URL = 'https://api.apiframe.pro';

    try {
        // Step 1: Start the image generation job
        const imagineResponse = await fetch(`${BASE_URL}/imagine`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                aspect_ratio: aspectRatio,
                mode: 'fast'
            })
        });

        if (!imagineResponse.ok) {
            const errorText = await imagineResponse.text();
            console.error('APIFrame.pro imagine error response:', errorText);

            if (imagineResponse.status === 401) {
                throw new Error('Midjourney authentication failed. Please check your APIFrame.pro API key.');
            }

            let message;
            try {
                const errorData = JSON.parse(errorText);
                // Handle specific error structure for banned words etc.
                if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.msg) {
                    message = `Midjourney error: ${errorData.errors[0].msg}.`;
                } 
                // Handle another common error structure
                else if (errorData.detail?.msg || errorData.detail) {
                    message = errorData.detail?.msg || errorData.detail;
                }
                // Fallback for other JSON errors
                else {
                    message = `Midjourney request failed with status: ${imagineResponse.status}.`;
                }
            } catch (e) {
                // If it's not JSON (like an HTML error page), strip tags and show a generic message
                const strippedText = errorText.replace(/<[^>]*>?/gm, '').trim();
                message = `Midjourney imagine request failed. Server returned: ${strippedText.substring(0, 200)}`;
            }
            throw new Error(message);
        }

        const imagineData = await imagineResponse.json();
        const taskId = imagineData.task_id || imagineData.job_id;

        if (!taskId) {
            console.error('APIFrame.pro response missing task_id:', imagineData);
            throw new Error('APIFrame.pro did not return a task ID.');
        }

        // Step 2: Poll for the job result using the /fetch endpoint
        let jobStatus = '';
        let jobData;
        const maxAttempts = 30; // ~150 seconds timeout
        let attempt = 0;

        while (jobStatus !== 'finished' && attempt < maxAttempts) {
            await sleep(5000);
            attempt++;

            const jobResponse = await fetch(`${BASE_URL}/fetch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task_id: taskId })
            });

            if (!jobResponse.ok) {
                console.error(`Failed to check job status for ${taskId}, attempt ${attempt}, status: ${jobResponse.status}`);
                if (jobResponse.status === 401) {
                    throw new Error('Midjourney authentication failed while checking job status. Please check your APIFrame.pro API key.');
                }
                if (jobResponse.status === 404) {
                    throw new Error('Midjourney job not found. It might have expired or been deleted.');
                }
                if (attempt > 3) {
                    throw new Error(`Failed to get job status after multiple attempts. Status: ${jobResponse.status}`);
                }
                continue;
            }

            jobData = await jobResponse.json();
            jobStatus = jobData.status;

            if (jobStatus === 'failed') {
                throw new Error(jobData.error || 'Midjourney image generation failed. Please try a different prompt.');
            }
        }

        if (jobStatus !== 'finished') {
            throw new Error('Image generation timed out. The service might be busy. Please try again later.');
        }

        const imageUrls = jobData?.image_urls;

        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            console.error('Final job data from APIFrame.pro did not contain an image URL array:', JSON.stringify(jobData, null, 2));
            throw new Error('The AI model did not return any valid image URLs. See browser console for the full API response.');
        }

        // Step 3: Fetch all images and convert to base64 in parallel
        const base64Images = await Promise.all(
            imageUrls.map(async (url: string) => {
                try {
                    const imageResponse = await fetch(url);
                    if (!imageResponse.ok) {
                        console.error(`Failed to download generated image from ${url}`);
                        return null;
                    }
                    const imageBlob = await imageResponse.blob();
                    return await blobToBase64(imageBlob);
                } catch (e) {
                    console.error(`Error fetching image blob from ${url}:`, e);
                    return null;
                }
            })
        );
        
        const validImages = base64Images.filter(img => img !== null) as string[];

        if (validImages.length === 0) {
            throw new Error('Failed to download any of the generated images.');
        }

        return validImages;

    } catch (error: any) {
        console.error('Error generating image with Midjourney/APIFrame.pro:', error);
        const specificError = new Error(error.message || 'An unknown error occurred during Midjourney image generation.');
        (specificError as any).type = 'generic';
        throw specificError;
    }
};

export const generatePlaceholderImage = async (prompt: string, aspectRatio: ImageAspectRatio): Promise<string> => {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        const [width, height] = aspectRatio === '3:4' ? [750, 1000] : aspectRatio === '1:1' ? [1000, 1000] : [720, 1280];
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const bgColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.font = 'bold 48px sans-serif';
            const words = `Placeholder for: ${prompt}`.split(' ');
            let line = '';
            const y = height / 2 - ( (Math.ceil(words.length/5)) * 60 / 2);
            let lineCount = 0;
            for(let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + ' ';
              const metrics = ctx.measureText(testLine);
              const testWidth = metrics.width;
              if (testWidth > width - 80 && n > 0) {
                ctx.fillText(line, width/2, y + (lineCount * 60));
                line = words[n] + ' ';
                lineCount++;
              }
              else {
                line = testLine;
              }
            }
            ctx.fillText(line, width/2, y + (lineCount * 60));
        }
        resolve(canvas.toDataURL());
    });
};

export const generateDescription = async (apiKey: string, model: string, title: string, subtitle: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Create a compelling and SEO-friendly Pinterest description for a pin with the following details. The description must be between 100 and 500 characters. Do not include hashtags.
        Title: "${title}"
        Board/Subtitle: "${subtitle}"
        
        Description:`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });

        return response.text.trim();
    } catch (error: any) {
        throw getApiErrorDetails(error);
    }
};
export const generatePlaceholderDescription = (title: string, subtitle: string): string => {
    return `Discover our latest on "${title}"! Perfect for your "${subtitle}" board. Get inspired and find more ideas on our website. #YourBrand #${title.split(' ').join('')}`;
};


export const generateKeywords = async (apiKey: string, model: string, title: string, subtitle: string): Promise<string> => {
     try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate a comma-separated list of 5-10 highly relevant and popular keywords for a Pinterest pin with the title "${title}" and board "${subtitle}". Include a mix of broad and long-tail keywords. Do not include hashtags.

        Keywords:`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });

        return response.text.trim().replace(/, /g, ',').replace(/\n/g, '');
    } catch (error: any) {
        throw getApiErrorDetails(error);
    }
};

export const generatePlaceholderKeywords = (title: string, subtitle: string): string => {
    const keywords = [
        ...title.toLowerCase().split(' '), 
        ...subtitle.toLowerCase().split(' ')
    ].filter((v, i, a) => a.indexOf(v) === i && v.length > 3);
    return keywords.join(',');
};

export const generateShortTitle = async (apiKey: string, model: string, title: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Shorten the following title to be more concise and impactful for a Pinterest pin, aiming for around 35 characters or less, while retaining the core meaning.
        Original Title: "${title}"
        
        Shortened Title:`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });
        
        return response.text.trim().replace(/"/g, ''); // Remove quotes from the response
    } catch (error: any) {
        throw getApiErrorDetails(error);
    }
};

export const generateSafeImagePrompt = async (apiKey: string, model: string, title: string): Promise<string> => {
    try {
        if (!apiKey) {
            // Fallback if no Google AI key is available
            return `A high-quality, visually appealing image related to: ${title}`;
        }
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `The following title is for a Pinterest pin: "${title}".
        An AI image generator rejected a prompt based on this title due to a content filter (e.g., "banned words").
        Your task is to create a new, safe, and descriptive image prompt that captures the essence of the title but is highly unlikely to trigger content filters.
        The prompt should be suitable for models like Midjourney or Stable Diffusion. Focus on visual details, scenery, and objects. Avoid potentially ambiguous or sensitive terms.
        
        New Safe Prompt:`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });

        return response.text.trim().replace(/"/g, '');
    } catch (error: any) {
        // If this itself fails, we can't do much. Re-throw the error.
        throw getApiErrorDetails(error);
    }
};

export const DEFAULT_CONTENT_PROMPT = `As an expert Pinterest content strategist, your task is to generate a complete content plan for a single pin based on a provided keyword. Your output must be a JSON object with the following structure and adhere to these rules:
{
  "title": "A compelling, SEO-friendly title, 100 characters max.",
  "board": "A relevant Pinterest board name selected from the provided list: {board_options}",
  "imagePrompt": "A highly detailed, visually rich prompt for an AI image generator to create a stunning, eye-catching pin image. Describe the scene, lighting, colors, and style.",
  "description": "An engaging, SEO-optimized description (100-500 characters).",
  "altText": "A descriptive alt text for accessibility and SEO (max 500 characters).",
  "interests": "A comma-separated list of 3-5 related Pinterest interests or niches.",
  "category": "The single most relevant recipe category, chosen ONLY from this list: {category_options}"
}
- IMPORTANT: You MUST select one board from the provided list for the "board" field.
- IMPORTANT: You MUST select one category from the provided list for the "category" field. If no categories are provided or none are relevant, use an empty string "".
- Do not include any explanatory text, markdown formatting, or anything outside of the single JSON object.
- The entire output must be a single, valid JSON object.
`;

export const generatePinContentFromKeyword = async (
    apiKey: string, 
    model: string, 
    keyword: string,
    systemPromptTemplate: string,
    boardOptions: string[],
    categoryOptions: string[],
): Promise<GeneratedContentRow> => {
    try {
        const ai = new GoogleGenAI({ apiKey });

        let systemInstruction = systemPromptTemplate
            .replace('{board_options}', boardOptions.join(', '))
            .replace('{category_options}', categoryOptions.join(', '));
        
        if (boardOptions.length === 0) {
            systemInstruction = systemInstruction.replace('selected from the provided list: ,', 'that you create based on the keyword');
        }
         if (categoryOptions.length === 0) {
            systemInstruction = systemInstruction.replace('chosen ONLY from this list: ,', 'that you create based on the keyword');
        }

        const prompt = `Generate the content plan for the keyword: "${keyword}"`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        board: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        description: { type: Type.STRING },
                        altText: { type: Type.STRING },
                        interests: { type: Type.STRING },
                        category: { type: Type.STRING },
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedObject = JSON.parse(jsonText);

        // Ensure all fields are strings, even if the model messes up
        const finalObject: GeneratedContentRow = {
            keyword: keyword,
            title: String(parsedObject.title || ''),
            board: String(parsedObject.board || ''),
            imagePrompt: String(parsedObject.imagePrompt || ''),
            description: String(parsedObject.description || ''),
            altText: String(parsedObject.altText || ''),
            interests: String(parsedObject.interests || ''),
            category: String(parsedObject.category || ''),
        };

        return finalObject;

    } catch (error: any) {
        console.error("Error in generatePinContentFromKeyword:", error);
        throw getApiErrorDetails(error);
    }
};

export type PinIdea = {
  title: string;
  description: string;
  hashtags: string;
};

export const generatePinIdeas = async (
  apiKey: string,
  model: string,
  accountName: string,
): Promise<PinIdea[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate 3 creative and engaging Pinterest pin ideas for an account named "${accountName}". For each idea, provide a catchy title, a short description, and a few relevant hashtags.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              hashtags: { type: Type.STRING },
            },
          },
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    throw getApiErrorDetails(error);
  }
};

export type AISuggestions = {
  bestTime: string;
  nextPinType: string;
  seasonalTheme: string;
};


export const getAiSuggestions = async (
  apiKey: string,
  model: string,
  account: PinterestAccount,
): Promise<AISuggestions> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Based on the following data for the Pinterest account "${account.name}", provide strategic suggestions.
    - Performance Score (1-5): ${account.performance}
    - Last Posted: ${account.lastPostDate || 'N/A'}
    - Next Post Due: ${account.nextPostDate || 'N/A'}
    - Notes: ${account.notes || 'None'}
    
    Please provide:
    1. The best time of day to post next.
    2. A suggestion for the *type* of pin to create next (e.g., Idea Pin, Video Pin, standard image).
    3. A relevant seasonal or trending theme idea for the next pin.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestTime: { type: Type.STRING, description: "The suggested best time to post." },
            nextPinType: { type: Type.STRING, description: "The suggested type of pin to create." },
            seasonalTheme: { type: Type.STRING, description: "A relevant seasonal or trending theme." },
          },
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    throw getApiErrorDetails(error);
  }
};

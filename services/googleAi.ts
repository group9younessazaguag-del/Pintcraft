import { GeneratedContentRow, PinterestAccount, ImageAspectRatio, FacebookPost, FacebookPageStrategy } from '../types';

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
            const userMessage = "You've exceeded the free usage limit for your API key. To continue, please check your provider's billing status or wait for your quota to reset.";
            return { type: 'quota', message: userMessage, helpLink: helpLink || undefined };
        }
        if (isServiceUnavailable) {
            return { type: 'service', message: 'Image generation service is temporarily unavailable.', helpLink: helpLink || undefined };
        }
    }
    
    if (message.includes('An internal error has occurred')) {
        message = 'The AI model experienced an internal error. This is often temporary. Please try again in a few moments.';
    }


    return { type: 'generic', message, helpLink: helpLink || undefined };
};

async function generateWithOpenRouter(apiKey: string, model: string, systemPrompt: string, userPrompt: string, isJson: boolean = false) {
    const headers: HeadersInit = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": `https://main--pinterest-pin-generator-gpt.pro.ai-studio.google.com/`, 
        "X-Title": `Pin4You`,
    };

    const body: any = {
        model: model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
    };

    if (isJson) {
        body.response_format = { "type": "json_object" };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error?.message || JSON.stringify(errorData);
        throw new Error(`OpenRouter API error: ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
        throw new Error("OpenRouter returned an empty response.");
    }
    
    return content;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const generateImage = async (
    apiKey: string,
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
            sync_mode: true,
            seed: Math.floor(Math.random() * 1000000) // Add random seed for variety
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
    apiKey: string,
    prompt: string,
    aspectRatio: ImageAspectRatio
): Promise<string[]> => {
    const BASE_URL = 'https://api.apiframe.pro';

    const randomSeed = Math.floor(Math.random() * 4294967295); // Midjourney seed range
    const fullPrompt = `${prompt} --seed ${randomSeed}`;

    const imagineResponse = await fetch(`${BASE_URL}/imagine`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: fullPrompt,
            aspect_ratio: aspectRatio,
            mode: 'fast'
        })
    });

    if (!imagineResponse.ok) {
        const errorText = await imagineResponse.text();
        console.error('APIFrame.pro imagine error response:', errorText);

        const specificError = new Error();
        (specificError as any).type = 'generic';

        if (imagineResponse.status === 401) {
            specificError.message = 'Midjourney authentication failed. Please check your APIFrame.pro API key.';
            (specificError as any).type = 'auth';
            throw specificError;
        }

        try {
            const errorData = JSON.parse(errorText);
            if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.msg) {
                specificError.message = `Midjourney error: ${errorData.errors[0].msg}.`;
            } else if (errorData.detail?.msg || errorData.detail) {
                specificError.message = errorData.detail?.msg || errorData.detail;
            } else {
                specificError.message = `Midjourney request failed with status: ${imagineResponse.status}.`;
            }
        } catch (e) {
            const strippedText = errorText.replace(/<[^>]*>?/gm, '').trim();
            specificError.message = `Midjourney imagine request failed. Server returned: ${strippedText.substring(0, 200)}`;
        }
        throw specificError;
    }

    const imagineData = await imagineResponse.json();
    const taskId = imagineData.task_id || imagineData.job_id;

    if (!taskId) {
        console.error('APIFrame.pro response missing task_id:', imagineData);
        throw new Error('APIFrame.pro did not return a task ID.');
    }

    let jobStatus = '';
    let jobData;
    const maxAttempts = 30; 
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
};

// FIX: Implement missing functions and types
export const generatePlaceholderImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const [width, height] = aspectRatio === '1:1' ? [1024, 1024] :
                             aspectRatio === '3:4' ? [768, 1024] :
                             aspectRatio === '4:5' ? [1024, 1280] :
                             [1024, 1792]; // 9:16 default
    const text = prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt;
    return `https://placehold.co/${width}x${height}/EFEFEF/333333/png?text=${encodeURIComponent(text)}`;
};

export const generateDescription = async (apiKey: string, model: string, title: string): Promise<string> => {
    const systemPrompt = "You are a Pinterest marketing expert. Create a compelling, SEO-friendly pin description for the given title. The description should be between 100 and 200 characters. It must be engaging and encourage clicks. Do not include hashtags. Output only the description text.";
    return await generateWithOpenRouter(apiKey, model, systemPrompt, title);
};

export const generatePlaceholderDescription = (title: string): string => {
    return `This is a placeholder description for "${title}". It's a great topic! You can replace this text with a more detailed and engaging description to attract more viewers on Pinterest. Make sure to include relevant keywords.`;
};

export const generateKeywords = async (apiKey: string, model: string, title: string): Promise<string> => {
    const systemPrompt = "You are a Pinterest SEO expert. Based on the pin title, generate a comma-separated list of 5-10 relevant, high-traffic keywords. Do not include hashtags. Output only the comma-separated list of keywords.";
    return await generateWithOpenRouter(apiKey, model, systemPrompt, title);
};

export const generatePlaceholderKeywords = (title: string): string => {
    return title.toLowerCase().split(' ').join(', ') + ', placeholder, example';
};

export const generateShortTitle = async (apiKey: string, model: string, title: string): Promise<string> => {
    const systemPrompt = "You are a copywriter. Rewrite the following title to be shorter and more engaging, ideally under 35 characters, but no more than 40. Output only the new title.";
    return await generateWithOpenRouter(apiKey, model, systemPrompt, title);
};

export const DEFAULT_CONTENT_PROMPT = "You are a content strategist for a blog. Your task is to generate a table of Pinterest pin ideas based on a given keyword. The table should be in JSON format. Do not output any text before or after the JSON. The JSON should be an array of objects, where each object has the following keys: 'title' (string, a viral, click-worthy pin title), 'description' (string, a short, enticing pin description of about 150-250 characters), 'board' (string, a relevant Pinterest board name from the provided list), 'image_prompt' (string, a detailed, visually rich prompt for an AI image generator), 'alt_text' (string, a descriptive alt text for accessibility), 'interests' (array of strings, 3-5 related Pinterest interests/keywords), and 'category' (string, the most relevant category from the provided list).";

export const generateSafeImagePrompt = async (apiKey: string, model: string, originalPrompt: string): Promise<string> => {
    const systemPrompt = "You are an AI prompt engineer. The user's prompt was flagged for containing banned words. Rewrite the prompt to be safe for work and compliant with image generation policies, while preserving the original intent as much as possible. Focus on descriptive, visual terms. Output only the new prompt.";
    return await generateWithOpenRouter(apiKey, model, systemPrompt, originalPrompt);
};

export const generateImageWithMidApiAi = async (
    apiKey: string,
    prompt: string,
    aspectRatio: ImageAspectRatio,
    onProgressUpdate?: (message: string) => void
): Promise<string[]> => {
    const BASE_URL = 'https://api.midapi.ai/v1';

    if (onProgressUpdate) onProgressUpdate('Submitting imagine task...');

    const imagineResponse = await fetch(`${BASE_URL}/imagine`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            ar: aspectRatio.replace(':', ' '),
        })
    });

    if (!imagineResponse.ok) {
        const errorData = await imagineResponse.json();
        throw new Error(errorData.message || 'midapi.ai imagine request failed.');
    }

    const imagineData = await imagineResponse.json();
    const taskId = imagineData.task_id;

    if (!taskId) {
        throw new Error('midapi.ai did not return a task ID.');
    }

    let jobStatus = '';
    let jobData;
    const maxAttempts = 30;
    let attempt = 0;

    if (onProgressUpdate) onProgressUpdate('Waiting for image generation to start...');

    while ((jobStatus !== 'finished' && jobStatus !== 'failed') && attempt < maxAttempts) {
        await sleep(5000);
        attempt++;

        const jobResponse = await fetch(`${BASE_URL}/task/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        if (!jobResponse.ok) {
            console.error(`midapi.ai: Failed to check job status for ${taskId}, attempt ${attempt}, status: ${jobResponse.status}`);
            continue;
        }

        jobData = await jobResponse.json();
        jobStatus = jobData.status;

        if (onProgressUpdate && jobData.progress) {
            onProgressUpdate(`Progress: ${jobData.progress}%`);
        }
    }

    if (jobStatus === 'failed') {
        throw new Error(jobData?.error || 'midapi.ai image generation failed.');
    }

    if (jobStatus !== 'finished') {
        throw new Error('midapi.ai: Image generation timed out.');
    }

    const imageUrls = jobData?.image_urls;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        throw new Error('The AI model did not return any valid image URLs from midapi.ai.');
    }

    const base64Images = await Promise.all(
        imageUrls.map(async (url: string) => {
            try {
                const imageResponse = await fetch(url);
                if (!imageResponse.ok) return null;
                const imageBlob = await imageResponse.blob();
                return await blobToBase64(imageBlob);
            } catch (e) {
                return null;
            }
        })
    );

    const validImages = base64Images.filter(img => img !== null) as string[];

    if (validImages.length === 0) {
        throw new Error('Failed to download any of the generated images from midapi.ai.');
    }

    return validImages;
};

export const generateImageWithImagineApi = async (
    apiKey: string,
    prompt: string,
    aspectRatio: ImageAspectRatio,
    onProgressUpdate?: (message: string) => void
): Promise<string[]> => {
    const BASE_URL = 'https://api.imagineapi.dev/v1';

    if (onProgressUpdate) onProgressUpdate('Submitting imagine task...');

    const imagineResponse = await fetch(`${BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            aspect_ratio: aspectRatio,
            num_images: 4
        })
    });

    if (!imagineResponse.ok) {
        const errorData = await imagineResponse.json();
        throw new Error(errorData.message || 'ImagineAPI imagine request failed.');
    }

    const imagineData = await imagineResponse.json();
    const taskId = imagineData.id;

    if (!taskId) {
        throw new Error('ImagineAPI did not return a task ID.');
    }

    let jobStatus = '';
    let jobData;
    const maxAttempts = 30;
    let attempt = 0;

    if (onProgressUpdate) onProgressUpdate('Waiting for image...');

    while ((jobStatus !== 'succeeded' && jobStatus !== 'failed') && attempt < maxAttempts) {
        await sleep(3000);
        attempt++;

        const jobResponse = await fetch(`${BASE_URL}/images/generations/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        if (!jobResponse.ok) {
            console.error(`ImagineAPI: Failed to check job status for ${taskId}, attempt ${attempt}, status: ${jobResponse.status}`);
            continue;
        }

        jobData = await jobResponse.json();
        jobStatus = jobData.status;
    }

    if (jobStatus === 'failed') {
        throw new Error(jobData?.error?.message || 'ImagineAPI image generation failed.');
    }

    if (jobStatus !== 'succeeded') {
        throw new Error('ImagineAPI: Image generation timed out.');
    }

    const imageUrls = jobData?.data?.map((img: any) => img.url);

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        throw new Error('The AI model did not return any valid image URLs from ImagineAPI.');
    }

    const base64Images = await Promise.all(
        imageUrls.map(async (url: string) => {
            try {
                const imageResponse = await fetch(url);
                if (!imageResponse.ok) return null;
                const imageBlob = await imageResponse.blob();
                return await blobToBase64(imageBlob);
            } catch (e) {
                return null;
            }
        })
    );

    const validImages = base64Images.filter(img => img !== null) as string[];

    if (validImages.length === 0) {
        throw new Error('Failed to download any of the generated images from ImagineAPI.');
    }

    return validImages;
};

export const generateImageWithUseApi = async (
    apiKey: string,
    prompt: string,
    aspectRatio: ImageAspectRatio,
    onProgressUpdate?: (message: string) => void
): Promise<string[]> => {
    const BASE_URL = 'https://api.useapi.net/v1';

    if (onProgressUpdate) onProgressUpdate('Submitting task...');

    const imagineResponse = await fetch(`${BASE_URL}/jobs/imagine`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            aspect_ratio: aspectRatio,
            mode: "fast",
        })
    });

    if (!imagineResponse.ok) {
        const errorData = await imagineResponse.json();
        throw new Error(errorData.detail || 'useapi.net imagine request failed.');
    }

    const imagineData = await imagineResponse.json();
    const jobId = imagineData.jobid;

    if (!jobId) {
        throw new Error('useapi.net did not return a job ID.');
    }

    let jobData;
    const maxAttempts = 30;
    let attempt = 0;

    while (attempt < maxAttempts) {
        await sleep(5000);
        attempt++;

        const jobResponse = await fetch(`${BASE_URL}/jobs/${jobId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        if (!jobResponse.ok) {
            console.error(`useapi.net: Failed to check job status for ${jobId}, attempt ${attempt}, status: ${jobResponse.status}`);
            continue;
        }

        jobData = await jobResponse.json();

        if (onProgressUpdate) {
            onProgressUpdate(jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1) + ` (${jobData.progress || 0}%)`);
        }

        if (jobData.status === 'completed') {
            break;
        }
        if (jobData.status === 'failed' || jobData.status === 'cancelled') {
            throw new Error(jobData.error?.message || `useapi.net job ${jobData.status}.`);
        }
    }

    if (jobData?.status !== 'completed') {
        throw new Error('useapi.net: Image generation timed out.');
    }

    const imageUrls = jobData.attachments?.map((att: any) => att.url);

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        throw new Error('The AI model did not return any valid image URLs from useapi.net.');
    }

    const base64Images = await Promise.all(
        imageUrls.map(async (url: string) => {
            try {
                const imageResponse = await fetch(url);
                if (!imageResponse.ok) return null;
                const imageBlob = await imageResponse.blob();
                return await blobToBase64(imageBlob);
            } catch (e) {
                return null;
            }
        })
    );

    const validImages = base64Images.filter(img => img !== null) as string[];

    if (validImages.length === 0) {
        throw new Error('Failed to download any of the generated images from useapi.net.');
    }

    return validImages;
};

export const generatePinContentFromKeyword = async (
    apiKey: string,
    model: string,
    keyword: string,
    boardOptions?: string,
    categoryOptions?: string
): Promise<Omit<GeneratedContentRow, 'keyword'>> => {
    let userPrompt = `Generate content for the keyword: "${keyword}".`;
    if (boardOptions) {
        userPrompt += `\n\nChoose a board from this list: ${boardOptions}.`;
    }
    if (categoryOptions) {
        userPrompt += `\n\nChoose a category from this list: ${categoryOptions}.`;
    }

    const jsonString = await generateWithOpenRouter(apiKey, model, DEFAULT_CONTENT_PROMPT, userPrompt, true);
    
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');

    try {
        const parsed = JSON.parse(cleanedJsonString);
        const content = Array.isArray(parsed) ? parsed[0] : parsed;

        if (!content.title || !content.description) {
            throw new Error("Invalid JSON structure returned from AI.");
        }

        return {
            title: content.title,
            description: content.description,
            board: content.board,
            image_prompt: content.image_prompt,
            alt_text: content.alt_text,
            interests: content.interests,
            category: content.category,
        };
    } catch (e) {
        console.error("Failed to parse JSON from AI:", cleanedJsonString);
        throw new Error("Failed to get valid content from AI. Please try again.");
    }
};

export const rewriteKeyword = async (apiKey: string, model: string, keyword: string): Promise<string> => {
    const systemPrompt = "You are an SEO expert. The following keyword failed to generate content, likely because it was too specific or ambiguous. Rewrite it to be a more general, popular, or clearer search term while keeping the core topic. Output only the rewritten keyword.";
    const userPrompt = `Original keyword: "${keyword}"`;
    return await generateWithOpenRouter(apiKey, model, systemPrompt, userPrompt);
};

export interface PinIdea {
    title: string;
    description: string;
    hashtags: string;
}

export interface AISuggestions {
    bestTime: string;
    nextPinType: string;
    seasonalTheme: string;
}

export const generatePinIdeas = async (apiKey: string, model: string, accountName: string): Promise<PinIdea[]> => {
    const systemPrompt = `You are a Pinterest content strategist. For a Pinterest account named "${accountName}", generate 3 diverse and viral pin ideas. For each idea, provide a 'title', a short 'description', and a 'hashtags' string (comma-separated). Return the response as a JSON array of objects. Do not output any text before or after the JSON.`;
    const userPrompt = `Generate 3 pin ideas for ${accountName}.`;
    const jsonString = await generateWithOpenRouter(apiKey, model, systemPrompt, userPrompt, true);
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    try {
        return JSON.parse(cleanedJsonString);
    } catch (e) {
        console.error("Failed to parse JSON from AI for pin ideas:", cleanedJsonString);
        throw new Error("Failed to get valid pin ideas from AI.");
    }
};

export const getAiSuggestions = async (apiKey: string, model: string, account: PinterestAccount): Promise<AISuggestions> => {
    const systemPrompt = "You are a Pinterest account growth expert. Analyze the provided account data and give strategic suggestions. Return a JSON object with three keys: 'bestTime' (string, suggest the best day and time to post next), 'nextPinType' (string, suggest a type of pin to create next, e.g., 'Video Pin', 'Idea Pin', 'Infographic'), and 'seasonalTheme' (string, suggest a relevant upcoming seasonal or holiday theme). Do not output any text before or after the JSON.";
    const userPrompt = `Account Name: ${account.name}\nLast Post: ${account.lastPostDate}\nNotes: ${account.notes}\nPerformance (1-5): ${account.performance}`;
    const jsonString = await generateWithOpenRouter(apiKey, model, systemPrompt, userPrompt, true);
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    try {
        return JSON.parse(cleanedJsonString);
    } catch (e) {
        console.error("Failed to parse JSON from AI for suggestions:", cleanedJsonString);
        throw new Error("Failed to get valid suggestions from AI.");
    }
};

export const generateFacebookPost = async (apiKey: string, model: string, topic: string): Promise<FacebookPost> => {
    const systemPrompt = "You are a social media marketing expert specializing in Facebook. Create content for a viral Facebook post based on the user's topic. Return a JSON object with four keys: 'postText' (string, engaging post copy, 2-3 paragraphs, use emojis), 'hashtags' (array of 3-5 relevant strings), 'imagePrompt' (string, a detailed, visually stunning prompt for an AI image generator, suitable for a 4:5 aspect ratio), and 'imageText' (string, a short, catchy text overlay for the image, max 5 words). Do not output any text before or after the JSON.";
    const userPrompt = `Topic: ${topic}`;
    const jsonString = await generateWithOpenRouter(apiKey, model, systemPrompt, userPrompt, true);
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    try {
        return JSON.parse(cleanedJsonString);
    } catch (e) {
        console.error("Failed to parse JSON from AI for Facebook post:", cleanedJsonString);
        throw new Error("Failed to get valid content from AI.");
    }
};

export const generateFacebookPageStrategy = async (apiKey: string, model: string, niche: string, country: string): Promise<FacebookPageStrategy> => {
    const systemPrompt = `You are an expert Facebook page growth strategist. Based on the user's niche and target country, generate a complete strategy for a new Facebook page. Return a single JSON object with the following structure, and do not output any text before or after the JSON:
    {
      "page_name_ideas": ["string", "string", "string"],
      "page_bio_90chars": "string",
      "categories": ["string", "string"],
      "logo_brief": { "style": "string", "motifs": ["string"], "notes": "string" },
      "cover_brief": { "concept": "string", "layout_notes": "string" },
      "public_group": { "name": "string", "description": "string", "first_pinned_post": "string" },
      "page_likes_ad": { "image_prompt": "string", "primary_text": "string", "headline": "string", "placements": ["string"] },
      "first_20_post_themes": ["string", "string", ...]
    }`;
    const userPrompt = `Niche: ${niche}\nPrimary Country: ${country}`;
    const jsonString = await generateWithOpenRouter(apiKey, model, systemPrompt, userPrompt, true);
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    try {
        return JSON.parse(cleanedJsonString);
    } catch (e) {
        console.error("Failed to parse JSON from AI for Facebook page strategy:", cleanedJsonString);
        throw new Error("Failed to get a valid strategy from AI.");
    }
};

export const generateViralQuotes = async (apiKey: string, model: string, category: string, length: 'short' | 'long'): Promise<string[]> => {
    const lengthDesc = length === 'short' ? 'short, impactful, and shareable (under 15 words)' : 'longer, more profound and thought-provoking (20-40 words)';
    const systemPrompt = `You are a viral content creator. Generate 5 quotes for the category "${category}". The quotes should be ${lengthDesc}. Return a JSON array of strings. Do not output any text before or after the JSON.`;
    const userPrompt = `Generate quotes for ${category}.`;
    const jsonString = await generateWithOpenRouter(apiKey, model, systemPrompt, userPrompt, true);
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    try {
        return JSON.parse(cleanedJsonString);
    } catch (e) {
        console.error("Failed to parse JSON from AI for quotes:", cleanedJsonString);
        throw new Error("Failed to get valid quotes from AI.");
    }
};

export const enhanceViralQuote = async (apiKey: string, model: string, quote: string, length: 'short' | 'long'): Promise<string[]> => {
    const lengthDesc = length === 'short' ? 'shorter, more impactful, and shareable (under 15 words)' : 'longer, more profound and thought-provoking (20-40 words)';
    const systemPrompt = `You are a master copywriter. Rewrite and enhance the following user-provided quote to make it more viral. Provide 3 different versions. The new versions should be ${lengthDesc}. Return a JSON array of strings. Do not output any text before or after the JSON.`;
    const userPrompt = `Quote to enhance: "${quote}"`;
    const jsonString = await generateWithOpenRouter(apiKey, model, systemPrompt, userPrompt, true);
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    try {
        return JSON.parse(cleanedJsonString);
    } catch (e) {
        console.error("Failed to parse JSON from AI for enhanced quote:", cleanedJsonString);
        throw new Error("Failed to get valid enhanced quotes from AI.");
    }
};

export const generateSoraVideoPrompt = async (apiKey: string, model: string, quote: string): Promise<string> => {
    const systemPrompt = "You are a creative director specializing in AI video generation for platforms like OpenAI Sora. Based on the provided quote, write a single, detailed, and cinematic video prompt. The prompt should describe a visually stunning scene that evokes the emotion of the quote. Focus on camera movement, lighting, environment, and mood. The prompt should be a single paragraph. Output only the prompt text.";
    const userPrompt = `Generate a video prompt for the quote: "${quote}"`;
    return await generateWithOpenRouter(apiKey, model, systemPrompt, userPrompt);
};

export const rewriteDescriptionWithOpenRouter = async (
    apiKey: string,
    model: string,
    title: string,
    description: string,
    categoryOptions?: string
): Promise<{ title: string; description: string; category: string; keywords: string }> => {
    let systemPrompt = `You are a Pinterest SEO expert for bloggers. Rewrite the given title and description to be more engaging and SEO-friendly. Also, determine the most relevant blog post category from the provided list, and generate a comma-separated list of 5-7 relevant keywords.
    Return a JSON object with four keys: 'title', 'description', 'category', and 'keywords'. Do not output any text before or after the JSON.`;
    if (categoryOptions) {
        systemPrompt += `\n\nAvailable categories: ${categoryOptions}`;
    }
    const userPrompt = `Title: "${title}"\nDescription: "${description}"`;
    const jsonString = await generateWithOpenRouter(apiKey, model, systemPrompt, userPrompt, true);
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    try {
        return JSON.parse(cleanedJsonString);
    } catch (e) {
        console.error("Failed to parse JSON from AI for rewrite:", cleanedJsonString);
        throw new Error("Failed to get valid rewritten content from AI.");
    }
};

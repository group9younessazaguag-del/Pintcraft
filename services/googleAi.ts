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
            const userMessage = "You exceeded your current quota, please check your plan and billing details.";
            return { type: 'quota', message: userMessage, helpLink: helpLink || 'https://ai.google.dev/gemini-api/docs/rate-limits' };
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

/**
 * Wraps an API call with a retry mechanism to handle transient server errors.
 * @param apiCall The function that makes the API call.
 * @returns The result of the API call.
 */
async function generateWithRetry(apiCall: () => Promise<any>) {
    const MAX_RETRIES = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await apiCall();
        } catch (error: any) {
            lastError = error;
            const errorString = JSON.stringify(error).toLowerCase();
            
            // These are signs of transient issues that might be resolved by retrying.
            const isRetryable = 
                errorString.includes('500') ||       // Internal Server Error
                errorString.includes('503') ||       // Service Unavailable
                errorString.includes('xhr error') || // Network issue
                errorString.includes('rpc failed') || // another form of network issue
                errorString.includes('unavailable'); // Service unavailable status

            if (isRetryable && attempt < MAX_RETRIES) {
                console.warn(`Attempt ${attempt}/${MAX_RETRIES} failed with a transient error. Retrying...`, error);
                await new Promise(resolve => setTimeout(resolve, 1500 * attempt)); // Increasing delay
            } else {
                // Not a retryable error, or it's the last attempt. Re-throw the error.
                throw error;
            }
        }
    }
    // This code path should be unreachable, but for type safety, we throw the last known error.
    throw lastError;
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
};

export const generateImageWithMidApiAi = async (
    apiKey: string, // midapi.ai API key
    prompt: string,
    aspectRatio: ImageAspectRatio,
    onProgressUpdate?: (message: string) => void
): Promise<string[]> => {
    
    const generationTask = async (): Promise<string[]> => {
        const BASE_URL = 'https://api.midapi.ai/api/v1/mj';
        
        let arValue = '1:1';
        if (aspectRatio === '9:16') arValue = '9:16';
        if (aspectRatio === '3:4') arValue = '3:4';
        
        const generateResponse = await fetch(`${BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                taskType: 'mj_txt2img',
                prompt: prompt,
                speed: 'relaxed',
                aspectRatio: arValue,
                version: '7'
            })
        });

        if (!generateResponse.ok) {
            const errorText = await generateResponse.text();
            console.error('midapi.ai generate error response:', errorText);

            if (generateResponse.status === 401) {
                throw new Error('midapi.ai authentication failed. Please check your midapi.ai API key.');
            }
            
            let message;
            try {
                const errorData = JSON.parse(errorText);
                message = `midapi.ai error: ${errorData.msg || JSON.stringify(errorData)}`;
            } catch (e) {
                const strippedText = errorText.replace(/<[^>]*>?/gm, '').trim();
                message = `midapi.ai request failed. Server returned: ${strippedText.substring(0, 200)}`;
            }
            throw new Error(message);
        }

        const generateData = await generateResponse.json();
        
        if (generateData.code !== 200) {
            throw new Error(`midapi.ai failed to start task: ${generateData.msg || 'Unknown error'}`);
        }

        const taskId = generateData.data?.taskId;
        if (!taskId) {
            throw new Error('midapi.ai did not return a task ID.');
        }

        if (onProgressUpdate) {
            onProgressUpdate(`Task submitted. Waiting for result (this can take over a minute)...`);
        }

        const maxPollAttempts = 60;
        let pollAttempt = 0;
        let taskData;

        while (pollAttempt < maxPollAttempts) {
            await sleep(5000);
            pollAttempt++;
            
            const statusResponse = await fetch(`${BASE_URL}/record-info?taskId=${taskId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            
            if (!statusResponse.ok) {
                const errorText = await statusResponse.text();
                console.warn(`midapi.ai status check failed for ${taskId}, attempt ${pollAttempt}:`, errorText);
                if (pollAttempt > 3) { throw new Error(`Failed to get job status after multiple attempts. Status: ${statusResponse.status}`); }
                continue;
            }

            const result = await statusResponse.json();
            if (result.code !== 200) {
                console.warn(`midapi.ai status check for ${taskId} returned API error: ${result.msg}`);
                if (pollAttempt > 3) { throw new Error(`API returned an error while checking status: ${result.msg}`); }
                continue;
            }

            taskData = result.data;
            const successFlag = taskData.successFlag;
            
            if (successFlag === 1) break;
            if (successFlag === 2 || successFlag === 3) {
                throw new Error(`midapi.ai task failed: ${taskData.errorMessage || 'Generation failed without a specific error message.'}`);
            }
        }

        if (taskData?.successFlag !== 1) {
            throw new Error('Image generation timed out. The service might be busy. Please try again later.');
        }

        const resultUrlsInfo = taskData.resultInfoJson?.resultUrls;
        if (!resultUrlsInfo || !Array.isArray(resultUrlsInfo) || resultUrlsInfo.length === 0) {
            console.error('Final job data from midapi.ai did not contain result URLs:', JSON.stringify(taskData, null, 2));
            throw new Error('The AI model did not return any valid image URLs.');
        }

        const imageUrls = resultUrlsInfo.map((item: any) => item.resultUrl).filter(Boolean);

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

    const maxRetries = 25;
    for (let retryAttempt = 1; retryAttempt <= maxRetries; retryAttempt++) {
        try {
            return await generationTask();
        } catch (error: any) {
            console.warn(`Attempt ${retryAttempt} failed for midapi.ai:`, error.message);
            const isRetryableError = error.message && error.message.includes('internal error, please try again later');

            if (isRetryableError && retryAttempt < maxRetries) {
                const baseDelay = 15000;
                const maxDelay = 90000;
                const backoff = Math.min(baseDelay * Math.pow(2, retryAttempt - 1), maxDelay);
                const jitter = backoff * 0.2 * (Math.random() - 0.5);
                const delay = backoff + jitter;
                
                const retryMessage = `Service error on attempt ${retryAttempt}/${maxRetries}. Retrying in ~${Math.round(delay / 1000)}s...`;
                console.log(retryMessage);
                if (onProgressUpdate) {
                    onProgressUpdate(retryMessage);
                }
                await sleep(delay);
            } else {
                const specificError = new Error(error.message || 'An unknown error occurred during midapi.ai image generation.');
                (specificError as any).type = 'generic';
                throw specificError;
            }
        }
    }

    throw new Error(`Failed to generate image with midapi.ai after ${maxRetries} attempts.`);
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
        const prompt = `Act as a Pinterest SEO expert. Write a Pinterest pin description of 300–500 characters, optimized for search and engagement for a pin with this title: "${title}" and for the board: "${subtitle}".

- Include 5–8 relevant keywords naturally.
- Use active, inspiring language.
- Place the main keyword in the first 50 characters.
- Add a call to action at the end (e.g., "Click to learn more").
- Keep it clear, conversational, and do not stuff keywords.
- You can add 1-2 relevant emojis, but do not use hashtags.

Description:`;
        
        const response = await generateWithRetry(() => ai.models.generateContent({
            model: model,
            contents: prompt
        }));

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
        
        const response = await generateWithRetry(() => ai.models.generateContent({
            model: model,
            contents: prompt
        }));

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
        
        const response = await generateWithRetry(() => ai.models.generateContent({
            model: model,
            contents: prompt
        }));
        
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
        
        const response = await generateWithRetry(() => ai.models.generateContent({
            model: model,
            contents: prompt
        }));

        return response.text.trim().replace(/"/g, '');
    } catch (error: any) {
        // If this itself fails, we can't do much. Re-throw the error.
        throw getApiErrorDetails(error);
    }
};

export const DEFAULT_CONTENT_PROMPT = `You are an expert Pinterest SEO marketer who generates content plans. For the given keyword, you must generate a complete content plan according to these strict rules.

**RULES FOR EACH COMPONENT:**
1.  **Title:**
    *   Create ONE catchy, SEO-optimized title.
    *   Length MUST be between 60 and 100 characters.
    *   It must be unique, clickable, and include the keyword naturally.
    *   **CRITICAL: ABSOLUTELY NO EMOJIS IN THE TITLE.**

2.  **Description:**
    *   Write ONE engaging, keyword-rich description.
    *   Length MUST be between 250 and 400 characters.
    *   It must encourage clicks and saves. Avoid fluff and hashtags.

3.  **Board:** Suggest ONE relevant Pinterest board name.

4.  **Image Prompt:** Write ONE detailed, creative prompt for an AI image generator (e.g., Midjourney). Describe the style, lighting, and mood.

5.  **Alt Text:** Write ONE short, descriptive text for accessibility and SEO. Length MUST be between 100 and 120 characters.

6.  **Interests:** Suggest an array of 5 to 8 related Pinterest interests or niches as strings.

7.  **Category:** Suggest the single most appropriate Pinterest category.

**CRITICAL OUTPUT INSTRUCTIONS:**
*   Your entire response MUST be ONLY a single, valid JSON object.
*   Do NOT include any text, commentary, or markdown like \`\`\`json before or after the JSON object.
*   Strictly follow the JSON schema provided in the request.`;


export const generatePinContentFromKeyword = async (
    apiKey: string, 
    model: string, 
    keyword: string,
    boardOptions?: string,
    categoryOptions?: string
): Promise<GeneratedContentRow> => {
    try {
        const ai = new GoogleGenAI({ apiKey });

        let systemInstruction = DEFAULT_CONTENT_PROMPT;

        if (boardOptions && boardOptions.trim()) {
            systemInstruction += `\n\n**Constraint for 'board':** You MUST choose one board from this list: [${boardOptions}]. Do not invent a new one.`;
        }
        if (categoryOptions && categoryOptions.trim()) {
            systemInstruction += `\n\n**Constraint for 'category':** You MUST choose one category from this list: [${categoryOptions}]. Do not invent a new one.`;
        }

        const prompt = `Generate the content plan for the keyword: "${keyword}"`;
        
        const response = await generateWithRetry(() => ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A catchy, SEO-optimized pin title between 60-100 characters. No emojis." },
                        description: { type: Type.STRING, description: "An engaging pin description between 250-400 characters." },
                        board: { type: Type.STRING, description: "A relevant Pinterest board name." },
                        image_prompt: { type: Type.STRING, description: "A detailed AI image generator prompt." },
                        alt_text: { type: Type.STRING, description: "A descriptive alt text between 100-120 characters." },
                        interests: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            description: "An array of 5-8 related Pinterest interests."
                        },
                        category: { type: Type.STRING, description: "The best Pinterest category for the pin." },
                    },
                    required: ["title", "description", "board", "image_prompt", "alt_text", "interests", "category"]
                }
            }
        }));
        
        const jsonText = response.text.trim();
        let parsedObject;

        try {
            // First, try to parse directly, which is most efficient.
            parsedObject = JSON.parse(jsonText);
        } catch (e) {
            // If direct parsing fails, attempt recovery.
            console.warn("Direct JSON parsing failed, attempting recovery.", jsonText);
            
            let recoveredJsonString = null;

            // Recovery Attempt 1: Extract from markdown block
            const markdownMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (markdownMatch && markdownMatch[1]) {
                recoveredJsonString = markdownMatch[1];
            } else {
                // Recovery Attempt 2: Find first '{' and last '}'
                const startIndex = jsonText.indexOf('{');
                const endIndex = jsonText.lastIndexOf('}');
                if (startIndex !== -1 && endIndex > startIndex) {
                    recoveredJsonString = jsonText.substring(startIndex, endIndex + 1);
                }
            }

            if (recoveredJsonString) {
                try {
                    parsedObject = JSON.parse(recoveredJsonString);
                } catch (finalError) {
                    console.error("Failed to parse recovered JSON string.", recoveredJsonString);
                    const err = new Error("The AI returned a malformed JSON response that could not be repaired.");
                    (err as any).originalText = jsonText;
                    throw err;
                }
            } else {
                // All recovery methods failed
                console.error("The AI response does not appear to contain a JSON object.", jsonText);
                const err = new Error("The AI response does not appear to contain a JSON object.");
                (err as any).originalText = jsonText;
                throw err;
            }
        }

        // Ensure all fields are correctly typed
        const finalObject: GeneratedContentRow = {
            keyword: keyword,
            title: String(parsedObject.title || ''),
            board: String(parsedObject.board || ''),
            image_prompt: String(parsedObject.image_prompt || ''),
            description: String(parsedObject.description || ''),
            alt_text: String(parsedObject.alt_text || ''),
            interests: Array.isArray(parsedObject.interests) ? parsedObject.interests.map(String) : [],
            category: String(parsedObject.category || ''),
        };

        return finalObject;

    } catch (error: any) {
        console.error("Error in generatePinContentFromKeyword:", error);
        if (error.type) { 
            throw error;
        }
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
    const prompt = `You are an expert Pinterest SEO marketer. Generate 3 unique, creative, and engaging Pinterest pin ideas for an account named "${accountName}".

**RULES FOR EACH IDEA:**
1.  **Title:**
    *   Must be 50-100 characters.
    *   Must be catchy, keyword-rich, and clickable.
    *   Capitalize naturally.
    *   **CRITICAL: ABSOLUTELY NO EMOJIS in the title.**
2.  **Variety:** Each of the 3 titles must be unique and should not start with the same phrase.
3.  **Description:** A short, engaging description for the pin.
4.  **Hashtags:** A few relevant hashtags, separated by spaces.

**CRITICAL OUTPUT INSTRUCTIONS:**
*   Your entire response MUST be ONLY a single, valid JSON array of objects.
*   Do NOT include any extra text, commentary, or markdown.
*   Strictly follow the JSON schema provided.`;
    
    const response = await generateWithRetry(() => ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A catchy, SEO-optimized pin title. No emojis." },
              description: { type: Type.STRING, description: "A short, engaging description for the pin." },
              hashtags: { type: Type.STRING, description: "A few relevant hashtags, separated by spaces." },
            },
            required: ['title', 'description', 'hashtags']
          },
        },
      },
    }));

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

    const response = await generateWithRetry(() => ai.models.generateContent({
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
    }));

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    throw getApiErrorDetails(error);
  }
};
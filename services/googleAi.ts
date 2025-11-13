import { GoogleGenAI, Type } from '@google/genai';
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
            const userMessage = "You've exceeded the free usage limit for your Google AI API key. To continue, please enable billing on your Google Cloud project or wait for your quota to reset.";
            return { type: 'quota', message: userMessage, helpLink: helpLink || 'https://ai.google.dev/gemini-api/docs/billing' };
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

export const generateImageWithImagineApi = async (
    apiKey: string, // ImagineAPI key
    prompt: string,
    aspectRatio: ImageAspectRatio,
    onProgressUpdate?: (message: string) => void
): Promise<string[]> => {
    
    const generationTask = async (): Promise<string[]> => {
        const BASE_URL = 'https://api.imagineapi.dev/v1'; // Made up URL

        // Map local aspect ratio to API's expected value
        let apiAspectRatio = '1:1';
        if (aspectRatio === '9:16') apiAspectRatio = '9:16';
        if (aspectRatio === '3:4') apiAspectRatio = '3:4';

        // 1. Start generation
        if (onProgressUpdate) onProgressUpdate('Submitting image generation task...');
        const generateResponse = await fetch(`${BASE_URL}/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                aspect_ratio: apiAspectRatio,
            })
        });

        if (!generateResponse.ok) {
            const errorText = await generateResponse.text();
            console.error('ImagineAPI generate error response:', errorText);
            if (generateResponse.status === 401) {
                throw new Error('ImagineAPI authentication failed. Please check your API key.');
            }
            let message;
            try {
                const errorData = JSON.parse(errorText);
                message = `ImagineAPI error: ${errorData.message || JSON.stringify(errorData)}`;
            } catch (e) {
                message = `ImagineAPI request failed. Server returned: ${errorText.substring(0, 200)}`;
            }
            throw new Error(message);
        }

        const generateData = await generateResponse.json();
        const taskId = generateData.id;

        if (!taskId) {
            throw new Error('ImagineAPI did not return a task ID.');
        }
        
        if (onProgressUpdate) onProgressUpdate('Task submitted. Waiting for result (~30s)...');

        // 2. Poll for result
        const maxPollAttempts = 20; // ~100 seconds
        let pollAttempt = 0;
        let taskData;

        while (pollAttempt < maxPollAttempts) {
            await sleep(5000);
            pollAttempt++;
            
            const statusResponse = await fetch(`${BASE_URL}/generations/${taskId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            if (!statusResponse.ok) {
                console.warn(`ImagineAPI status check failed for ${taskId}, attempt ${pollAttempt}`);
                if (pollAttempt > 3) { throw new Error(`Failed to get job status after multiple attempts. Status: ${statusResponse.status}`); }
                continue;
            }

            taskData = await statusResponse.json();
            const status = taskData.status;
            
            if (status === 'completed') break;
            if (status === 'failed') {
                throw new Error(`ImagineAPI task failed: ${taskData.error || 'Generation failed.'}`);
            }
        }

        if (taskData?.status !== 'completed') {
            throw new Error('Image generation with ImagineAPI timed out.');
        }

        const imageUrls = taskData.image_urls;
        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            console.error('Final job data from ImagineAPI did not contain image URLs:', JSON.stringify(taskData, null, 2));
            throw new Error('ImagineAPI did not return any valid image URLs.');
        }

        // 3. Fetch images and convert to base64
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
            throw new Error('Failed to download any of the generated images from ImagineAPI.');
        }
        return validImages;
    };
    
    // Using a retry wrapper for robustness, similar to MidApiAi
    const maxRetries = 3;
    for (let retryAttempt = 1; retryAttempt <= maxRetries; retryAttempt++) {
        try {
            return await generationTask();
        } catch (error: any) {
            console.warn(`Attempt ${retryAttempt} failed for ImagineAPI:`, error.message);
            const isRetryableError = error.message && (error.message.includes('503') || error.message.includes('Service Unavailable'));

            if (isRetryableError && retryAttempt < maxRetries) {
                const delay = 5000 * retryAttempt;
                const retryMessage = `Service unavailable on attempt ${retryAttempt}. Retrying in ${delay / 1000}s...`;
                console.log(retryMessage);
                if (onProgressUpdate) onProgressUpdate(retryMessage);
                await sleep(delay);
            } else {
                const specificError = new Error(error.message || 'An unknown error occurred during ImagineAPI generation.');
                (specificError as any).type = 'generic';
                throw specificError;
            }
        }
    }

    throw new Error(`Failed to generate image with ImagineAPI after ${maxRetries} attempts.`);
};

export const generateImageWithUseApi = async (
    apiKey: string, // useapi.net API key
    prompt: string,
    aspectRatio: ImageAspectRatio,
    onProgressUpdate?: (message: string) => void
): Promise<string[]> => {
    
    const generationTask = async (): Promise<string[]> => {
        const BASE_URL = 'https://api.useapi.net/v3/midjourney/jobs';

        if (onProgressUpdate) onProgressUpdate('Submitting job to useapi.net...');
        
        const fullPrompt = `${prompt} --ar ${aspectRatio}`;

        const imagineResponse = await fetch(`${BASE_URL}/imagine`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: fullPrompt,
                stream: false,
            })
        });

        if (!imagineResponse.ok) {
            const errorText = await imagineResponse.text();
            console.error('useapi.net imagine error response:', errorText);
            if (imagineResponse.status === 401) {
                throw new Error('useapi.net authentication failed. Please check your API key.');
            }
            let message;
            try {
                const errorData = JSON.parse(errorText);
                message = `useapi.net error: ${errorData.error || JSON.stringify(errorData)}`;
            } catch (e) {
                message = `useapi.net request failed. Server returned: ${errorText.substring(0, 200)}`;
            }
            throw new Error(message);
        }

        const imagineData = await imagineResponse.json();
        const jobId = imagineData.jobid;

        if (!jobId) {
            throw new Error('useapi.net did not return a job ID.');
        }

        if (onProgressUpdate) onProgressUpdate(`Job submitted. Waiting for result (this can take over a minute)...`);

        const maxPollAttempts = 60;
        let pollAttempt = 0;
        let jobData;

        while (pollAttempt < maxPollAttempts) {
            await sleep(5000);
            pollAttempt++;
            
            const statusResponse = await fetch(`${BASE_URL}/${jobId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            
            if (!statusResponse.ok) {
                console.warn(`useapi.net status check failed for ${jobId}, attempt ${pollAttempt}`);
                if (pollAttempt > 3) { throw new Error(`Failed to get job status after multiple attempts. Status: ${statusResponse.status}`); }
                continue;
            }

            jobData = await statusResponse.json();
            const status = jobData.status;
            
            if (status === 'completed') break;
            if (status === 'failed' || status === 'cancelled') {
                throw new Error(`useapi.net task failed: ${jobData.error || 'Generation failed without a specific error message.'}`);
            }
        }

        if (jobData?.status !== 'completed') {
            throw new Error('Image generation timed out with useapi.net. The service might be busy.');
        }

        const imageUx = jobData.response?.imageUx;
        if (!imageUx || !Array.isArray(imageUx) || imageUx.length === 0) {
            console.error('Final job data from useapi.net did not contain imageUx array:', JSON.stringify(jobData, null, 2));
            throw new Error('The AI model did not return any valid image URLs from useapi.net.');
        }

        const imageUrls = imageUx.map((img: any) => img.url).filter(Boolean);

        const base64Images = await Promise.all(
            imageUrls.map(async (url: string) => {
                try {
                    // Correctly use the official useapi.net proxy as per the provided documentation.
                    const proxyUrl = `https://api.useapi.net/v1/proxy/cdn-midjourney/?cdnUrl=${encodeURIComponent(url)}`;
                    
                    const imageResponse = await fetch(proxyUrl, {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`
                        }
                    });

                    if (!imageResponse.ok) {
                        console.error(`Failed to download generated image from ${url} via useapi.net proxy. Status: ${imageResponse.status}`);
                        return null;
                    }
                    const imageBlob = await imageResponse.blob();
                    return await blobToBase64(imageBlob);
                } catch (e) {
                    console.error(`Error fetching image blob from ${url} via useapi.net proxy:`, e);
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
    
    // Retry wrapper for robustness
    const maxRetries = 3;
    for (let retryAttempt = 1; retryAttempt <= maxRetries; retryAttempt++) {
        try {
            return await generationTask();
        } catch (error: any) {
            console.warn(`Attempt ${retryAttempt} failed for useapi.net:`, error.message);
            const isRetryableError = error.message && (error.message.includes('503') || error.message.includes('Service Unavailable') || error.message.includes('internal error'));

            if (isRetryableError && retryAttempt < maxRetries) {
                const delay = 5000 * retryAttempt;
                const retryMessage = `Service error on attempt ${retryAttempt}. Retrying in ${delay / 1000}s...`;
                console.log(retryMessage);
                if (onProgressUpdate) onProgressUpdate(retryMessage);
                await sleep(delay);
            } else {
                const specificError = new Error(error.message || 'An unknown error occurred during useapi.net generation.');
                (specificError as any).type = 'generic';
                throw specificError;
            }
        }
    }
    throw new Error(`Failed to generate image with useapi.net after ${maxRetries} attempts.`);
};


export const generatePlaceholderImage = async (prompt: string, aspectRatio: ImageAspectRatio): Promise<string> => {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        const [width, height] = aspectRatio === '3:4' ? [750, 1000] : aspectRatio === '1:1' ? [1000, 1000] : aspectRatio === '4:5' ? [1080, 1350] : [720, 1280];
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

export const generateDescription = async (apiKey: string, model: string, title: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Act as a Pinterest SEO expert. Write a Pinterest pin description up to 200 characters, optimized for search and engagement for a pin with this title: "${title}".

- Include 5–8 relevant keywords naturally.
- Use active, inspiring language.
- Place the main keyword in the first 50 characters.
- Add a call to action at the end (e.g., "Click to learn more").
- Keep it clear, conversational, and do not stuff keywords.
- Do not use hashtags.

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
export const generatePlaceholderDescription = (title: string): string => {
    return `Discover our latest on "${title}"! Get inspired and find more ideas on our website. #YourBrand #${title.split(' ').join('')}`;
};


export const generateKeywords = async (apiKey: string, model: string, title: string): Promise<string> => {
     try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate a comma-separated list of 5-10 highly relevant and popular keywords for a Pinterest pin with the title "${title}". Include a mix of broad and long-tail keywords. Do not include hashtags.

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

export const generatePlaceholderKeywords = (title: string): string => {
    const keywords = [
        ...title.toLowerCase().split(' '), 
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
    *   Length MUST be a maximum of 56 characters.
    *   It must be unique, clickable, and include the keyword naturally.
    *   **CRITICAL: ABSOLUTELY NO EMOJIS IN THE TITLE.**

2.  **Description:**
    *   Write ONE engaging, keyword-rich description.
    *   Length MUST be a maximum of 200 characters.
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
                        title: { type: Type.STRING, description: "A catchy, SEO-optimized pin title with a maximum of 56 characters. No emojis." },
                        description: { type: Type.STRING, description: "An engaging pin description with a maximum of 200 characters." },
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

/**
 * Attempts to repair a malformed JSON string commonly produced by LLMs.
 * It removes comments and trailing commas.
 * @param jsonString The potentially malformed JSON string.
 * @returns A cleaned JSON string.
 */
const repairJson = (jsonString: string): string => {
    if (!jsonString) return '';
    let repaired = jsonString.trim();

    // Remove JS-style comments
    repaired = repaired.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    
    // Remove trailing commas from objects
    repaired = repaired.replace(/,(\s*})/g, '$1');
    
    // Remove trailing commas from arrays
    repaired = repaired.replace(/,(\s*])/g, '$1');

    return repaired;
};

export const generatePinContentFromKeywordWithOpenRouter = async (
    apiKey: string,
    model: string,
    keyword: string,
    boardOptions?: string,
    categoryOptions?: string
): Promise<GeneratedContentRow> => {
    try {
        let systemPrompt = DEFAULT_CONTENT_PROMPT; // Reusing the same detailed prompt

        if (boardOptions && boardOptions.trim()) {
            systemPrompt += `\n\n**Constraint for 'board':** You MUST choose one board from this list: [${boardOptions}]. Do not invent a new one.`;
        }
        if (categoryOptions && categoryOptions.trim()) {
            systemPrompt += `\n\n**Constraint for 'category':** You MUST choose one category from this list: [${categoryOptions}]. Do not invent a new one.`;
        }

        const userPrompt = `Generate the content plan for the keyword: "${keyword}"`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": `https://main--pinterest-pin-generator-gpt.pro.ai-studio.google.com/`, 
                "X-Title": `Pin4You`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API error:', errorData);
            const message = errorData.error?.message || `Request failed with status: ${response.status}`;
            const specificError = new Error(message);
            (specificError as any).type = response.status === 429 ? 'quota' : 'generic';
            throw specificError;
        }

        const result = await response.json();
        const jsonText = result.choices[0]?.message?.content;
        
        if (!jsonText) {
            throw new Error("OpenRouter response did not contain valid content.");
        }
        
        // 1. Extract potential JSON string from response
        let potentialJson = jsonText.trim();
        const markdownMatch = potentialJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        
        if (markdownMatch && markdownMatch[1]) {
            potentialJson = markdownMatch[1].trim();
        } else {
            const startIndex = potentialJson.indexOf('{');
            const endIndex = potentialJson.lastIndexOf('}');
            if (startIndex !== -1 && endIndex > startIndex) {
                potentialJson = potentialJson.substring(startIndex, endIndex + 1);
            }
        }
        
        // If we couldn't find a JSON object, throw an error.
        if (!potentialJson.startsWith('{') || !potentialJson.endsWith('}')) {
             const err = new Error("The AI response does not appear to contain a JSON object.");
             (err as any).originalText = jsonText;
             throw err;
        }
        
        // 2. Try to parse it; if it fails, try to repair it and parse again.
        let parsedObject;
        try {
            parsedObject = JSON.parse(potentialJson);
        } catch (e) {
            console.warn("Direct JSON parsing failed, attempting to repair.", { error: e, json: potentialJson });
            try {
                const repairedJson = repairJson(potentialJson);
                parsedObject = JSON.parse(repairedJson);
                console.log("Successfully parsed repaired JSON.");
            } catch (repairError) {
                 console.error("Failed to parse even after repairing JSON.", { error: repairError, original: potentialJson });
                 const err = new Error("The AI returned a malformed JSON response that could not be repaired.");
                 (err as any).originalText = jsonText;
                 throw err;
            }
        }

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
        console.error("Error in generatePinContentFromKeywordWithOpenRouter:", error);
        if (error.type) { 
            throw error;
        }
        const newError = new Error(error.message || 'An unknown error occurred with OpenRouter.');
        (newError as any).type = 'generic';
        throw newError;
    }
};

export const rewriteKeyword = async (apiKey: string, model: string, keyword: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Rewrite the following keyword to be more descriptive and clear, while keeping the core topic the same. The original keyword might have caused an error with an AI model.
        Original Keyword: "${keyword}"
        
        Rewritten Keyword:`;
        
        const response = await generateWithRetry(() => ai.models.generateContent({
            model: model,
            contents: prompt
        }));
        
        const rewritten = response.text.trim().replace(/"/g, '');
        return rewritten || keyword;
    } catch (error: any) {
        console.error("Failed to rewrite keyword:", error);
        return keyword;
    }
};

export const rewriteKeywordWithOpenRouter = async (apiKey: string, model: string, keyword: string): Promise<string> => {
    try {
        const prompt = `Rewrite the following keyword to be more descriptive and clear, while keeping the core topic the same. The original keyword might have caused an error with an AI model.
        Original Keyword: "${keyword}"
        
        Rewritten Keyword:`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": `https://main--pinterest-pin-generator-gpt.pro.ai-studio.google.com/`, 
                "X-Title": `Pin4You`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "user", content: prompt },
                ],
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter rewrite API error:', errorData);
            return keyword; // return original on error
        }

        const result = await response.json();
        const rewrittenKeyword = result.choices[0]?.message?.content;

        return rewrittenKeyword ? rewrittenKeyword.trim().replace(/"/g, '') : keyword;
    } catch (error) {
        console.error("Error rewriting keyword with OpenRouter:", error);
        return keyword;
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

export const generateFacebookPost = async (
    apiKey: string,
    model: string,
    topic: string,
): Promise<FacebookPost> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a social media marketing expert specializing in creating viral Facebook content for a broad audience, including Gen Z, millennials, and boomers. Your primary goal is to generate massive engagement (comments, shares, likes).

For the given topic, generate a complete, engaging Facebook post by choosing ONE of the following viral content strategies:
1.  **Relatable Content:** Connects with everyday experiences or timely events.
2.  **Funny Content:** Uses humor to entertain and be shareable.
3.  **Authentic Content:** Feels genuine and personal.
4.  **Nostalgic Content:** Evokes memories and emotions, which performs very well with Facebook's core audience.
5.  **Interactive Content:** Asks questions to get people talking and boost comments, which Facebook's algorithm loves.

Topic: "${topic}"

**RULES FOR EACH COMPONENT:**
1.  **postText:** Based on your chosen viral strategy, write an engaging and slightly informal post text, between 2-4 sentences. It should be captivating and designed to spark conversation and shares. Use emojis where appropriate.
2.  **imagePrompt:** Write a detailed, highly realistic, and creative prompt for an AI image generator like Midjourney. The goal is to create a photorealistic image that looks like a professional photograph. The image must be in a portrait aspect ratio (4:5, 1080x1350 pixels). The prompt should specify:
    - Subject: A clear description of the main subject.
    - Setting: A detailed background or environment.
    - Style: Explicitly state "photorealistic, professional photography".
    - Lighting: Describe the lighting, e.g., "soft natural light", "golden hour", "studio lighting".
    - Details: Add specifics about colors, textures, and mood.
    - Camera/Lens: Suggest a camera and lens type, e.g., "shot on a DSLR with a 50mm f/1.8 lens".
3.  **hashtags:** Provide an array of 3 to 5 relevant and popular hashtags as strings.
4.  **imageText:** Based on your chosen viral strategy, write a short, impactful text overlay for the image, between 5 and 15 words. This should be a headline, a powerful quote, or an **interactive question** to drive comments. It must grab attention. ALL CAPS is preferred for maximum impact.

**CRITICAL OUTPUT INSTRUCTIONS:**
*   Your entire response MUST be ONLY a single, valid JSON object.
*   Do NOT include any text, commentary, or markdown like \`\`\`json before or after the JSON object.
*   Strictly follow the JSON schema provided.`;

        const response = await generateWithRetry(() => ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        postText: { type: Type.STRING, description: "Engaging post text, 2-4 sentences, with emojis." },
                        imagePrompt: { type: Type.STRING, description: "A detailed AI image generator prompt for a portrait 4:5 image." },
                        hashtags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of 3-5 relevant hashtags."
                        },
                        imageText: { type: Type.STRING, description: "A short, impactful text overlay (5-15 words, preferably ALL CAPS) for the image." }
                    },
                    required: ["postText", "imagePrompt", "hashtags", "imageText"]
                }
            }
        }));

        const jsonText = response.text.trim();
        let parsedObject;

        try {
            parsedObject = JSON.parse(jsonText);
        } catch (e) {
            console.warn("Direct JSON parsing failed, attempting recovery.", jsonText);
            
            let recoveredJsonString = null;
            const markdownMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (markdownMatch && markdownMatch[1]) {
                recoveredJsonString = markdownMatch[1];
            } else {
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
                console.error("The AI response does not appear to contain a JSON object.", jsonText);
                const err = new Error("The AI response does not appear to contain a JSON object.");
                (err as any).originalText = jsonText;
                throw err;
            }
        }

        const finalObject: FacebookPost = {
            postText: String(parsedObject.postText || ''),
            imagePrompt: String(parsedObject.imagePrompt || ''),
            hashtags: Array.isArray(parsedObject.hashtags) ? parsedObject.hashtags.map(String) : [],
            imageText: String(parsedObject.imageText || ''),
        };

        return finalObject;

    } catch (error: any) {
        console.error("Error in generateFacebookPost:", error);
        if (error.type) {
            throw error;
        }
        throw getApiErrorDetails(error);
    }
};

export const generateFacebookPostWithOpenRouter = async (
    apiKey: string,
    model: string,
    topic: string,
): Promise<FacebookPost> => {
    try {
        const systemPrompt = `You are a social media marketing expert specializing in creating viral Facebook content for a broad audience, including Gen Z, millennials, and boomers. Your primary goal is to generate massive engagement (comments, shares, likes).

For the given topic, you must generate a complete, engaging Facebook post by choosing ONE of the following viral content strategies:
1.  **Relatable Content:** Connects with everyday experiences or timely events.
2.  **Funny Content:** Uses humor to entertain and be shareable.
3.  **Authentic Content:** Feels genuine and personal.
4.  **Nostalgic Content:** Evokes memories and emotions, which performs very well with Facebook's core audience.
5.  **Interactive Content:** Asks questions to get people talking and boost comments, which Facebook's algorithm loves.

**RULES FOR EACH COMPONENT:**
1.  **postText:** Based on your chosen viral strategy, write an engaging and slightly informal post text, between 2-4 sentences. It should be captivating and designed to spark conversation and shares. Use emojis where appropriate.
2.  **imagePrompt:** Write a detailed, highly realistic, and creative prompt for an AI image generator like Midjourney. The goal is to create a photorealistic image that looks like a professional photograph. The image must be in a portrait aspect ratio (4:5, 1080x1350 pixels). The prompt should specify:
    - Subject: A clear description of the main subject.
    - Setting: A detailed background or environment.
    - Style: Explicitly state "photorealistic, professional photography".
    - Lighting: Describe the lighting, e.g., "soft natural light", "golden hour", "studio lighting".
    - Details: Add specifics about colors, textures, and mood.
    - Camera/Lens: Suggest a camera and lens type, e.g., "shot on a DSLR with a 50mm f/1.8 lens".
3.  **hashtags:** Provide an array of 3 to 5 relevant and popular hashtags as strings.
4.  **imageText:** Based on your chosen viral strategy, write a short, impactful text overlay for the image, between 5 and 15 words. This should be a headline, a powerful quote, or an **interactive question** to drive comments. It must grab attention. ALL CAPS is preferred for maximum impact.

**CRITICAL OUTPUT INSTRUCTIONS:**
*   Your entire response MUST be ONLY a single, valid JSON object.
*   Do NOT include any text, commentary, or markdown.
*   The JSON object should have keys: "postText", "imagePrompt", "hashtags", and "imageText".`;

        const userPrompt = `Generate the Facebook post for the topic: "${topic}"`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": `https://main--pinterest-pin-generator-gpt.pro.ai-studio.google.com/`,
                "X-Title": `Pin4You`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API error:', errorData);
            const message = errorData.error?.message || `Request failed with status: ${response.status}`;
            const specificError = new Error(message);
            (specificError as any).type = response.status === 429 ? 'quota' : 'generic';
            throw specificError;
        }

        const result = await response.json();
        const jsonText = result.choices[0]?.message?.content;

        if (!jsonText) {
            throw new Error("OpenRouter response did not contain valid content.");
        }
        
        let potentialJson = jsonText.trim();
        const markdownMatch = potentialJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        
        if (markdownMatch && markdownMatch[1]) {
            potentialJson = markdownMatch[1].trim();
        } else {
            const startIndex = potentialJson.indexOf('{');
            const endIndex = potentialJson.lastIndexOf('}');
            if (startIndex !== -1 && endIndex > startIndex) {
                potentialJson = potentialJson.substring(startIndex, endIndex + 1);
            }
        }
        
        if (!potentialJson.startsWith('{') || !potentialJson.endsWith('}')) {
             const err = new Error("The AI response does not appear to contain a JSON object.");
             (err as any).originalText = jsonText;
             throw err;
        }

        let parsedObject;
        try {
            parsedObject = JSON.parse(potentialJson);
        } catch (e) {
            console.warn("Direct JSON parsing failed, attempting to repair.", { error: e, json: potentialJson });
            try {
                const repairedJson = repairJson(potentialJson);
                parsedObject = JSON.parse(repairedJson);
            } catch (repairError) {
                 console.error("Failed to parse even after repairing JSON.", { error: repairError, original: potentialJson });
                 const err = new Error("The AI returned a malformed JSON response that could not be repaired.");
                 (err as any).originalText = jsonText;
                 throw err;
            }
        }

        const finalObject: FacebookPost = {
            postText: String(parsedObject.postText || ''),
            imagePrompt: String(parsedObject.imagePrompt || ''),
            hashtags: Array.isArray(parsedObject.hashtags) ? parsedObject.hashtags.map(String) : [],
            imageText: String(parsedObject.imageText || ''),
        };

        return finalObject;

    } catch (error: any) {
        console.error("Error in generateFacebookPostWithOpenRouter:", error);
        if (error.type) {
            throw error;
        }
        const newError = new Error(error.message || 'An unknown error occurred with OpenRouter.');
        (newError as any).type = 'generic';
        throw newError;
    }
};


export const generateFacebookPageStrategy = async (
    apiKey: string,
    model: string,
    niche: string,
    country: string,
): Promise<FacebookPageStrategy> => {
    try {
        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `You are “Facebook Faceless Page Builder,” tasked to create a money-ready Facebook page in the niche "${niche}" for "${country}" audiences (Tier 1 focus). Follow these non-negotiable rules:

STRATEGY (from my SOP):
- Content types: image+text tiles and text-only posts; image size 1080x1350 pixels. Long, emotional captions (150–200 chars). No clickbait, no engagement bait, no copyrighted media. Link goes in the FIRST COMMENT, not in the caption.
- Posting times (EST): 08:30, 11:30, 20:30 (priority). Initial volume: 6–8 posts/day; scale to 10–14/day.
- Growth: invite engagers to like the page, share to relevant groups daily, build a public group and crosspost, run Page Likes ads at $5–$10/day and scale +20% weekly if CPL ≤ $0.05.
- Compliance: obey Partner/Content Monetization policies; avoid repetitive/low-effort content, politics/misinformation, NSFW.

OUTPUT (JSON ONLY):
Your entire response MUST be ONLY a single, valid JSON object that strictly follows the provided schema. Do NOT include any text, commentary, or markdown like \`\`\`json before or after the JSON object.`;

        const response = await generateWithRetry(() => ai.models.generateContent({
            model: model,
            contents: `Generate the full page strategy now.`,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        page_name_ideas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 clear, brandable, keyword-friendly page name ideas." },
                        page_bio_90chars: { type: Type.STRING, description: "A benefit-led page bio, between 80-90 characters." },
                        categories: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3 suitable Facebook page categories." },
                        logo_brief: {
                            type: Type.OBJECT,
                            properties: {
                                style: { type: Type.STRING },
                                motifs: { type: Type.ARRAY, items: { type: Type.STRING } },
                                notes: { type: Type.STRING }
                            },
                            required: ["style", "motifs", "notes"]
                        },
                        cover_brief: {
                            type: Type.OBJECT,
                            properties: {
                                concept: { type: Type.STRING },
                                layout_notes: { type: Type.STRING }
                            },
                            required: ["concept", "layout_notes"]
                        },
                        public_group: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                first_pinned_post: { type: Type.STRING }
                            },
                            required: ["name", "description", "first_pinned_post"]
                        },
                        page_likes_ad: {
                            type: Type.OBJECT,
                            properties: {
                                image_prompt: { type: Type.STRING, description: "A detailed AI image prompt for a compelling ad image. The image should be visually striking and have an aspect ratio of 1080x1350 pixels (portrait 4:5)." },
                                primary_text: { type: Type.STRING },
                                headline: { type: Type.STRING },
                                placements: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["image_prompt", "primary_text", "headline", "placements"]
                        },
                        first_20_post_themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of exactly 20 diverse post theme ideas." }
                    },
                    required: ["page_name_ideas", "page_bio_90chars", "categories", "logo_brief", "cover_brief", "public_group", "page_likes_ad", "first_20_post_themes"]
                }
            }
        }));

        const jsonText = response.text.trim();
        const parsedObject = JSON.parse(jsonText);
        return parsedObject as FacebookPageStrategy;

    } catch (error: any) {
        console.error("Error in generateFacebookPageStrategy:", error);
        if (error.type) {
            throw error;
        }
        throw getApiErrorDetails(error);
    }
};
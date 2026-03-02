import type { PinterestAccount, GeneratedContentRow, FacebookPost, FacebookPageStrategy, ImageAspectRatio } from '../types';

// --- Interfaces ---

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

// --- Constants ---

export const DEFAULT_CONTENT_PROMPT = "You are a helpful assistant for Pinterest content creation.";

// --- Helpers ---

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const callOpenRouter = async (
    apiKey: string,
    model: string,
    prompt: string,
    responseFormat?: { type: 'json_object' }
): Promise<any> => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            response_format: responseFormat,
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        const errorMessage = errorData.message || `OpenRouter API error: ${response.status} ${response.statusText}`;
        console.error("OpenRouter API Error:", errorData);
        // Check for specific error types like quota
        if (response.status === 429 || errorData.message?.includes('quota')) {
             throw { type: 'quota', message: errorMessage, helpLink: 'https://openrouter.ai/docs#rate-limits' };
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};


// --- Placeholders ---

export const generatePlaceholderDescription = (title: string) => {
    return `Discover the best tips and ideas for ${title}. This pin covers everything you need to know about ${title}. Click to read more!`;
};

export const generatePlaceholderKeywords = (title: string) => {
    return `${title}, ideas, inspiration, tips, guide, best, how to`;
};

export const generatePlaceholderImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    // Return a placeholder service URL
    const size = aspectRatio === '9:16' ? '720x1280' : aspectRatio === '3:4' ? '720x960' : '1024x1024';
    return `https://placehold.co/${size}?text=${encodeURIComponent(prompt)}`;
};

// --- OpenRouter Text Generation ---

export const generateShortTitle = async (apiKey: string, model: string, title: string): Promise<string> => {
    try {
        const prompt = `Shorten this Pinterest pin title to under 40 characters, keeping it catchy and relevant. Remove any "how to" or numbers if necessary to make it punchy. Title: "${title}"`;
        const content = await callOpenRouter(apiKey, model, prompt);
        return content?.trim() || title;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const generateDescription = async (apiKey: string, model: string, title: string): Promise<string> => {
    try {
        const prompt = `Write a compelling, SEO-friendly Pinterest description for a pin titled "${title}". It should be 2-3 sentences long, engaging, and include a call to action.`;
        const content = await callOpenRouter(apiKey, model, prompt);
        return content?.trim() || generatePlaceholderDescription(title);
    } catch (e: any) {
        console.error(e);
        throw e;
    }
};

export const generateKeywords = async (apiKey: string, model: string, title: string): Promise<string> => {
    try {
        const prompt = `Generate 10 comma-separated high-traffic Pinterest keywords for the topic "${title}". Do not include hashtags.`;
        const content = await callOpenRouter(apiKey, model, prompt);
        return content?.trim() || generatePlaceholderKeywords(title);
    } catch (e: any) {
        console.error(e);
        throw e;
    }
};
export const generateSafeImagePrompt = async (apiKey: string, model: string, title: string): Promise<string> => {
    try {
        const prompt = `Create a safe, family-friendly image generation prompt for "${title}". Ensure no NS_FW terms or ambiguous words are used. Describe a beautiful, aesthetic image suitable for Pinterest.`;
        const content = await callOpenRouter(apiKey, model, prompt);
        return content?.trim() || title;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

// --- Image Generators ---

export const generateImage = async (apiKey: string, model: string, prompt: string, aspectRatio: string): Promise<string> => {
    // Fal.ai implementation
    // Assuming model is something like 'fal-ai/recraft/v3/text-to-image'
    // Mapping aspect ratio to Fal.ai format
    const arMap: {[key: string]: string} = { '1:1': 'square', '3:4': 'portrait_4_3', '9:16': 'portrait_16_9', '4:5': 'portrait_4_5' };
    const ar = arMap[aspectRatio] || 'square_hd';

    // This URL logic assumes standard Fal endpoint structure. Adjust as per specific model docs.
    const endpoint = model.startsWith('http') ? model : `https://queue.fal.run/${model}`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: prompt,
            image_size: ar 
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Fal.ai error: ${err}`);
    }

    const data = await response.json();

    // Polling logic for queue.fal.run
    if (data.request_id) {
        const requestId = data.request_id;
        let attempts = 0;
        while (attempts < 60) {
            await sleep(1000);
            const statusUrl = `https://queue.fal.run/${model}/requests/${requestId}`;
            const statusResponse = await fetch(statusUrl, { headers: { 'Authorization': `Key ${apiKey}` } });
            const statusData = await statusResponse.json();
            if (statusData.images && statusData.images.length > 0) {
                return statusData.images[0].url;
            }
            if (statusData.status === 'ERROR') throw new Error(statusData.error || 'Fal.ai generation failed');
            attempts++;
        }
        throw new Error('Fal.ai timeout');
    }

    if (data.images && data.images.length > 0) return data.images[0].url;
    throw new Error('No image returned from Fal.ai');
};

export const generateImageWithMidjourney = async (apiKey: string, prompt: string, aspectRatio: string): Promise<string[]> => {
    // APIFrame implementation (Simplified placeholder for example)
    // Needs real implementation of task polling
    console.warn("generateImageWithMidjourney called (APIFrame) - Placeholder implementation.");
    throw new Error("Midjourney (APIFrame) integration pending implementation.");
};

export const generateImageWithMidApiAi = async (apiKey: string, prompt: string, aspectRatio: string, onProgress?: (msg: string) => void): Promise<string[]> => {
    // midapi.ai implementation (Simplified placeholder)
    console.warn("generateImageWithMidApiAi called - Placeholder implementation.");
    throw new Error("midapi.ai integration pending implementation.");
};

export const generateImageWithImagineApi = async (apiKey: string, prompt: string, aspectRatio: string, onProgress?: (msg: string) => void): Promise<string[]> => {
    // ImagineAPI implementation (Simplified placeholder)
    console.warn("generateImageWithImagineApi called - Placeholder implementation.");
    throw new Error("ImagineAPI integration pending implementation.");
};

export const generateImageWithUseApi = async (
    apiKey: string,
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
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: fullPrompt,
                stream: false,
            })
        });

        if (!imagineResponse.ok) {
            const errorText = await imagineResponse.text();
            if (imagineResponse.status === 401) {
                throw new Error('useapi.net authentication failed. Please check your API key.');
            }
            throw new Error(`useapi.net error: ${errorText}`);
        }

        const imagineData = await imagineResponse.json();
        const jobId = imagineData.jobid;

        if (!jobId) {
            throw new Error('useapi.net did not return a job ID.');
        }

        if (onProgressUpdate) onProgressUpdate(`Job submitted. Waiting for result...`);

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
               continue;
            }

            jobData = await statusResponse.json();
            const status = jobData.status;

            if (status === 'completed') break;
            if (status === 'failed' || status === 'cancelled') {
                throw new Error(`useapi.net task failed: ${jobData.error}`);
            }
        }

        if (jobData?.status !== 'completed') {
            throw new Error('Image generation timed out with useapi.net.');
        }

        const imageUx = jobData.response?.imageUx;
        if (!imageUx || !Array.isArray(imageUx) || imageUx.length === 0) {
            throw new Error('The AI model did not return any valid image URLs.');
        }

        const imageUrls = imageUx.map((img: any) => img.url).filter(Boolean);

        const base64Images = await Promise.all(
            imageUrls.map(async (url: string) => {
                try {
                    const proxyUrl = `https://api.useapi.net/v1/proxy/cdn-midjourney/?cdnUrl=${encodeURIComponent(url)}`;
                    const imageResponse = await fetch(proxyUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
                    if (imageResponse.ok) {
                        const blob = await imageResponse.blob();
                        return await blobToBase64(blob);
                    }
                } catch (e) {
                    console.error("Proxy fetch failed", e);
                }
                // Fallback to direct URL if proxy fails (might have CORS issues)
                return url;
            })
        );

        return base64Images;
    };

    return await generationTask();
};

// --- Bulk Content Generation ---

export const generatePinContentFromKeyword = async (
    apiKey: string,
    model: string,
    keyword: string,
    boardOptions: string = "",
    categoryOptions: string = ""
): Promise<Omit<GeneratedContentRow, 'keyword'>> => {
    const prompt = `Generate Pinterest pin content for the keyword: "${keyword}".
    Return a JSON object with the following fields:
    - title: A catchy title.
    - description: An SEO-friendly description (2-3 sentences).
    - board: A relevant Pinterest board name${boardOptions ? ` (choose from: ${boardOptions})` : ''}.
    - image_prompt: A creative image generation prompt.
    - alt_text: Alt text for the image.
    - interests: An array of 3-5 relevant interest tags.
    - category: A general category${categoryOptions ? ` (choose from: ${categoryOptions})` : ''}.
    - prepTime: Estimated preparation time (e.g., "10 min").
    - cookTime: Estimated cooking time (e.g., "20 min").
    - servings: Number of servings (e.g., "4").
    - difficulty: Difficulty level (e.g., "Easy").
    - ingredients: Comma-separated list of 5-8 key ingredients.
    - calories: Estimated calories per serving (e.g., "420").
    - protein: Estimated protein per serving (e.g., "38g").
    - fat: Estimated fat per serving (e.g., "12g").
    - carbs: Estimated carbs per serving (e.g., "45g").

    Do not use markdown code blocks. Just return the JSON.`;

    const content = await callOpenRouter(apiKey, model, prompt, { type: 'json_object' });
    return JSON.parse(content || '{}');
};

export const rewriteKeyword = async (apiKey: string, model: string, keyword: string): Promise<string> => {
    const prompt = `Rewrite the keyword "${keyword}" to be more specific and search-friendly for Pinterest. Return only the new keyword.`;
    const content = await callOpenRouter(apiKey, model, prompt);
    return content.trim();
};

export const rewriteDescription = async (apiKey: string, model: string, title: string, description: string, categoryOptions: string = ""): Promise<{title: string, description: string, category: string, keywords: string}> => {
const prompt = `Rewrite the following Pinterest content to be more SEO-friendly and engaging.
    Original Title: "${title}"
    Original Description: "${description}"

    Return a JSON object with:
    - title: Rewritten title (catchy, SEO).
    - description: Rewritten description (engaging, 2-3 sentences).
    - category: Choose best category${categoryOptions ? ` from: ${categoryOptions})` : ''}.
    - keywords: 10 comma-separated keywords.`;

    const content = await callOpenRouter(apiKey, model, prompt, { type: 'json_object' });
    return JSON.parse(content);
};

// --- Assistant / Ideas ---

export const generatePinIdeas = async (apiKey: string, model: string, accountName: string): Promise<PinIdea[]> => {
    const prompt = `Generate 5 fresh Pinterest pin ideas for a profile named "${accountName}". Return JSON array of objects with title, description, and hashtags fields.`;
    const content = await callOpenRouter(apiKey, model, prompt, { type: 'json_object' });
    return JSON.parse(content || '[]');
};

export const getAiSuggestions = async (apiKey: string, model: string, account: PinterestAccount): Promise<AISuggestions> => {
    const prompt = `Analyze this Pinterest account: Name="${account.name}", Notes="${account.notes}". Suggest the best time to post, the next pin type to create, and a seasonal theme. Return JSON.`;
    const content = await callOpenRouter(apiKey, model, prompt, { type: 'json_object' });
    return JSON.parse(content || '{}');
};

// --- Facebook Content ---

export const generateFacebookPost = async (apiKey: string, model: string, topic: string): Promise<FacebookPost> => {
    const prompt = `Create a Facebook post about "${topic}". Return JSON with: postText (engaging text), imagePrompt (for AI image gen), hashtags (array of strings), imageText (short text to overlay on image).`;
    const content = await callOpenRouter(apiKey, model, prompt, { type: 'json_object' });
    return JSON.parse(content || '{}');
};

export const generateFacebookPageStrategy = async (apiKey: string, model: string, niche: string, country: string): Promise<FacebookPageStrategy> => {
    const prompt = `Create a Facebook page strategy for Niche: "${niche}", Country: "${country}". Return detailed JSON matching the FacebookPageStrategy interface including page_name_ideas, page_bio_90chars, categories, logo_brief, cover_brief, public_group, page_likes_ad, first_20_post_themes.`;
    const content = await callOpenRouter(apiKey, model, prompt, { type: 'json_object' });
    return JSON.parse(content || '{}');
};

// --- Quotes ---

export const generateViralQuotes = async (apiKey: string, model: string, category: string, length: 'short' | 'long'): Promise<string[]> => {
    const prompt = `Generate 5 viral, aesthetic quotes about "${category}". Length: ${length}. Return JSON array of strings under the key "quotes".`;
    const content = await callOpenRouter(apiKey, model, prompt, { type: 'json_object' });
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.quotes || [];
};

export const enhanceViralQuote = async (apiKey: string, model: string, quote: string, length: 'short' | 'long'): Promise<string[]> => {
    const prompt = `Rewrite this quote to be more viral and aesthetic: "${quote}". Length: ${length}. Provide 3 variations. Return JSON array of strings under the key "quotes".`;
    const content = await callOpenRouter(apiKey, model, prompt, { type: 'json_object' });
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.quotes || [];
};

export const generateSoraVideoPrompt = async (apiKey: string, model: string, quote: string): Promise<string> => {
    const prompt = `Create a detailed, cinematic video generation prompt (for OpenAI Sora) that visually represents the mood of this quote: "${quote}". Describe lighting, camera movement, subject, and atmosphere.`;
    const content = await callOpenRouter(apiKey, model, prompt);
    return content?.trim() || '';
};

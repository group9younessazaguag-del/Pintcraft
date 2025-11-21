
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { ImageAspectRatio, GeneratedContentRow, PinterestAccount, FacebookPost, FacebookPageStrategy } from '../types';

export const DEFAULT_CONTENT_PROMPT = `You are a Pinterest SEO and Content Expert. 
Your goal is to create highly engaging, click-worthy, and SEO-optimized content for Pinterest Pins.
Focus on:
1. High-volume keywords relevant to the niche.
2. Emotional hooks and benefits in the description.
3. Clear, concise, and catchy titles.`;

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

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getGeminiClient = (apiKey: string) => new GoogleGenAI({ apiKey });

// --- Text Generation ---

export const generateDescription = async (apiKey: string, model: string, title: string, keywords: string = ''): Promise<string> => {
  if (!apiKey) return generatePlaceholderDescription();
  try {
    const ai = getGeminiClient(apiKey);
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: `Write an engaging, SEO-friendly Pinterest description (max 300 chars) for a pin titled "${title}". ${keywords ? `Keywords to include: ${keywords}` : ''}.`,
    });
    return response.text || '';
  } catch (error) {
    console.error("Error generating description:", error);
    return generatePlaceholderDescription();
  }
};

export const generatePlaceholderDescription = (): string => {
  return "This is a placeholder description. Add your own engaging text here or use AI to generate one that drives clicks!";
};

export const generateKeywords = async (apiKey: string, model: string, title: string): Promise<string> => {
  if (!apiKey) return generatePlaceholderKeywords();
  try {
    const ai = getGeminiClient(apiKey);
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: `Generate 10 comma-separated high-traffic Pinterest keywords for "${title}". Return only the comma-separated list.`,
    });
    return response.text || '';
  } catch (error) {
    console.error("Error generating keywords:", error);
    return generatePlaceholderKeywords();
  }
};

export const generatePlaceholderKeywords = (): string => {
  return "pinterest ideas, aesthetic, inspiration, diy, trends";
};

export const generateShortTitle = async (apiKey: string, model: string, title: string): Promise<string> => {
  if (!apiKey) return title;
  try {
    const ai = getGeminiClient(apiKey);
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: `Rewrite this title to be catchy and under 50 characters: "${title}". Return only the title.`,
    });
    return response.text?.replace(/^"|"$/g, '').trim() || title;
  } catch (error) {
    return title;
  }
};

export const generateSafeImagePrompt = async (apiKey: string, model: string, title: string): Promise<string> => {
    if (!apiKey) return title;
    try {
        const ai = getGeminiClient(apiKey);
        const response = await ai.models.generateContent({
            model: model || 'gemini-2.5-flash',
            contents: `Create a safe, descriptive, high-quality image generation prompt based on this pin title: "${title}". Ensure it adheres to safety guidelines.`,
        });
        return response.text?.trim() || title;
    } catch (e) {
        return title;
    }
};

// --- Image Generation ---

export const generatePlaceholderImage = async (prompt: string, aspectRatio: ImageAspectRatio): Promise<string> => {
    const width = aspectRatio === '9:16' ? 720 : aspectRatio === '1:1' ? 1024 : 1024;
    const height = aspectRatio === '9:16' ? 1280 : aspectRatio === '1:1' ? 1024 : 768;
    const text = encodeURIComponent(prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt);
    return `https://placehold.co/${width}x${height}/png?text=${text}`;
};

export const generateImage = async (apiKey: string, model: string, prompt: string, aspectRatio: ImageAspectRatio): Promise<string> => {
    const ratioMap: Record<string, string> = { '1:1': 'square', '9:16': 'portrait_16_9', '3:4': 'portrait_4_3', '4:5': 'portrait_4_5' };
    const size = ratioMap[aspectRatio] || 'square_hd';
    
    const response = await fetch(`https://fal.run/${model || 'fal-ai/recraft/v3/text-to-image'}`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, image_size: size }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || `Fal.ai error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.images?.[0]?.url || '';
};

export const generateImageWithMidjourney = async (apiKey: string, prompt: string, aspectRatio: string): Promise<string> => {
    // Placeholder for APIFrame implementation
    await sleep(1000); // Simulate network
    return generatePlaceholderImage(prompt, aspectRatio as ImageAspectRatio);
};

export const generateImageWithMidApiAi = async (apiKey: string, prompt: string, aspectRatio: string): Promise<string> => {
    // Placeholder for Midapi.ai implementation
    await sleep(1000);
    return generatePlaceholderImage(prompt, aspectRatio as ImageAspectRatio);
};

export const generateImageWithImagineApi = async (apiKey: string, prompt: string, aspectRatio: string): Promise<string> => {
    // Placeholder for ImagineAPI implementation
    await sleep(1000);
    return generatePlaceholderImage(prompt, aspectRatio as ImageAspectRatio);
};

export const generateImageWithUseApi = async (apiKey: string, prompt: string, aspectRatio: string, onProgress?: (msg: string) => void): Promise<string[]> => {
    // Placeholder for useapi.net implementation
    if (onProgress) onProgress("Initializing...");
    await sleep(1000);
    if (onProgress) onProgress("Generating...");
    await sleep(1000);
    return [await generatePlaceholderImage(prompt, aspectRatio as ImageAspectRatio)];
};

// --- Advanced Content Generation (JSON Output) ---

export const generatePinContentFromKeyword = async (apiKey: string, model: string, keyword: string, boardOptions?: string, categoryOptions?: string): Promise<Omit<GeneratedContentRow, 'keyword'>> => {
    const ai = getGeminiClient(apiKey);
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            board: { type: Type.STRING },
            image_prompt: { type: Type.STRING },
            alt_text: { type: Type.STRING },
            interests: { type: Type.ARRAY, items: { type: Type.STRING } },
            category: { type: Type.STRING },
        },
        required: ['title', 'description', 'board', 'image_prompt'],
    };

    const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: `Generate Pinterest content for keyword: "${keyword}". Boards: ${boardOptions || 'any'}. Categories: ${categoryOptions || 'any'}.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        }
    });
    
    return JSON.parse(response.text || '{}');
};

export const generatePinContentFromKeywordWithOpenRouter = async (apiKey: string, model: string, keyword: string, boardOptions?: string, categoryOptions?: string): Promise<Omit<GeneratedContentRow, 'keyword'>> => {
     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model || 'google/gemini-2.5-flash',
                messages: [
                    { role: "user", content: `Generate JSON for Pinterest content (title, description, board, image_prompt, alt_text, interests, category) for keyword: "${keyword}".` }
                ],
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        return JSON.parse(content || '{}');
};

export const rewriteKeyword = async (apiKey: string, model: string, keyword: string): Promise<string> => {
    const ai = getGeminiClient(apiKey);
    const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: `Rewrite this Pinterest keyword to be more specific and high-traffic: "${keyword}". Return only the keyword.`,
    });
    return response.text?.trim() || keyword;
};

export const rewriteKeywordWithOpenRouter = async (apiKey: string, model: string, keyword: string): Promise<string> => {
    // Mock implementation for OpenRouter rewrite
    return keyword; 
};

// --- Assistant ---

export const generatePinIdeas = async (apiKey: string, model: string, accountName: string): Promise<PinIdea[]> => {
     const ai = getGeminiClient(apiKey);
     const schema: Schema = {
         type: Type.ARRAY,
         items: {
             type: Type.OBJECT,
             properties: {
                 title: { type: Type.STRING },
                 description: { type: Type.STRING },
                 hashtags: { type: Type.STRING },
             },
             required: ['title', 'description', 'hashtags']
         }
     };
     const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: `Generate 5 Pinterest pin ideas for account "${accountName}".`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    return JSON.parse(response.text || '[]');
};

export const getAiSuggestions = async (apiKey: string, model: string, account: PinterestAccount): Promise<AISuggestions> => {
    const ai = getGeminiClient(apiKey);
    const schema: Schema = {
         type: Type.OBJECT,
         properties: {
             bestTime: { type: Type.STRING },
             nextPinType: { type: Type.STRING },
             seasonalTheme: { type: Type.STRING },
         }
     };
    const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: `Analyze account "${account.name}" with notes "${account.notes}". Suggest best posting time, next pin type, and seasonal theme.`,
         config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    return JSON.parse(response.text || '{}');
};

// --- Facebook ---

export const generateFacebookPost = async (apiKey: string, model: string, topic: string): Promise<FacebookPost> => {
    const ai = getGeminiClient(apiKey);
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            postText: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            imageText: { type: Type.STRING },
        },
        required: ['postText', 'imagePrompt', 'hashtags', 'imageText']
    };
    const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: `Create an engaging Facebook post about "${topic}" including an image prompt and hashtags.`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    return JSON.parse(response.text || '{}');
};

export const generateFacebookPostWithOpenRouter = async (apiKey: string, model: string, topic: string): Promise<FacebookPost> => {
     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: model || 'google/gemini-2.5-flash',
                messages: [{ role: "user", content: `Create a JSON Facebook post (postText, imagePrompt, hashtags array, imageText) about "${topic}".` }],
                response_format: { type: "json_object" }
            })
        });
    const data = await response.json();
    return JSON.parse(data.choices?.[0]?.message?.content || '{}');
};

export const generateFacebookPageStrategy = async (apiKey: string, model: string, niche: string, country: string): Promise<FacebookPageStrategy> => {
    const ai = getGeminiClient(apiKey);
    const schema: Schema = {
         type: Type.OBJECT,
         properties: {
             page_name_ideas: { type: Type.ARRAY, items: { type: Type.STRING } },
             page_bio_90chars: { type: Type.STRING },
             categories: { type: Type.ARRAY, items: { type: Type.STRING } },
             logo_brief: { type: Type.OBJECT, properties: { style: {type: Type.STRING}, motifs: {type: Type.ARRAY, items: {type: Type.STRING}}, notes: {type: Type.STRING} }, required: ['style', 'motifs', 'notes'] },
             cover_brief: { type: Type.OBJECT, properties: { concept: {type: Type.STRING}, layout_notes: {type: Type.STRING} }, required: ['concept', 'layout_notes'] },
             public_group: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, description: {type: Type.STRING}, first_pinned_post: {type: Type.STRING} }, required: ['name', 'description', 'first_pinned_post'] },
             page_likes_ad: { type: Type.OBJECT, properties: { image_prompt: {type: Type.STRING}, primary_text: {type: Type.STRING}, headline: {type: Type.STRING}, placements: {type: Type.ARRAY, items: {type: Type.STRING}} }, required: ['image_prompt', 'primary_text', 'headline', 'placements'] },
             first_20_post_themes: { type: Type.ARRAY, items: { type: Type.STRING } },
         },
         required: ['page_name_ideas', 'page_bio_90chars', 'categories', 'logo_brief', 'cover_brief', 'public_group', 'page_likes_ad', 'first_20_post_themes']
    };

    const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: `Create a Facebook Page Strategy for Niche: "${niche}" in Country: "${country}".`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    return JSON.parse(response.text || '{}');
};

// --- Quotes ---

export const generateViralQuotes = async (apiKey: string, model: string, category: string, length: 'short'|'long'): Promise<string[]> => {
    const ai = getGeminiClient(apiKey);
    const schema: Schema = { type: Type.ARRAY, items: { type: Type.STRING } };
    const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: `Generate 5 ${length} viral quotes about ${category}.`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    return JSON.parse(response.text || '[]');
};

export const generateViralQuotesWithOpenRouter = async (apiKey: string, model: string, category: string, length: 'short'|'long'): Promise<string[]> => {
     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: model || 'google/gemini-2.5-flash',
                messages: [{ role: "user", content: `Generate JSON array of 5 ${length} viral quotes about ${category}.` }],
                response_format: { type: "json_object" }
            })
        });
    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    return Array.isArray(parsed) ? parsed : (parsed.quotes || []);
};

export const enhanceViralQuote = async (apiKey: string, model: string, quote: string, length: 'short'|'long'): Promise<string[]> => {
     const ai = getGeminiClient(apiKey);
    const schema: Schema = { type: Type.ARRAY, items: { type: Type.STRING } };
    const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: `Enhance and rewrite this quote 5 ways to be more viral (${length}): "${quote}"`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    return JSON.parse(response.text || '[]');
};

export const enhanceViralQuoteWithOpenRouter = async (apiKey: string, model: string, quote: string, length: 'short'|'long'): Promise<string[]> => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: model || 'google/gemini-2.5-flash',
                messages: [{ role: "user", content: `Enhance and rewrite this quote 5 ways to be more viral (${length}) as JSON array: "${quote}"` }],
                response_format: { type: "json_object" }
            })
        });
    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    return Array.isArray(parsed) ? parsed : (parsed.quotes || []);
};

export const generateSoraVideoPrompt = async (apiKey: string, model: string, quote: string): Promise<string> => {
    const ai = getGeminiClient(apiKey);
    const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: `Create a detailed, cinematic Sora video prompt to visualize this quote: "${quote}".`,
    });
    return response.text || '';
};

export const generateSoraVideoPromptWithOpenRouter = async (apiKey: string, model: string, quote: string): Promise<string> => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: model || 'google/gemini-2.5-flash',
            messages: [{ role: "user", content: `Create a detailed, cinematic Sora video prompt to visualize this quote: "${quote}".` }]
        })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
};

export const rewriteTitleAndDescription = async (apiKey: string, model: string, title: string, currentDescription: string): Promise<{ title: string; description: string }> => {
    const systemPrompt = `You are a Pinterest SEO expert for a **BLOG**. You are NOT selling products.
Your task: Rewrite the input Title and Description to be engaging, viral, and SEO-friendly for a blog post.

**CRITICAL RULES**:
1. **REMOVE Commercial Terms**: If the input contains "Digital Download", "Printable", "Etsy", "Amazon", "eBay", "Shop", "Buy", "Store", "Cart", "Checkout" or similar, REMOVE THEM COMPLETELY.
2. **Context**: The content is for a blog post (ideas, tips, inspiration, guide, tutorial), NOT a product to buy.
3. **Title**: Catchy, under 60 chars. No emojis.
4. **Description**: Inspiring, 2-4 sentences. No hashtags. No "link in bio".
5. **Output**: JSON object { "title": "...", "description": "..." }.`;

    const userPrompt = `Title: "${title}"
Description: "${currentDescription}"`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: model || 'google/gemini-2.5-flash',
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            })
        });
        
        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.error?.message || `OpenRouter API Error: ${response.status}`);
        }

        const data = await response.json();
        return JSON.parse(data.choices?.[0]?.message?.content || '{"title":"", "description":""}');
    } catch (error: any) {
        console.error("Error rewriting title and description:", error);
        throw error;
    }
};

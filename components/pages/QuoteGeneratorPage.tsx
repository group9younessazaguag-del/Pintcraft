
import React, { useState, useEffect, useRef } from 'react';
import { generateViralQuotes, generateImageWithUseApi, enhanceViralQuote, generateSoraVideoPrompt } from '@/services/ai';
import { ControlCard, ApiKeyInput } from '../Controls';
import SettingsIcon from '../icons/SettingsIcon';
import QuoteIcon from '../icons/QuoteIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import ErrorIcon from '../icons/ErrorIcon';
import ImagesIcon from '../icons/ImagesIcon';
import DownloadIcon from '../icons/DownloadIcon';
import VideoIcon from '../icons/VideoIcon';

interface QuoteGeneratorPageProps {
    openRouterApiKey: string;
    onSetOpenRouterApiKey: (key: string) => void;
    useapiApiKey: string;
    onSetUseapiApiKey: (key: string) => void;
    textModel: string;
}

// Removed ServiceToggleButton as OpenRouter is now exclusive for text AI

const CATEGORIES = [
    "Self Love", "Love", "Sad", "Life", "Motivation", "Success", "Friendship", "Funny", "Healing", "Glow Up"
];

// Updated to "Cinematic high-angle drone shot of person walking" style
const IMAGE_STYLES = [
    "Cinematic high-angle drone shot from the sky looking down at a solitary person walking alone on a vast empty beach at sunset",
    "Cinematic high-angle drone shot from the sky looking down at a solitary person walking alone in a misty forest path",
    "Cinematic high-angle drone shot from the sky looking down at a solitary person walking alone in endless desert dunes",
    "Cinematic high-angle drone shot from the sky looking down at a solitary person walking alone on a quiet city street at night with rain reflections",
    "Cinematic high-angle drone shot from the sky looking down at a solitary person walking alone in a vast white snowy field",
    "Cinematic high-angle drone shot from the sky looking down at a solitary person walking alone on a winding mountain road"
];

// FIX: Export QuoteGeneratorPage as a named export
export const QuoteGeneratorPage: React.FC<QuoteGeneratorPageProps> = ({
    openRouterApiKey,
    onSetOpenRouterApiKey,
    useapiApiKey,
    onSetUseapiApiKey,
    textModel,
}) => {
    const [activeTab, setActiveTab] = useState<'category' | 'custom'>('category');
    const [selectedCategory, setSelectedCategory] = useState('Self Love');
    const [customQuote, setCustomQuote] = useState('');
    const [quoteLength, setQuoteLength] = useState<'short' | 'long'>('short');
    
    const [quotes, setQuotes] = useState<string[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageGenerationMessage, setImageGenerationMessage] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Video Prompt State
    const [videoPrompt, setVideoPrompt] = useState('');
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

    // Default model for OpenRouter, previously it was set for Google AI
    const [openRouterModel, setOpenRouterModel] = useState(textModel || 'google/gemini-2.5-flash'); 

    const [useapiApiKeyInput, setUseapiApiKeyInput] = useState(useapiApiKey);
    useEffect(() => { setUseapiApiKeyInput(useapiApiKey); }, [useapiApiKey]);
    const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState(openRouterApiKey);
    useEffect(() => { setOpenRouterApiKeyInput(openRouterApiKey); }, [openRouterApiKey]);

    const previewRef = useRef<HTMLDivElement>(null);

    // FIX: Corrected casing for onSetUseapiApiKey
    const handleSaveUseapiKey = () => onSetUseapiApiKey(useapiApiKeyInput.trim());
    // FIX: Corrected casing for onSetUseapiApiKey
    const handleClearUseapiKey = () => { setUseapiApiKeyInput(''); onSetUseapiApiKey(''); };
    const handleSaveOpenRouterKey = () => onSetOpenRouterApiKey(openRouterApiKeyInput.trim());
    const handleClearOpenRouterKey = () => { setOpenRouterApiKeyInput(''); onSetOpenRouterApiKey(''); };

    const useapiKeyIsConfigured = useapiApiKey && useapiApiKey.length > 5;
    const openRouterKeyIsConfigured = openRouterApiKey && openRouterApiKey.length > 5;

    const handleGenerateQuotes = async () => {
        if (activeTab === 'custom' && !customQuote.trim()) {
            setApiError("Please enter your quote to enhance.");
            return;
        }
        if (activeTab === 'category' && !selectedCategory) {
            setApiError("Please select a category.");
            return;
        }

        if (!openRouterKeyIsConfigured) {
            setApiError("Please provide an OpenRouter API key.");
            return;
        }

        setIsLoading(true);
        setApiError(null);
        setQuotes([]);
        setSelectedQuote('');
        setVideoPrompt('');

        try {
            let result: string[] = [];
            if (activeTab === 'custom') {
                 // Correctly call the OpenRouter version of enhanceViralQuote
                 result = await enhanceViralQuote(openRouterApiKey, openRouterModel, customQuote, quoteLength);
            } else {
                // Correctly call the OpenRouter version of generateViralQuotes
                result = await generateViralQuotes(openRouterApiKey, openRouterModel, selectedCategory, quoteLength);
            }
            
            setQuotes(result);
            if (result.length > 0) {
                setSelectedQuote(result[0]);
            }
        } catch (error: any) {
            setApiError(error.message || "An error occurred generating quotes.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImageForQuote = async () => {
        if (!selectedQuote) return;
        if (!useapiKeyIsConfigured) {
            setApiError("Please provide a useapi.net API key for image generation.");
            return;
        }

        setIsGeneratingImage(true);
        setApiError(null);
        setImageGenerationMessage(null);

        try {
             // Randomly select a style from the list to vary the output
            const randomStyle = IMAGE_STYLES[Math.floor(Math.random() * IMAGE_STYLES.length)];
            
            // Updated prompt construction for cinematic look
            const prompt = `${randomStyle}. Minimalist composition, vast landscape, emotional atmosphere, tiny figure. High quality, photorealistic 8k, vertical 9:16 aspect ratio. --no text`;
            
            const onProgress = (msg: string) => setImageGenerationMessage(msg);
            
            // Call generateImageWithUseApi as it's the configured image generator here
            const imageUrls = await generateImageWithUseApi(
                useapiApiKey,
                prompt,
                '9:16',
                onProgress
            );

            if (imageUrls && imageUrls.length > 0) {
                setGeneratedImage(imageUrls[0]);
            }
        } catch (error: any) {
            setApiError(error.message || "Failed to generate background image.");
        } finally {
            setIsGeneratingImage(false);
            setImageGenerationMessage(null);
        }
    };

    const handleGenerateVideoPrompt = async () => {
        if (!selectedQuote) {
            setApiError("Please select a quote first.");
            return;
        }
        
        if (!openRouterKeyIsConfigured) {
             setApiError("Please provide an OpenRouter API key.");
             return;
        }

        setIsGeneratingVideo(true);
        setApiError(null);

        try {
            // Correctly call the OpenRouter version of generateSoraVideoPrompt
            const prompt = await generateSoraVideoPrompt(openRouterApiKey, openRouterModel, selectedQuote);
            setVideoPrompt(prompt);
        } catch (error: any) {
            setApiError(error.message || "Failed to generate video prompt.");
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const handleCopyVideoPrompt = () => {
        navigator.clipboard.writeText(videoPrompt).then(() => {
            alert("Video prompt copied to clipboard!");
        });
    };


    const handleDownload = () => {
         if (!previewRef.current) return;
         setIsDownloading(true);
         window.htmlToImage.toPng(previewRef.current, { cacheBust: true, pixelRatio: 2, fetchRequestInit: { mode: 'cors' } })
          .then((dataUrl) => {
            const link = document.createElement('a');
            const safeName = (activeTab === 'category' ? selectedCategory : 'quote').trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'quote';
            link.download = `quote_${safeName}.png`;
            link.href = dataUrl;
            link.click();
          })
          .catch((err) => {
             console.error(err);
             setApiError("Failed to download image.");
          })
          .finally(() => setIsDownloading(false));
    };

    return (
        <div className="container mx-auto max-w-7xl">
             <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800">Viral Quote Generator</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                    Create aesthetic, viral quote cards for Instagram, Pinterest, and TikTok in seconds.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <ControlCard icon={<QuoteIcon />} title="1. Generate Content">
                         <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-4">
                            <button
                                onClick={() => setActiveTab('category')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'category' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                            >
                                From Category
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'custom' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                            >
                                Enhance My Quote
                            </button>
                        </div>

                        {activeTab === 'category' ? (
                             <div>
                                <label htmlFor="category-select" className="block text-sm font-medium text-slate-600 mb-1.5">Select Category</label>
                                <select
                                    id="category-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900"
                                >
                                    {CATEGORIES.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="custom-quote" className="block text-sm font-medium text-slate-600 mb-1.5">Your Quote</label>
                                <textarea
                                    id="custom-quote"
                                    value={customQuote}
                                    onChange={(e) => setCustomQuote(e.target.value)}
                                    rows={3}
                                    placeholder="Enter the quote you want to enhance..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Quote Length</label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setQuoteLength('short')}
                                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${quoteLength === 'short' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                >
                                    Short
                                </button>
                                <button
                                    onClick={() => setQuoteLength('long')}
                                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${quoteLength === 'long' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                >
                                    Long
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateQuotes}
                            disabled={isLoading || !openRouterKeyIsConfigured}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <><LoadingSpinner className="mr-2"/> Generating Quotes...</> : '✨ Generate Quotes'}
                        </button>
                        
                        {quotes.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-slate-200">
                                <label htmlFor="select-quote" className="block text-sm font-medium text-slate-600 mb-1.5">Select a Quote</label>
                                <select
                                    id="select-quote"
                                    value={selectedQuote}
                                    onChange={(e) => setSelectedQuote(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900"
                                >
                                    {quotes.map((q, i) => (
                                        <option key={i} value={q}>{q}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </ControlCard>

                    <ControlCard icon={<ImagesIcon />} title="2. Generate Image">
                        <p className="text-sm text-slate-600 mb-3">Choose an AI to generate a cinematic background image for your quote.</p>
                        <button
                            onClick={handleGenerateImageForQuote}
                            disabled={!selectedQuote || isGeneratingImage || !useapiKeyIsConfigured}
                            title={!useapiKeyIsConfigured ? 'Add a useapi.net API key to use this generator' : 'Generate image with useapi.net'}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {isGeneratingImage ? (
                                <><LoadingSpinner className="mr-2"/> {imageGenerationMessage || 'Generating Image...'}</>
                            ) : '🖼️ Generate Image with useapi.net'}
                        </button>
                    </ControlCard>

                    <ControlCard icon={<VideoIcon />} title="3. Generate Video Prompt (Sora)">
                        <p className="text-sm text-slate-600 mb-3">
                            Generate a detailed video prompt for tools like OpenAI Sora based on your selected quote.
                        </p>
                        <button
                            onClick={handleGenerateVideoPrompt}
                            disabled={!selectedQuote || isGeneratingVideo || !openRouterKeyIsConfigured}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {isGeneratingVideo ? <><LoadingSpinner className="mr-2"/> Generating...</> : '🎬 Generate Video Prompt'}
                        </button>
                        {videoPrompt && (
                            <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <p className="text-sm font-mono text-slate-700 whitespace-pre-wrap">{videoPrompt}</p>
                                <button onClick={handleCopyVideoPrompt} className="mt-3 w-full text-sm bg-white border border-slate-300 text-slate-700 font-semibold py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                    Copy to Clipboard
                                </button>
                            </div>
                        )}
                    </ControlCard>

                    <ControlCard icon={<SettingsIcon />} title="AI Configuration">
                        <ApiKeyInput
                            label="OpenRouter.ai API Key"
                            value={openRouterApiKeyInput}
                            onChange={setOpenRouterApiKeyInput}
                            onSave={handleSaveOpenRouterKey}
                            onClear={handleClearOpenRouterKey}
                            placeholder="Enter your OpenRouter key"
                            getLink="https://openrouter.ai/keys"
                            getLinkText="Get an OpenRouter API Key"
                            statusMessage={
                                openRouterKeyIsConfigured ? (
                                    <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Key is configured.</p>
                                ) : (
                                    <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong> for text generation.</p>
                                )
                            }
                        />
                         <div>
                            <label htmlFor="openrouter-model" className="block text-sm font-medium text-slate-600 mb-1.5">OpenRouter Model</label>
                            <input
                                type="text"
                                id="openrouter-model"
                                value={openRouterModel}
                                onChange={(e) => setOpenRouterModel(e.target.value)}
                                placeholder="e.g., google/gemini-2.5-flash"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <p className="text-xs text-slate-500 mt-1.5">
                                Find models on the <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="underline text-pink-600">OpenRouter models page</a>.
                            </p>
                        </div>
                        <hr className="border-slate-200" />
                        <ApiKeyInput
                            label="useapi.net API Key (Midjourney V3)"
                            value={useapiApiKeyInput}
                            onChange={setUseapiApiKeyInput}
                            onSave={handleSaveUseapiKey}
                            onClear={handleClearUseapiKey}
                            placeholder="Enter your useapi.net key"
                            getLink="https://useapi.net/"
                            getLinkText="Get a useapi.net API Key"
                            statusMessage={
                                useapiKeyIsConfigured ? (
                                    <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Your useapi.net key is saved.</p>
                                ) : (
                                    <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong> for image generation.</p>
                                )
                            }
                        />
                    </ControlCard>
                </div>

                <div className="lg:col-span-2">
                    <ControlCard icon={<ImagesIcon />} title="4. Quote Card Preview">
                        {apiError && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start mb-4" role="alert">
                                <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0 mr-3" />
                                <p className="text-sm">{apiError}</p>
                            </div>
                        )}
                        
                        {(isLoading || isGeneratingImage) && !generatedImage && (
                             <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                                <LoadingSpinner className="w-10 h-10" />
                                <p className="mt-4 text-lg font-medium">{imageGenerationMessage || 'Generating content...'}</p>
                            </div>
                        )}

                        {selectedQuote && generatedImage && (
                            <div className="relative w-full aspect-[9/16] bg-slate-100 rounded-lg overflow-hidden shadow-xl border border-slate-200">
                                <div
                                    ref={previewRef}
                                    className="w-full h-full bg-cover bg-center flex flex-col justify-center items-center p-8 text-center"
                                    style={{ backgroundImage: `url(${generatedImage})` }}
                                >
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                                    <div className="relative z-10 text-white font-playfair italic text-3xl leading-relaxed" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}>
                                        "{selectedQuote}"
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full shadow-md hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                                    title="Download Image"
                                >
                                    {isDownloading ? <LoadingSpinner className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                         {!isLoading && !isGeneratingImage && (!selectedQuote || !generatedImage) && (
                             <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                                <p className="text-lg">Your generated quote card will appear here.</p>
                            </div>
                        )}
                    </ControlCard>
                </div>
            </div>
        </div>
    );
};
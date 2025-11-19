
import React, { useState, useEffect, useRef } from 'react';
import { generateViralQuotes, generateViralQuotesWithOpenRouter, generateImageWithUseApi, enhanceViralQuote, enhanceViralQuoteWithOpenRouter, generateSoraVideoPrompt, generateSoraVideoPromptWithOpenRouter } from '../../services/googleAi';
import { ControlCard, ApiKeyInput } from '../Controls';
import SettingsIcon from '../icons/SettingsIcon';
import QuoteIcon from '../icons/QuoteIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import ErrorIcon from '../icons/ErrorIcon';
import ImagesIcon from '../icons/ImagesIcon';
import DownloadIcon from '../icons/DownloadIcon';
import VideoIcon from '../icons/VideoIcon';

interface QuoteGeneratorPageProps {
    userApiKey: string;
    onSetUserApiKey: (key: string) => void;
    useapiApiKey: string;
    onSetUseapiApiKey: (key: string) => void;
    openRouterApiKey: string;
    onSetOpenRouterApiKey: (key: string) => void;
    textModel: string;
}

const ServiceToggleButton: React.FC<{
    options: { id: 'google' | 'openrouter'; name: string }[];
    selected: 'google' | 'openrouter';
    onSelect: (id: 'google' | 'openrouter') => void;
}> = ({ options, selected, onSelect }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">Text Generation Service</label>
        <div className="grid grid-cols-2 gap-2">
            {options.map(option => (
                <button
                    key={option.id}
                    onClick={() => onSelect(option.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${selected === option.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                    {option.name}
                </button>
            ))}
        </div>
    </div>
);

const CATEGORIES = [
    "Self Love", "Love", "Sad", "Life", "Motivation", "Success", "Friendship", "Funny", "Healing", "Glow Up"
];

const IMAGE_STYLES = [
    "Abstract Aura Gradient, vibrant colors, grainy texture, spiritual vibe",
    "Moody Dark Forest, cinematic lighting, fog, mystery",
    "Dreamy Pastel Clouds, soft focus, ethereal, heaven-like",
    "Midnight Ocean Waves, deep blue, bioluminescence, calm",
    "Urban City Rain, neon lights reflection, night time, cyberpunk vibe",
    "Minimalist Beige Plaster Texture, soft shadows, organic shapes"
];

const QuoteGeneratorPage: React.FC<QuoteGeneratorPageProps> = ({
    userApiKey,
    onSetUserApiKey,
    useapiApiKey,
    onSetUseapiApiKey,
    openRouterApiKey,
    onSetOpenRouterApiKey,
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

    const [service, setService] = useState<'google' | 'openrouter'>('google');
    const [openRouterModel, setOpenRouterModel] = useState('google/gemini-2.5-flash');

    const [googleApiKeyInput, setGoogleApiKeyInput] = useState(userApiKey);
    useEffect(() => { setGoogleApiKeyInput(userApiKey); }, [userApiKey]);
    const [useapiApiKeyInput, setUseapiApiKeyInput] = useState(useapiApiKey);
    useEffect(() => { setUseapiApiKeyInput(useapiApiKey); }, [useapiApiKey]);
    const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState(openRouterApiKey);
    useEffect(() => { setOpenRouterApiKeyInput(openRouterApiKey); }, [openRouterApiKey]);

    const previewRef = useRef<HTMLDivElement>(null);

    const handleSaveGoogleKey = () => onSetUserApiKey(googleApiKeyInput.trim());
    const handleClearGoogleKey = () => { setGoogleApiKeyInput(''); onSetUserApiKey(''); };
    const handleSaveUseapiKey = () => onSetUseapiApiKey(useapiApiKeyInput.trim());
    const handleClearUseapiKey = () => { setUseapiApiKeyInput(''); onSetUseapiApiKey(''); };
    const handleSaveOpenRouterKey = () => onSetOpenRouterApiKey(openRouterApiKeyInput.trim());
    const handleClearOpenRouterKey = () => { setOpenRouterApiKeyInput(''); onSetOpenRouterApiKey(''); };

    const googleKeyIsConfigured = userApiKey && userApiKey.length > 5;
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

        if (service === 'google' && !googleKeyIsConfigured) {
            setApiError("Please provide a Google AI API key.");
            return;
        }
        if (service === 'openrouter' && !openRouterKeyIsConfigured) {
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
                 if (service === 'openrouter') {
                    result = await enhanceViralQuoteWithOpenRouter(openRouterApiKey, openRouterModel, customQuote, quoteLength);
                } else {
                    result = await enhanceViralQuote(userApiKey, textModel, customQuote, quoteLength);
                }
            } else {
                if (service === 'openrouter') {
                    result = await generateViralQuotesWithOpenRouter(openRouterApiKey, openRouterModel, selectedCategory, quoteLength);
                } else {
                    result = await generateViralQuotes(userApiKey, textModel, selectedCategory, quoteLength);
                }
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
            
            const prompt = `${randomStyle}. High quality, photorealistic, vertical 9:16 aspect ratio. --no text`;
            
            const onProgress = (msg: string) => setImageGenerationMessage(msg);
            
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
        
        if (service === 'google' && !googleKeyIsConfigured) {
             setApiError("Please provide a Google AI API key.");
             return;
        }
        if (service === 'openrouter' && !openRouterKeyIsConfigured) {
             setApiError("Please provide an OpenRouter API key.");
             return;
        }

        setIsGeneratingVideo(true);
        setApiError(null);

        try {
            let prompt = '';
            if (service === 'openrouter') {
                prompt = await generateSoraVideoPromptWithOpenRouter(openRouterApiKey, openRouterModel, selectedQuote);
            } else {
                prompt = await generateSoraVideoPrompt(userApiKey, textModel, selectedQuote);
            }
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
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900 mb-4"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
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
                                    placeholder="Paste your quote here..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[100px] mb-4"
                                />
                            </div>
                        )}
                        
                        <div className="mb-4">
                             <label className="block text-sm font-medium text-slate-600 mb-1.5">Quote Length</label>
                             <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setQuoteLength('short')}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${quoteLength === 'short' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                                >
                                    Short (Viral)
                                </button>
                                <button
                                    onClick={() => setQuoteLength('long')}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${quoteLength === 'long' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                                >
                                    Long (Deep)
                                </button>
                             </div>
                        </div>

                        <button
                            onClick={handleGenerateQuotes}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <><LoadingSpinner className="mr-2"/> Generating...</> : (activeTab === 'category' ? '✨ Generate Quotes' : '✨ Enhance Quote')}
                        </button>
                    </ControlCard>

                    {quotes.length > 0 && (
                        <ControlCard icon={<SettingsIcon />} title="2. Select Quote">
                             <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {quotes.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedQuote(q)}
                                        className={`w-full text-left p-3 rounded-lg text-sm transition-colors border ${selectedQuote === q ? 'bg-pink-50 border-pink-300 text-pink-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        "{q}"
                                    </button>
                                ))}
                             </div>
                        </ControlCard>
                    )}
                    
                     <ControlCard icon={<SettingsIcon />} title="AI Configuration">
                        <div className="space-y-6">
                            <ServiceToggleButton
                                options={[
                                    { id: 'google', name: 'Google AI' },
                                    { id: 'openrouter', name: 'OpenRouter' }
                                ]}
                                selected={service}
                                onSelect={setService}
                            />

                            {service === 'google' && (
                                <ApiKeyInput
                                    label="Google AI API Key (for Text)"
                                    value={googleApiKeyInput}
                                    onChange={setGoogleApiKeyInput}
                                    onSave={handleSaveGoogleKey}
                                    onClear={handleClearGoogleKey}
                                    placeholder="Enter your Google AI key"
                                    getLink="https://aistudio.google.com/app/apikey"
                                    getLinkText="Get a Google AI API Key"
                                    statusMessage={
                                        googleKeyIsConfigured ? (
                                            <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Key is configured.</p>
                                        ) : (
                                            <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong> for text.</p>
                                        )
                                    }
                                />
                            )}
                             {service === 'openrouter' && (
                                <>
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
                                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong> for text.</p>
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
                                    </div>
                                </>
                            )}
                            <hr className="border-slate-200" />
                            <ApiKeyInput
                                label="useapi.net API Key (Midjourney)"
                                value={useapiApiKeyInput}
                                onChange={setUseapiApiKeyInput}
                                onSave={handleSaveUseapiKey}
                                onClear={handleClearUseapiKey}
                                placeholder="Enter your useapi.net key"
                                getLink="https://useapi.net/"
                                getLinkText="Get a useapi.net API Key"
                                statusMessage={
                                    useapiKeyIsConfigured ? (
                                        <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Key is configured.</p>
                                    ) : (
                                        <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">Optional (for background images).</p>
                                    )
                                }
                            />
                        </div>
                    </ControlCard>
                </div>

                 <div className="lg:col-span-2 space-y-6">
                    <ControlCard icon={<ImagesIcon />} title="3. Preview & Download">
                         {apiError && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start mb-4" role="alert">
                                <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0 mr-3" />
                                <p className="text-sm">{apiError}</p>
                            </div>
                        )}
                        
                        <div className="flex flex-col items-center">
                            <div className="relative w-full max-w-[400px] aspect-[9/16] bg-slate-200 rounded-2xl overflow-hidden shadow-2xl">
                                <div ref={previewRef} className="w-full h-full relative bg-slate-900 flex flex-col items-center justify-center">
                                    {generatedImage ? (
                                        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-500" style={{ backgroundImage: `url(${generatedImage})` }}></div>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                                    )}
                                    
                                    {/* Overlay Gradients */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40 z-10 mix-blend-multiply"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent z-10 mix-blend-overlay"></div>

                                    {/* Quote Text */}
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-xl border border-white/10 shadow-2xl max-w-[90%]">
                                            <p 
                                                className={`text-white leading-relaxed tracking-wide ${quoteLength === 'long' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl'}`}
                                                style={{ 
                                                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                                                    fontFamily: 'Georgia, serif'
                                                }}
                                            >
                                                {selectedQuote || "YOUR QUOTE HERE"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Action Overlay (Not captured in download) */}
                                <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                                     <button
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="bg-white/90 text-slate-800 p-2 rounded-full shadow-lg hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        title="Download Image"
                                    >
                                        {isDownloading ? <LoadingSpinner className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                
                                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-max">
                                     <button
                                        onClick={handleGenerateImageForQuote}
                                        disabled={isGeneratingImage || !useapiKeyIsConfigured}
                                        className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md text-white text-sm font-semibold rounded-full hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg border border-white/10"
                                        title={useapiKeyIsConfigured ? "Generate new background with AI" : "Add useapi.net key to generate background"}
                                    >
                                        {isGeneratingImage ? <LoadingSpinner className="w-4 h-4" /> : <ImagesIcon className="w-4 h-4" />}
                                        {isGeneratingImage ? (imageGenerationMessage || "Generating...") : "New AI Background"}
                                    </button>
                                 </div>
                            </div>
                        </div>
                    </ControlCard>

                    <ControlCard icon={<VideoIcon />} title="4. Video Prompt (Sora)">
                        <div className="flex flex-col space-y-4">
                            <p className="text-sm text-slate-600">Generate a high-quality, cinematic video prompt based on your selected quote. Perfect for tools like OpenAI Sora.</p>
                            <button
                                onClick={handleGenerateVideoPrompt}
                                disabled={isGeneratingVideo || !selectedQuote}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                                {isGeneratingVideo ? <><LoadingSpinner className="mr-2"/> Creating Prompt...</> : '🎥 Generate Video Prompt'}
                            </button>
                            
                            {videoPrompt && (
                                <div className="relative mt-4">
                                    <textarea
                                        readOnly
                                        value={videoPrompt}
                                        className="w-full h-32 p-3 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleCopyVideoPrompt}
                                        className="absolute top-2 right-2 bg-white text-slate-700 hover:text-purple-600 text-xs font-bold py-1 px-2 rounded border border-slate-200 shadow-sm"
                                    >
                                        Copy
                                    </button>
                                </div>
                            )}
                        </div>
                    </ControlCard>
                </div>
            </div>
        </div>
    );
};

export default QuoteGeneratorPage;

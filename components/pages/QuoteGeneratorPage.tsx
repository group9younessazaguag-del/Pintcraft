
import React, { useState, useEffect } from 'react';
import { generateViralQuotes, generateViralQuotesWithOpenRouter, generateImageWithUseApi } from '../../services/googleAi';
import { ControlCard, ApiKeyInput } from '../Controls';
import SettingsIcon from '../icons/SettingsIcon';
import QuoteIcon from '../icons/QuoteIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import ErrorIcon from '../icons/ErrorIcon';
import CheckIcon from '../icons/CheckIcon';
import ImagesIcon from '../icons/ImagesIcon';
import DownloadIcon from '../icons/DownloadIcon';

interface QuoteGeneratorPageProps {
    userApiKey: string;
    onSetUserApiKey: (key: string) => void;
    useapiApiKey: string;
    onSetUseapiApiKey: (key: string) => void;
    openRouterApiKey: string;
    onSetOpenRouterApiKey: (key: string) => void;
    textModel: string;
}

const QUOTE_CATEGORIES = [
    "Self Love", "Love", "Sad", "Life", "Motivation", "Friendship", "Success", "Funny", "Healing", "Glow Up"
];

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

const QuoteGeneratorPage: React.FC<QuoteGeneratorPageProps> = ({
    userApiKey,
    onSetUserApiKey,
    useapiApiKey,
    onSetUseapiApiKey,
    openRouterApiKey,
    onSetOpenRouterApiKey,
    textModel,
}) => {
    const [quotes, setQuotes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [category, setCategory] = useState('Self Love');
    
    // Image generation state
    const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null);
    const [imageGenerationMessage, setImageGenerationMessage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<{ [key: number]: string }>({});
    const [isDownloadingIndex, setIsDownloadingIndex] = useState<number | null>(null);

    const [service, setService] = useState<'google' | 'openrouter'>('google');
    const [openRouterModel, setOpenRouterModel] = useState('google/gemini-2.5-flash');

    const [googleApiKeyInput, setGoogleApiKeyInput] = useState(userApiKey);
    useEffect(() => { setGoogleApiKeyInput(userApiKey); }, [userApiKey]);
    
    const [useapiApiKeyInput, setUseapiApiKeyInput] = useState(useapiApiKey);
    useEffect(() => { setUseapiApiKeyInput(useapiApiKey); }, [useapiApiKey]);

    const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState(openRouterApiKey);
    useEffect(() => { setOpenRouterApiKeyInput(openRouterApiKey); }, [openRouterApiKey]);


    const handleSaveGoogleKey = () => onSetUserApiKey(googleApiKeyInput.trim());
    const handleClearGoogleKey = () => { setGoogleApiKeyInput(''); onSetUserApiKey(''); };
    
    const handleSaveUseapiKey = () => onSetUseapiApiKey(useapiApiKeyInput.trim());
    const handleClearUseapiKey = () => { setUseapiApiKeyInput(''); onSetUseapiApiKey(''); };

    const handleSaveOpenRouterKey = () => onSetOpenRouterApiKey(openRouterApiKeyInput.trim());
    const handleClearOpenRouterKey = () => { setOpenRouterApiKeyInput(''); onSetOpenRouterApiKey(''); };

    const googleKeyIsConfigured = userApiKey && userApiKey.length > 5;
    const useapiKeyIsConfigured = useapiApiKey && useapiApiKey.length > 5;
    const openRouterKeyIsConfigured = openRouterApiKey && openRouterApiKey.length > 5;

    const handleGenerate = async () => {
        if (service === 'google' && !googleKeyIsConfigured) {
            setApiError("Please provide a Google AI API key in the configuration section.");
            return;
        }
        if (service === 'openrouter' && !openRouterKeyIsConfigured) {
             setApiError("Please provide an OpenRouter API key in the configuration section.");
            return;
        }

        setIsLoading(true);
        setApiError(null);
        setQuotes([]);
        setGeneratedImages({}); // Clear old images

        try {
            let results;
            if (service === 'openrouter') {
                results = await generateViralQuotesWithOpenRouter(openRouterApiKey, openRouterModel, category);
            } else {
                results = await generateViralQuotes(userApiKey, textModel, category);
            }
            setQuotes(results);
        } catch (error: any) {
            setApiError(error.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    const handleGenerateImageForQuote = async (quote: string, index: number) => {
        if (!useapiKeyIsConfigured) {
             setApiError("Please provide a useapi.net API Key in the configuration section to generate images.");
             // Scroll to config
             window.scrollTo({ top: 0, behavior: 'smooth' });
             return;
        }

        setGeneratingImageIndex(index);
        setImageGenerationMessage("Initializing...");
        setApiError(null);

        try {
            // Generating a background image, not containing the text
            const prompt = `aesthetic, cinematic, moody, 8k, minimalist background, soft lighting, dark tones --ar 4:5`;
            const onProgress = (msg: string) => setImageGenerationMessage(msg);
            
            const results = await generateImageWithUseApi(useapiApiKey, prompt, '4:5', onProgress);
            
            if (results && results.length > 0) {
                setGeneratedImages(prev => ({ ...prev, [index]: results[0] }));
            }
        } catch (error: any) {
             setApiError(`Image generation failed for quote #${index + 1}: ${error.message}`);
        } finally {
            setGeneratingImageIndex(null);
            setImageGenerationMessage(null);
        }
    };

    const handleDownloadImage = async (index: number) => {
        const element = document.getElementById(`quote-card-${index}`);
        if (!element) return;

        setIsDownloadingIndex(index);

        try {
             const dataUrl = await window.htmlToImage.toPng(element, {
                 cacheBust: true,
                 pixelRatio: 2,
                 fetchRequestInit: { mode: 'cors' },
                 filter: (node) => {
                     // Exclude buttons from the screenshot
                     return node.tagName !== 'BUTTON';
                 }
             });
             
             const link = document.createElement('a');
             link.href = dataUrl;
             link.download = `quote_${index + 1}.png`;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed', error);
            setApiError("Failed to generate image download. Please try again. Note: CORS issues may prevent download if the image server blocks it.");
        } finally {
            setIsDownloadingIndex(null);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800">Viral Quote Generator</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                    Generate fresh, aesthetic, and deep quotes for your next viral post.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls Column */}
                <div className="lg:col-span-1 space-y-6">
                    <ControlCard icon={<QuoteIcon />} title="1. Generate Quotes">
                         <p className="text-sm text-slate-600 mb-4">
                            Select a category and click below to generate 10 unique, aesthetic quotes.
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-600 mb-2">Quote Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-700 bg-white"
                            >
                                {QUOTE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <><LoadingSpinner className="mr-2"/> Generating...</> : '✨ Generate 10 Quotes'}
                        </button>
                    </ControlCard>

                    <ControlCard icon={<SettingsIcon />} title="2. AI Configuration">
                         <ServiceToggleButton
                                options={[
                                    { id: 'google', name: 'Google AI' },
                                    { id: 'openrouter', name: 'OpenRouter' }
                                ]}
                                selected={service}
                                onSelect={setService}
                            />
                        
                        <div className="mt-4 space-y-6">
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
                                            <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong> for text generation.</p>
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
                                    </div>
                                </>
                            )}

                            <hr className="border-slate-200" />
                            
                             <ApiKeyInput
                                label="useapi.net API Key (for Images)"
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
                                        <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong> for image generation.</p>
                                    )
                                }
                            />
                        </div>
                    </ControlCard>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 min-h-[400px]">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <QuoteIcon className="w-5 h-5 text-pink-500" />
                            Generated Quotes
                        </h3>
                        
                        {apiError && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start mb-4" role="alert">
                                <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0 mr-3" />
                                <p className="text-sm">{apiError}</p>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                <LoadingSpinner className="w-10 h-10" />
                                <p className="mt-4 text-lg font-medium">Crafting deep thoughts...</p>
                            </div>
                        ) : quotes.length > 0 ? (
                            <ul className="space-y-6">
                                {quotes.map((quote, index) => (
                                    <li key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-pink-200 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-pink-300 text-lg font-bold w-6 text-right flex-shrink-0">{index + 1}.</span>
                                            <p className="flex-grow text-slate-700 font-medium font-poppins italic">
                                                "{quote}"
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleGenerateImageForQuote(quote, index)}
                                                    className="p-2 rounded-full bg-white text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Generate Image with UseAPI"
                                                    disabled={generatingImageIndex !== null}
                                                >
                                                    {generatingImageIndex === index ? <LoadingSpinner className="w-4 h-4" /> : <ImagesIcon className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(quote, index)}
                                                    className={`p-2 rounded-full transition-colors ${copiedIndex === index ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400 hover:text-pink-500 hover:bg-pink-50 border border-slate-200'}`}
                                                    title="Copy quote"
                                                >
                                                    {copiedIndex === index ? <CheckIcon className="w-4 h-4" /> : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Loading State for specific item */}
                                        {generatingImageIndex === index && (
                                            <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-100 text-center">
                                                <p className="text-sm text-indigo-600 font-medium animate-pulse">
                                                    {imageGenerationMessage || "Generating image..."}
                                                </p>
                                            </div>
                                        )}

                                        {/* Generated Image Display */}
                                        {generatedImages[index] && (
                                            <div 
                                                id={`quote-card-${index}`} 
                                                className="mt-4 relative group/image w-full overflow-hidden rounded-lg shadow-md aspect-[4/5]"
                                            >
                                                {/* Background Image */}
                                                <img 
                                                    src={generatedImages[index]} 
                                                    alt={`Generated background for: ${quote}`} 
                                                    className="absolute inset-0 w-full h-full object-cover z-0"
                                                    crossOrigin="anonymous"
                                                />
                                                
                                                {/* Dark Overlay for text readability */}
                                                <div className="absolute inset-0 bg-black/40 z-10 transition-opacity"></div>
                                                
                                                {/* Quote Text Overlay */}
                                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center">
                                                    <p className="text-white font-poppins text-3xl sm:text-5xl font-bold leading-tight drop-shadow-lg" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>
                                                        "{quote}"
                                                    </p>
                                                </div>

                                                {/* Download Button */}
                                                <button
                                                    onClick={() => handleDownloadImage(index)}
                                                    disabled={isDownloadingIndex === index}
                                                    className="absolute top-3 right-3 z-30 bg-white/90 text-slate-800 p-2 rounded-full shadow hover:bg-white transition-colors opacity-0 group-hover/image:opacity-100 focus:opacity-100"
                                                    title="Download Image with Text"
                                                >
                                                    {isDownloadingIndex === index ? <LoadingSpinner className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <p className="text-lg">Select a category and click 'Generate'.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteGeneratorPage;

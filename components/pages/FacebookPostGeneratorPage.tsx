import React, { useState, useEffect, useRef } from 'react';
import { generateFacebookPost, generateImage, generateImageWithUseApi } from '../../services/ai';
import type { FacebookPost } from '../../types';
import { ControlCard, ApiKeyInput } from '../Controls';
import SettingsIcon from '../icons/SettingsIcon';
import FacebookIcon from '../icons/FacebookIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import ErrorIcon from '../icons/ErrorIcon';
import ImagesIcon from '../icons/ImagesIcon';
import DownloadIcon from '../icons/DownloadIcon';

interface FacebookPostGeneratorPageProps {
    falAiApiKey: string;
    onSetFalAiApiKey: (key: string) => void;
    useapiApiKey: string;
    onSetUseapiApiKey: (key: string) => void;
    openRouterApiKey: string;
    onSetOpenRouterApiKey: (key: string) => void;
    textModel: string;
}

// Removed ServiceToggleButton as OpenRouter is now exclusive for text AI


const FacebookPostGeneratorPage: React.FC<FacebookPostGeneratorPageProps> = ({
    falAiApiKey,
    onSetFalAiApiKey,
    useapiApiKey,
    onSetUseapiApiKey,
    openRouterApiKey,
    onSetOpenRouterApiKey,
    textModel,
}) => {
    const [topic, setTopic] = useState('');
    const [generatedPost, setGeneratedPost] = useState<FacebookPost | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imageGenerator, setImageGenerator] = useState<'fal' | 'useapi' | null>(null);
    const [imageGenerationMessage, setImageGenerationMessage] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    
    // Default model for OpenRouter, previously it was set for Google AI
    const [openRouterModel, setOpenRouterModel] = useState(textModel || 'google/gemini-2.5-flash'); 

    const [falAiApiKeyInput, setFalAiApiKeyInput] = useState(falAiApiKey);
    useEffect(() => { setFalAiApiKeyInput(falAiApiKey); }, [falAiApiKey]);
    const [useapiApiKeyInput, setUseapiApiKeyInput] = useState(useapiApiKey);
    useEffect(() => { setUseapiApiKeyInput(useapiApiKey); }, [useapiApiKey]);
    const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState(openRouterApiKey);
    useEffect(() => { setOpenRouterApiKeyInput(openRouterApiKey); }, [openRouterApiKey]);

    const [isDownloading, setIsDownloading] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);


    const handleSaveFalKey = () => onSetFalAiApiKey(falAiApiKeyInput.trim());
    const handleClearFalKey = () => { setFalAiApiKeyInput(''); onSetFalAiApiKey(''); };
    const handleSaveUseapiKey = () => onSetUseapiApiKey(useapiApiKeyInput.trim());
    const handleClearUseapiKey = () => { setUseapiApiKeyInput(''); onSetUseapiApiKey(''); };
    const handleSaveOpenRouterKey = () => onSetOpenRouterApiKey(openRouterApiKeyInput.trim());
    const handleClearOpenRouterKey = () => { setOpenRouterApiKeyInput(''); onSetOpenRouterApiKey(''); };


    const falKeyIsConfigured = falAiApiKey && falAiApiKey.length > 5;
    const useapiKeyIsConfigured = useapiApiKey && useapiApiKey.length > 5;
    const openRouterKeyIsConfigured = openRouterApiKey && openRouterApiKey.length > 5;

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setApiError("Please enter a topic for your post.");
            return;
        }
        if (!openRouterKeyIsConfigured) {
            setApiError("Please provide an OpenRouter API key in the configuration section.");
            return;
        }


        setIsLoading(true);
        setApiError(null);
        setGeneratedPost(null);
        setGeneratedImage(null);
        setImageGenerator(null);
        setImageGenerationMessage(null);

        try {
            const postData = await generateFacebookPost(openRouterApiKey, openRouterModel, topic);
            setGeneratedPost(postData);
        } catch (error: any) {
            setApiError(error.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateFbImage = async (generator: 'fal' | 'useapi') => {
        if (!generatedPost?.imagePrompt) {
            setApiError("Generate post content first to get an image prompt.");
            return;
        }

        if (generator === 'fal' && !falKeyIsConfigured) {
            setApiError("Please provide a Fal.ai API key in the configuration section.");
            return;
        }

        if (generator === 'useapi' && !useapiKeyIsConfigured) {
            setApiError("Please provide a useapi.net API key in the configuration section.");
            return;
        }

        setImageGenerator(generator);
        setApiError(null);
        setGeneratedImage(null);
        setImageGenerationMessage(null);

        try {
            let imageUrls: string[] = [];
            if (generator === 'fal') {
                setImageGenerationMessage("Generating image with Fal.ai...");
                const result = await generateImage(falAiApiKey, 'fal-ai/stable-diffusion-v3-medium', generatedPost.imagePrompt, '4:5');
                imageUrls = [result];
            } else if (generator === 'useapi') {
                const onProgress = (msg: string) => setImageGenerationMessage(`useapi.net: ${msg}`);
                onProgress("Task submitted...");
                const results = await generateImageWithUseApi(
                    useapiApiKey,
                    generatedPost.imagePrompt,
                    '4:5',
                    onProgress
                );
                imageUrls = results;
            }
            
            if (imageUrls.length > 0) {
                setGeneratedImage(imageUrls[0]);
            } else {
                throw new Error("The AI model did not return a valid image.");
            }

        } catch (error: any) {
            setApiError(error.message || `An unknown error occurred with ${generator}.`);
        } finally {
            setImageGenerator(null);
            setImageGenerationMessage(null);
        }
    };

    const handleDownloadImage = () => {
        if (!previewRef.current) {
            setApiError("Could not find the image element to download.");
            return;
        }
        
        setIsDownloading(true);
        setApiError(null);
    
        window.htmlToImage.toPng(previewRef.current, { cacheBust: true, pixelRatio: 2, fetchRequestInit: { mode: 'cors' } })
          .then((dataUrl) => {
            const link = document.createElement('a');
            const safeTopic = topic.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = safeTopic ? `${safeTopic}_post_image.png` : 'ai_generated_facebook_post.png';
            link.download = fileName;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((err) => {
            console.error('Download image error:', err);
            setApiError('Could not generate image for download. This can happen if the AI-generated image is from a source that blocks direct access (CORS issue). Try generating the image again.');
          })
          .finally(() => {
            setIsDownloading(false);
          });
    };

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800">AI Facebook Post Generator</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                    Provide a topic and let AI craft an engaging Facebook post with a unique image and relevant hashtags.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls Column */}
                <div className="lg:col-span-1 space-y-6">
                    <ControlCard icon={<FacebookIcon />} title="1. Create Your Post">
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-slate-600 mb-1.5">Topic or Keyword</label>
                            <textarea
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                rows={3}
                                placeholder="e.g., 'easy weeknight dinner recipes', 'benefits of yoga', 'new sci-fi book release'"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || imageGenerator !== null}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <><LoadingSpinner className="mr-2"/> Generating Content...</> : '✨ Generate Post Content'}
                        </button>
                    </ControlCard>

                    <ControlCard icon={<SettingsIcon />} title="2. AI Configuration">
                        <div className="space-y-6">
                            {/* ServiceToggleButton removed */}

                            <ApiKeyInput
                                label="OpenRouter.ai API Key (for Text)"
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
                                label="Fal.ai API Key (for Images)"
                                value={falAiApiKeyInput}
                                onChange={setFalAiApiKeyInput}
                                onSave={handleSaveFalKey}
                                onClear={handleClearFalKey}
                                placeholder="Enter your Fal.ai key"
                                getLink="https://fal.ai/dashboard/keys"
                                getLinkText="Get a Fal.ai API Key"
                                statusMessage={
                                    falKeyIsConfigured ? (
                                        <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Key is configured.</p>
                                    ) : (
                                        <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong> for image generation.</p>
                                    )
                                }
                            />
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
                                        <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong> for this image generator.</p>
                                    )
                                }
                            />
                        </div>
                    </ControlCard>
                </div>

                {/* Preview Column */}
                <div className="lg:col-span-2">
                    <ControlCard icon={<ImagesIcon />} title="3. Generated Post Preview">
                         {apiError && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start" role="alert">
                                <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0 mr-3" />
                                <p className="text-sm">{apiError}</p>
                            </div>
                        )}
                        
                        {isLoading && (
                             <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                                <LoadingSpinner className="w-10 h-10" />
                                <p className="mt-4 text-lg font-medium">Generating content...</p>
                            </div>
                        )}

                        {generatedPost && (
                            <div className="bg-white rounded-lg shadow-md max-w-xl mx-auto border border-slate-200 overflow-hidden">
                                <div className="p-4">
                                    <p className="text-slate-800 whitespace-pre-wrap">{generatedPost.postText}</p>
                                </div>
                                <div className="aspect-[4/5] bg-slate-100 flex items-center justify-center">
                                    {imageGenerator ? (
                                        <div className="text-slate-500 flex flex-col items-center p-4 text-center">
                                            <LoadingSpinner className="w-8 h-8"/>
                                            <p className="mt-2 text-sm font-semibold">{imageGenerationMessage || `Generating with ${imageGenerator}...`}</p>
                                        </div>
                                    ) : generatedImage ? (
                                        <div className="relative w-full h-full">
                                            <div
                                                ref={previewRef}
                                                className="w-full h-full bg-cover bg-center relative"
                                                style={{ backgroundImage: `url(${generatedImage})` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-8 text-center">
                                                    <p className="text-white text-3xl lg:text-4xl font-anton uppercase leading-tight" style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)' }}>
                                                        {generatedPost?.imageText}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleDownloadImage}
                                                disabled={isDownloading}
                                                className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full shadow-md hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                                                title="Download Image"
                                            >
                                                {isDownloading ? <LoadingSpinner className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 p-4 w-full max-w-xs">
                                            <p className="text-sm text-slate-500 text-center mb-2">Image prompt generated. Choose a service to create the image:</p>
                                            <button
                                                onClick={() => handleGenerateFbImage('fal')}
                                                disabled={!falKeyIsConfigured || imageGenerator !== null || isLoading}
                                                title={falKeyIsConfigured ? 'Generate with Fal.ai' : 'Add a Fal.ai key to use'}
                                                className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                            >
                                                ✨ Generate with Fal.ai
                                            </button>
                                            <button
                                                onClick={() => handleGenerateFbImage('useapi')}
                                                disabled={!useapiKeyIsConfigured || imageGenerator !== null || isLoading}
                                                title={useapiKeyIsConfigured ? 'Generate with useapi.net' : 'Add a useapi.net key to use'}
                                                className="w-full flex items-center justify-center px-4 py-2.5 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                            >
                                                🌍 Generate with useapi.net
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="text-blue-600 text-sm">{generatedPost.hashtags.map(h => `#${h}`).join(' ')}</p>
                                </div>
                            </div>
                        )}
                         {!isLoading && !generatedPost && (
                             <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                                <p className="text-lg">Your generated post will appear here.</p>
                            </div>
                        )}
                    </ControlCard>
                </div>
            </div>
        </div>
    );
};

export default FacebookPostGeneratorPage;
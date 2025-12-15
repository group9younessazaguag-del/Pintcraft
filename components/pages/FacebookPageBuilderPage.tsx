import React, { useState, useEffect } from 'react';
import { generateFacebookPageStrategy } from '../../services/ai';
import type { FacebookPageStrategy } from '../../types';
import { ControlCard, ApiKeyInput } from '../Controls';
import SettingsIcon from '../icons/SettingsIcon';
import FacebookIcon from '../icons/FacebookIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import ErrorIcon from '../icons/ErrorIcon';
import LightbulbIcon from '../icons/LightbulbIcon';
import ProfileIcon from '../icons/ProfileIcon';
import PaletteIcon from '../icons/PaletteIcon';
import GroupIcon from '../icons/GroupIcon';
import ActionsIcon from '../icons/ActionsIcon';
import ContentIcon from '../icons/ContentIcon';


interface FacebookPageBuilderPageProps {
    openRouterApiKey: string;
    onSetOpenRouterApiKey: (key: string) => void;
    textModel: string;
}

const StrategySection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-slate-500">{icon}</div>
            <h3 className="text-md font-semibold text-slate-800 tracking-tight">{title}</h3>
        </div>
        <div className="pt-4 mt-4 border-t border-slate-200/80">
            {children}
        </div>
    </div>
);


const FacebookPageBuilderPage: React.FC<FacebookPageBuilderPageProps> = ({
    openRouterApiKey,
    onSetOpenRouterApiKey,
    textModel,
}) => {
    const [niche, setNiche] = useState('');
    const [country, setCountry] = useState('');
    const [strategy, setStrategy] = useState<FacebookPageStrategy | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Default model for OpenRouter, previously it was set for Google AI
    const [openRouterModel, setOpenRouterModel] = useState(textModel || 'google/gemini-2.5-flash'); 
    
    const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState(openRouterApiKey);
    useEffect(() => { setOpenRouterApiKeyInput(openRouterApiKey); }, [openRouterApiKey]);

    const handleSaveOpenRouterKey = () => onSetOpenRouterApiKey(openRouterApiKeyInput.trim());
    const handleClearOpenRouterKey = () => { setOpenRouterApiKeyInput(''); onSetOpenRouterApiKey(''); };

    const openRouterKeyIsConfigured = openRouterApiKey && openRouterApiKey.length > 5;

    const handleGenerate = async () => {
        if (!niche.trim() || !country.trim()) {
            setApiError("Please enter both a niche and a primary country.");
            return;
        }
        if (!openRouterKeyIsConfigured) {
            setApiError("Please provide an OpenRouter API key in the configuration section.");
            return;
        }

        setIsLoading(true);
        setApiError(null);
        setStrategy(null);

        try {
            const result = await generateFacebookPageStrategy(openRouterApiKey, openRouterModel, niche, country);
            setStrategy(result);
        } catch (error: any) {
            setApiError(error.message || "An unknown error occurred while generating the strategy.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800">AI Facebook Page Builder</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                    Generate a complete, money-ready Facebook page strategy in seconds.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls Column */}
                <div className="lg:col-span-1 space-y-6">
                    <ControlCard icon={<FacebookIcon />} title="1. Define Your Page">
                        <div>
                            <label htmlFor="niche" className="block text-sm font-medium text-slate-600 mb-1.5">Niche</label>
                            <input
                                type="text"
                                id="niche"
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                placeholder="e.g., 'Vegan Cooking', 'Home Organization'"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="country" className="block text-sm font-medium text-slate-600 mb-1.5">Primary Country</label>
                            <input
                                type="text"
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="e.g., 'USA', 'UK', 'Canada'"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <><LoadingSpinner className="mr-2"/> Building Strategy...</> : '✨ Build Page Strategy'}
                        </button>
                    </ControlCard>

                    <ControlCard icon={<SettingsIcon />} title="2. AI Configuration">
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
                                    <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong> for strategy generation.</p>
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
                    </ControlCard>
                </div>

                {/* Strategy Display Column */}
                <div className="lg:col-span-2 space-y-6">
                    {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start" role="alert">
                            <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0 mr-3" />
                            <p className="text-sm">{apiError}</p>
                        </div>
                    )}
                    
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
                            <LoadingSpinner className="w-10 h-10" />
                            <p className="mt-4 text-lg font-medium">Building your page strategy...</p>
                            <p className="text-sm">This may take a moment.</p>
                        </div>
                    )}

                    {!isLoading && !strategy && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
                            <p className="text-lg text-center">Your generated page strategy will appear here.</p>
                        </div>
                    )}

                    {strategy && (
                        <>
                            <StrategySection icon={<LightbulbIcon className="w-6 h-6"/>} title="Page Name Ideas & Categories">
                                <ul className="list-disc list-inside space-y-1 text-slate-700">
                                    {strategy.page_name_ideas.map((name, i) => <li key={i}>{name}</li>)}
                                </ul>
                                <p className="text-xs text-slate-500 mt-3 font-semibold">Categories: {strategy.categories.join(', ')}</p>
                            </StrategySection>

                            <StrategySection icon={<ProfileIcon className="w-6 h-6"/>} title="Page Bio (90 Chars)">
                                <p className="text-slate-700 italic">"{strategy.page_bio_90chars}"</p>
                            </StrategySection>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StrategySection icon={<PaletteIcon className="w-6 h-6"/>} title="Logo Brief">
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <p><strong className="font-semibold text-slate-800">Style:</strong> {strategy.logo_brief.style}</p>
                                        <p><strong className="font-semibold text-slate-800">Motifs:</strong> {strategy.logo_brief.motifs.join(', ')}</p>
                                        <p><strong className="font-semibold text-slate-800">Notes:</strong> {strategy.logo_brief.notes}</p>
                                    </div>
                                </StrategySection>
                                <StrategySection icon={<PaletteIcon className="w-6 h-6"/>} title="Cover Photo Brief">
                                     <div className="space-y-2 text-sm text-slate-600">
                                        <p><strong className="font-semibold text-slate-800">Concept:</strong> {strategy.cover_brief.concept}</p>
                                        <p><strong className="font-semibold text-slate-800">Layout Notes:</strong> {strategy.cover_brief.layout_notes}</p>
                                    </div>
                                </StrategySection>
                            </div>
                            
                            <StrategySection icon={<GroupIcon className="w-6 h-6"/>} title="Public Group Strategy">
                                <div className="space-y-3 text-sm text-slate-600">
                                    <p><strong className="font-semibold text-slate-800">Name:</strong> {strategy.public_group.name}</p>
                                    <p><strong className="font-semibold text-slate-800">Description:</strong> {strategy.public_group.description}</p>
                                    <p><strong className="font-semibold text-slate-800">First Pinned Post:</strong> {strategy.public_group.first_pinned_post}</p>
                                </div>
                            </StrategySection>

                            <StrategySection icon={<ActionsIcon className="w-6 h-6"/>} title="Page Likes Ad Campaign">
                                 <div className="space-y-3 text-sm text-slate-600">
                                    <p><strong className="font-semibold text-slate-800">Headline:</strong> {strategy.page_likes_ad.headline}</p>
                                    <p><strong className="font-semibold text-slate-800">Primary Text:</strong> {strategy.page_likes_ad.primary_text}</p>
                                    <p className="font-mono text-xs bg-slate-100 p-2 rounded-md"><strong className="font-semibold text-slate-800">Image Prompt:</strong> {strategy.page_likes_ad.image_prompt}</p>
                                    <p><strong className="font-semibold text-slate-800">Placements:</strong> {strategy.page_likes_ad.placements.join(', ')}</p>
                                </div>
                            </StrategySection>

                             <StrategySection icon={<ContentIcon className="w-6 h-6"/>} title="First 20 Post Themes">
                                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-sm grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                    {strategy.first_20_post_themes.map((theme, i) => <li key={i}>{theme}</li>)}
                                </ol>
                            </StrategySection>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacebookPageBuilderPage;
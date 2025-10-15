import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

import type { TemplateData } from '../types';
import Controls from './Controls';
import TemplatePreview from './TemplatePreview';
import ApiKeyModal from './ApiKeyModal';
import { generateKeywords, generateImage } from '../services/googleAi';
import useLocalStorage from '../hooks/useLocalStorage';
import useUser from '../hooks/useUser';
import LimitReachedModal from './LimitReachedModal';

import DownloadIcon from './icons/DownloadIcon';
import ErrorIcon from './icons/ErrorIcon';

const TEMPLATES = [
    { id: '5', name: 'Classic' }, { id: '20', name: 'Split' }, { id: '12', name: 'Modern' }, { id: '3', name: 'Brush Stroke' }, { id: '2', name: 'Border' }, { id: '8', name: 'Editorial' }, { id: '6', name: 'Clean Grid' }, { id: '11', name: 'Minimalist Quote' }, { id: '22', name: 'Tasty Recipe' }, { id: '7', name: 'Detailed Recipe' }, { id: '23', name: 'Trendy Collage' }, { id: '18', name: 'Retro Vibes' }, { id: '15', name: 'Product Spotlight' }, { id: '16', name: 'Quote Overlay' }, { id: '19', name: 'Shop The Look' }, { id: '1', name: 'Before & After' }, { id: '4', name: 'Checklist' }, { id: '14', name: 'New Article' }, { id: '13', name: 'Mood Board' }, { id: '17', name: 'Recipe Card' }, { id: '9', name: 'Gourmet Close Up' }, { id: '21', name: 'Step-by-Step Guide' }, { id: '10', name: 'Minimalist Ingredients' }, { id: '24', name: 'Elegant Recipe Card' }, { id: '25', name: 'Bold Title Overlay' }, { id: '26', name: 'Magazine Featurette' }, { id: '27', name: 'Horizontal Split' }, { id: '28', name: 'Ingredient Spotlight' }, { id: '29', name: 'Pin For Later' }, { id: '30', name: 'Luxury Dark Mode' }, { id: '31', name: 'Holiday Cheer' }
].sort((a, b) => a.name.localeCompare(b.name));

const getInitialData = (): TemplateData => ({
  id: `pin-${Date.now()}`,
  title: 'My Awesome Pin Title',
  subtitle: 'A catchy and descriptive subtitle that grabs attention',
  website: 'yourwebsite.com',
  backgroundImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop',
  backgroundImage2: null,
  backgroundImage3: null,
  templateId: '5',
  pinSize: 'standard',
  boardName: 'My Awesome Board',
  keywords: '',
});

const GeneratorInterface: React.FC = () => {
    const [apiKey, setApiKey] = useLocalStorage<string>('google-api-key', '');
    const isApiKeySetInEnv = !!process.env.API_KEY;
    const isApiKeySet = isApiKeySetInEnv || !!apiKey;
    const effectiveApiKey = isApiKeySetInEnv ? undefined : apiKey;

    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    
    const [activeData, setActiveData] = useState<TemplateData>(getInitialData());
    
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    const { user, canGenerate, decrementGenerations, upgradeToPro } = useUser();
    const [showLimitModal, setShowLimitModal] = useState(false);

    const previewRef = useRef<HTMLDivElement>(null);

    const handleDataChange = (field: keyof TemplateData, value: any) => {
        setActiveData(prev => ({ ...prev, [field]: value }));
    };

    const handleAiAction = async (action: () => Promise<void>) => {
        if (!isApiKeySet) {
            setShowApiKeyModal(true);
            return;
        }
        if (canGenerate) {
            setShowLimitModal(true);
            return;
        }
        setError(null);
        try {
            await action();
            decrementGenerations();
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred with the AI service.');
            console.error(e);
        }
    };

    const handleGenerateKeywords = async () => {
        setIsLoading(prev => ({ ...prev, keywords: true }));
        await handleAiAction(async () => {
            const newKeywords = await generateKeywords(activeData.title, effectiveApiKey);
            handleDataChange('keywords', newKeywords);
        });
        setIsLoading(prev => ({ ...prev, keywords: false }));
    };
    
    const handleGenerateImage = async (field: 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3') => {
        const promptInput = document.getElementById(field) as HTMLInputElement;
        const prompt = promptInput?.value;
        if (!prompt) {
            setError("Please enter a prompt for the image.");
            return;
        }
        setIsLoading(prev => ({ ...prev, [field]: true }));
        await handleAiAction(async () => {
            const imageUrl = await generateImage(prompt, effectiveApiKey);
            if(imageUrl) {
                handleDataChange(field, imageUrl);
            } else {
                setError("Failed to generate image. Please try a different prompt.");
            }
        });
        setIsLoading(prev => ({ ...prev, [field]: false }));
    };

    const handleDownload = useCallback(async () => {
        if (previewRef.current) {
            try {
                const canvas = await html2canvas(previewRef.current, {
                    allowTaint: true,
                    useCORS: true,
                    scale: 2, // Higher resolution
                    backgroundColor: null,
                });
                canvas.toBlob((blob) => {
                    if (blob) {
                        saveAs(blob, `${activeData.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
                    }
                });
            } catch (error) {
                console.error("Error generating image from component:", error);
                setError("Could not download the pin image. Cross-origin images might be causing an issue.");
            }
        }
    }, [activeData.title]);
    
    return (
        <div className="container mx-auto px-4 md:px-8 py-8">
            <main className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <Controls 
                        data={activeData}
                        onDataChange={handleDataChange}
                        templates={TEMPLATES}
                        onGenerateKeywords={handleGenerateKeywords}
                        onGenerateImage={handleGenerateImage}
                        isKeywordsLoading={!!isLoading.keywords}
                        isImageLoading={!!isLoading.backgroundImage || !!isLoading.backgroundImage2 || !!isLoading.backgroundImage3}
                   />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-24">
                        <TemplatePreview ref={previewRef} data={activeData} />
                        <div className="mt-4 flex gap-3">
                            <button onClick={handleDownload} className="w-full px-4 py-2.5 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 flex items-center justify-center gap-2">
                                <DownloadIcon className="w-5 h-5" />
                                <span>Download Pin</span>
                            </button>
                        </div>
                         {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-3">
                                <ErrorIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Generation Error</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {showApiKeyModal && <ApiKeyModal onClose={() => setShowApiKeyModal(false)} />}
            {showLimitModal && <LimitReachedModal onClose={() => setShowLimitModal(false)} onUpgrade={() => {
                setShowLimitModal(false);
                upgradeToPro();
            }} />}
        </div>
    );
};

export default GeneratorInterface;

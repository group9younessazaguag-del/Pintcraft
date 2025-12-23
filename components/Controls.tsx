
import React, { useState, useEffect } from 'react';
import type { TemplateData, TemplateId, PinSize, CsvRow, ImageAspectRatio } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import SettingsIcon from './icons/SettingsIcon';
import PaletteIcon from './icons/PaletteIcon';
import PinContentIcon from './icons/PinContentIcon';
import CsvIcon from './icons/CsvIcon';
import ImagesIcon from './icons/ImagesIcon';
import ActionsIcon from './icons/ActionsIcon';
import BulkIcon from './icons/BulkIcon';
import LoadingSpinner from './icons/LoadingSpinner';

export interface ControlsProps {
  data: TemplateData;
  onFieldChange: (field: keyof TemplateData, value: any) => void;
  onImageUpload: (file: File, imageNumber: 1 | 2 | 3) => void;
  onGenerateImage: (imageNumber: 1 | 2 | 3) => void;
  onGenerateImageWithMidjourney: (imageNumber: 1 | 2 | 3) => void;
  onGenerateImageWithMidApiAi: (imageNumber: 1 | 2 | 3, throwOnError?: boolean, overridePrompt?: string, onProgressUpdate?: (message: string) => void) => void;
  onGenerateImageWithImagineApi: (imageNumber: 1 | 2 | 3, throwOnError?: boolean, overridePrompt?: string, onProgressUpdate?: (message: string) => void) => void;
  onGenerateImageWithUseApi: (imageNumber: 1 | 2 | 3, throwOnError?: boolean, overridePrompt?: string, onProgressUpdate?: (message: string) => void) => void;
  onGenerateDescription: () => void;
  onGenerateKeywords: () => void;
  onGenerateShortTitle: () => void;
  onDownload: () => void;
  isLoading: boolean;
  isGeneratingImage: { [key: number]: boolean };
  isGeneratingMidjourneyImage: { [key: number]: boolean };
  isGeneratingMidjourney2Image: { [key: number]: boolean };
  isGeneratingImagineImage: { [key: number]: boolean };
  isGeneratingUseApiImage: { [key: number]: boolean };
  isGeneratingDescription: boolean;
  isGeneratingKeywords: boolean;
  isGeneratingShortTitle: boolean;
  onCsvUpload: (file: File) => void;
  onNextRow: () => void;
  onPrevRow: () => void;
  csvData: CsvRow[];
  currentRowIndex: number | null;
  onBulkGeneration: (imageGenerator: 'fal' | 'midjourney' | 'midjourney2' | 'imagine' | 'useapi', resume: boolean) => void;
  isBulkGenerating: boolean;
  bulkMessage: string;
  apiError: { type: string; message: string; helpLink?: string } | null;
  generatedAssets: { zip: Blob; csv: Blob } | null;
  onDownloadGeneratedAssets: () => void;
  lastCompletedRowIndex: number | null;
  onResetBulkGeneration: () => void;
  openRouterApiKey: string; // OpenRouter is now the primary text AI key
  onSetOpenRouterApiKey: (key: string) => void; // Setter for OpenRouter key
  onSetFalAiApiKey: (key: string) => void;
  falAiApiKey: string;
  apiframeApiKey: string;
  onSetApiframeApiKey: (key: string) => void;
  midapiApiKey: string;
  onSetMidapiApiKey: (key: string) => void;
  imagineApiKey: string;
  onSetImagineApiKey: (key: string) => void;
  useapiApiKey: string;
  onSetUseapiApiKey: (key: string) => void;
  bulkJobType: 'fal' | 'midjourney' | 'midjourney2' | 'imagine' | 'useapi' | null;
}

export const ControlCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-slate-500">{icon}</div>
            <h3 className="text-md font-semibold text-slate-800 tracking-tight">{title}</h3>
        </div>
        <div className="space-y-4 pt-4 border-t border-slate-200/80">
            {children}
        </div>
    </div>
);


const InputField: React.FC<{data: TemplateData; onFieldChange: (field: keyof TemplateData, value: any) => void; id: keyof TemplateData, label: string, type?: string, placeholder?: string, min?: string, description?: string}> = ({ data, onFieldChange, id, label, type = 'text', placeholder, min, description }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        type={type}
        id={id}
        value={data[id] as string || ''}
        onChange={(e) => onFieldChange(id, e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900 transition-colors duration-200"
        placeholder={placeholder}
        min={min}
      />
      {description && <p className="text-xs text-slate-500 mt-1.5">{description}</p>}
    </div>
);

const SelectField: React.FC<{ value: string; onChange: (value: string) => void; id: string; label: string; children: React.ReactNode }> = ({ value, onChange, id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
        <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900 appearance-none bg-no-repeat bg-right pr-8 transition-colors duration-200"
            style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}
        >
           {children}
        </select>
    </div>
);

const ToggleButtonGrid: React.FC<{ label: string; options: {id: string; name: string}[]; selected: string; onSelect: (id: string) => void; gridCols?: string }> = ({ label, options, selected, onSelect, gridCols = 'grid-cols-2' }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">{label}</label>
        <div className={`grid ${gridCols} gap-2`}>
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


const ImageUpload: React.FC<{
    id: 1 | 2 | 3, 
    label: string; 
    isGeneratingImage: { [key: number]: boolean }; 
    isGeneratingMidjourneyImage: { [key: number]: boolean };
    isGeneratingMidjourney2Image: { [key: number]: boolean };
    isGeneratingImagineImage: { [key: number]: boolean };
    isGeneratingUseApiImage: { [key: number]: boolean };
    onImageUpload: (file: File, imageNumber: 1 | 2 | 3) => void; 
    onGenerateImage: (imageNumber: 1 | 2 | 3) => void; 
    onGenerateImageWithMidjourney: (imageNumber: 1 | 2 | 3) => void;
    onGenerateImageWithMidApiAi: (imageNumber: 1 | 2 | 3) => void;
    onGenerateImageWithImagineApi: (imageNumber: 1 | 2 | 3) => void;
    onGenerateImageWithUseApi: (imageNumber: 1 | 2 | 3) => void;
    isBulkGenerating: boolean; 
    isConfigured: boolean;
    isMjConfigured: boolean;
    isMj2Configured: boolean;
    isImagineConfigured: boolean;
    isUseApiConfigured: boolean;
}> = ({ id, label, isGeneratingImage, onImageUpload, onGenerateImage, isBulkGenerating, isConfigured, isGeneratingMidjourneyImage, onGenerateImageWithMidjourney, isMjConfigured, isGeneratingMidjourney2Image, onGenerateImageWithMidApiAi, isMj2Configured, isGeneratingImagineImage, onGenerateImageWithImagineApi, isImagineConfigured, isGeneratingUseApiImage, onGenerateImageWithUseApi, isUseApiConfigured }) => {
    const isGeneratingFal = isGeneratingImage[id];
    const isGeneratingMj = isGeneratingMidjourneyImage[id];
    const isGeneratingMj2 = isGeneratingMidjourney2Image[id];
    const isGeneratingImagine = isGeneratingImagineImage[id];
    const isGeneratingUseApi = isGeneratingUseApiImage[id];
    const isAnyGenerating = isGeneratingFal || isGeneratingMj || isGeneratingMj2 || isGeneratingImagine || isGeneratingUseApi;

    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
            <label htmlFor={`file-upload-${id}`} className="w-full block text-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors duration-200">
                Upload Image
            </label>
            <input id={`file-upload-${id}`} type="file" className="sr-only" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                    onImageUpload(e.target.files[0], id);
                }
            }} />
            <div className="flex flex-col gap-2 mt-2">
                <button
                    type="button"
                    onClick={() => onGenerateImage(id)}
                    disabled={isAnyGenerating || isBulkGenerating}
                    title={isConfigured ? 'Generate a high-quality image with Fal.ai based on the pin title' : 'Generate a basic placeholder image based on the pin title (add a Fal.ai API key to use AI)'}
                    className="w-full flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors duration-200"
                >
                {isGeneratingFal ? (
                    <>
                    <LoadingSpinner className="mr-2"/>
                    Generating...
                    </>
                ) : '✨ Generate with Fal.ai'}
                </button>
                <button
                    type="button"
                    onClick={() => onGenerateImageWithMidjourney(id)}
                    disabled={isAnyGenerating || isBulkGenerating || !isMjConfigured}
                    title={isMjConfigured ? 'Generate a high-quality image with Midjourney (via APIFrame.ai)' : 'Add an APIFrame.ai API key to use Midjourney'}
                    className="w-full flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors duration-200"
                >
                {isGeneratingMj ? (
                    <>
                    <LoadingSpinner className="mr-2"/>
                    Generating (~60s)...
                    </>
                ) : '🎨 Generate with Midjourney'}
                </button>
                 <button
                    type="button"
                    onClick={() => onGenerateImageWithMidApiAi(id)}
                    disabled={isAnyGenerating || isBulkGenerating || !isMj2Configured}
                    title={isMj2Configured ? 'Generate a high-quality image with midapi.ai' : 'Add a midapi.ai API key to use this generator'}
                    className="w-full flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors duration-200"
                >
                {isGeneratingMj2 ? (
                    <>
                    <LoadingSpinner className="mr-2"/>
                    Generating (~60s)...
                    </>
                ) : '🚀 Generate with midapi.ai'}
                </button>
                <button
                    type="button"
                    onClick={() => onGenerateImageWithImagineApi(id)}
                    disabled={isAnyGenerating || isBulkGenerating || !isImagineConfigured}
                    title={isImagineConfigured ? 'Generate a high-quality image with ImagineAPI' : 'Add an ImagineAPI key to use this generator'}
                    className="w-full flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors duration-200"
                >
                {isGeneratingImagine ? (
                    <>
                    <LoadingSpinner className="mr-2"/>
                    Generating (~30s)...
                    </>
                ) : '🖼️ Generate with ImagineAPI'}
                </button>
                <button
                    type="button"
                    onClick={() => onGenerateImageWithUseApi(id)}
                    disabled={isAnyGenerating || isBulkGenerating || !isUseApiConfigured}
                    title={isUseApiConfigured ? 'Generate a high-quality image with useapi.net' : 'Add a useapi.net API key to use this generator'}
                    className="w-full flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors duration-200"
                >
                {isGeneratingUseApi ? (
                    <>
                    <LoadingSpinner className="mr-2"/>
                    Generating (~60s)...
                    </>
                ) : '🌍 Generate with useapi.net'}
                </button>
            </div>
        </div>
    );
};

export const ApiKeyInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    onClear: () => void;
    placeholder: string;
    getLink: string;
    getLinkText: string;
    statusMessage: React.ReactNode;
}> = ({ label, value, onChange, onSave, onClear, placeholder, getLink, getLinkText, statusMessage }) => {
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={isKeyVisible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                    type="button"
                    onClick={() => setIsKeyVisible(!isKeyVisible)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
                    aria-label={isKeyVisible ? "Hide API key" : "Show API key"}
                >
                    {isKeyVisible ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={onSave} className="flex-1 px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors">
                    Save
                </button>
                {value && (
                    <button onClick={onClear} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors">
                        Clear
                    </button>
                )}
            </div>
            <div className="mt-3 text-xs space-y-2">
                {statusMessage}
                <a href={getLink} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:text-pink-800 hover:underline !mt-3 w-full text-left block">
                    {getLinkText} &rarr;
                </a>
            </div>
        </div>
    );
};

// Moved outside component as it's a static configuration
const CANVAS_OPTIONS = {
    sizes: [
      { id: 'standard', name: 'Standard Pin (3:4)' },
      { id: 'long', name: 'Long Pin (9:16)' },
      { id: 'extraLong', name: 'Tall Pin (5:12)' },
    ],
    aspectRatios: [
        { id: '1:1', name: 'Square (1:1)' },
        { id: '3:4', name: 'Portrait (3:4)' },
        { id: '9:16', name: 'Long (9:16)' },
    ],
};

export const SettingsAndCustomizeControls: React.FC<ControlsProps> = ({ data, onFieldChange, onSetFalAiApiKey, falAiApiKey, openRouterApiKey, onSetOpenRouterApiKey, apiframeApiKey, onSetApiframeApiKey, midapiApiKey, onSetMidapiApiKey, imagineApiKey, onSetImagineApiKey, useapiApiKey, onSetUseapiApiKey }) => {
    // FIX: Update templateCount and templateOptions to reflect all templates (including restored 72-85 and 86-90)
    const templateIds = [
        ...Array.from({ length: 23 }, (_, i) => `${i + 1}`), // Templates 1-23
        ...Array.from({ length: 32 }, (_, i) => `${i + 59}`), // Templates 59-90
    ];
    const templateOptions = templateIds.map(id => ({ id, name: id }));
      
    const [falAiApiKeyInput, setFalAiApiKeyInput] = useState(falAiApiKey);
    const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState(openRouterApiKey);
    const [apiframeApiKeyInput, setApiframeApiKeyInput] = useState(apiframeApiKey);
    const [midapiApiKeyInput, setMidapiApiKeyInput] = useState(midapiApiKey);
    const [imagineApiKeyInput, setImagineApiKeyInput] = useState(imagineApiKey);
    const [useapiApiKeyInput, setUseapiApiKeyInput] = useState(useapiApiKey);

    useEffect(() => { setFalAiApiKeyInput(falAiApiKey); }, [falAiApiKey]);
    useEffect(() => { setOpenRouterApiKeyInput(openRouterApiKey); }, [openRouterApiKey]);
    useEffect(() => { setApiframeApiKeyInput(apiframeApiKey); }, [apiframeApiKey]);
    useEffect(() => { setMidapiApiKeyInput(midapiApiKey); }, [midapiApiKey]);
    useEffect(() => { setImagineApiKeyInput(imagineApiKey); }, [imagineApiKey]);
    useEffect(() => { setUseapiApiKeyInput(useapiApiKey); }, [useapiApiKey]);
    
    const handleSaveFalKey = () => onSetFalAiApiKey(falAiApiKeyInput.trim());
    const handleClearFalKey = () => { setFalAiApiKeyInput(''); onSetFalAiApiKey(''); };
    const handleSaveOpenRouterKey = () => onSetOpenRouterApiKey(openRouterApiKeyInput.trim());
    const handleClearOpenRouterKey = () => { setOpenRouterApiKeyInput(''); onSetOpenRouterApiKey(''); };
    const handleSaveApiframeKey = () => onSetApiframeApiKey(apiframeApiKeyInput.trim());
    const handleClearApiframeKey = () => { setOpenRouterApiKeyInput(''); onSetOpenRouterApiKey(''); };
    const handleSaveMidapiKey = () => onSetMidapiApiKey(midapiApiKeyInput.trim());
    const handleClearMidapiKey = () => { setMidapiApiKeyInput(''); onSetMidapiApiKey(''); };
    const handleSaveImagineKey = () => onSetImagineApiKey(imagineApiKeyInput.trim());
    const handleClearImagineKey = () => { setImagineApiKeyInput(''); onSetImagineApiKey(''); };
    const handleSaveUseapiKey = () => onSetUseapiApiKey(useapiApiKeyInput.trim());
    const handleClearUseapiKey = () => { setUseapiApiKeyInput(''); onSetUseapiApiKey(''); };


    const openRouterKeyIsConfigured = openRouterApiKey && openRouterApiKey.length > 5;
    const falKeyIsConfigured = falAiApiKey && falAiApiKey.length > 5;
    const mjKeyIsConfigured = apiframeApiKey && apiframeApiKey.length > 5;
    const mj2KeyIsConfigured = midapiApiKey && midapiApiKey.length > 5;
    const imagineKeyIsConfigured = imagineApiKey && imagineApiKey.length > 5;
    const useapiKeyIsConfigured = useapiApiKey && useapiApiKey.length > 5;

    return (
        <>
            <ControlCard icon={<PaletteIcon />} title="Customize Your Pin">
                <ToggleButtonGrid 
                    label="Template"
                    options={templateOptions}
                    selected={data.templateId}
                    onSelect={(id) => onFieldChange('templateId', id as TemplateId)}
                    gridCols="grid-cols-4"
                />
                <ToggleButtonGrid 
                    label="Pin Canvas Size"
                    options={CANVAS_OPTIONS.sizes}
                    selected={data.pinSize}
                    onSelect={(id) => onFieldChange('pinSize', id as PinSize)}
                    gridCols="grid-cols-3"
                />
                 <ToggleButtonGrid 
                    label="AI Image Aspect Ratio"
                    options={CANVAS_OPTIONS.aspectRatios}
                    selected={data.imageAspectRatio}
                    onSelect={(id) => onFieldChange('imageAspectRatio', id as ImageAspectRatio)}
                    gridCols="grid-cols-3"
                />
             </ControlCard>
            <ControlCard icon={<SettingsIcon />} title="AI Configuration">
                <div className="space-y-6">
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
                                <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Your OpenRouter key is saved in this browser.</p>
                            ) : (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>API Key Required:</strong> Add a key to enable AI text generation.</p>
                            )
                        }
                    />
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
                                <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Your Fal.ai key is saved in this browser.</p>
                            ) : (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>API Key Recommended:</strong> Add a key to enable AI image generation.</p>
                            )
                        }
                    />
                    <ApiKeyInput
                        label="APIFrame.ai Key (for Midjourney)"
                        value={apiframeApiKeyInput}
                        onChange={setApiframeApiKeyInput}
                        onSave={handleSaveApiframeKey}
                        onClear={handleClearApiframeKey}
                        placeholder="Enter your APIFrame.ai key"
                        getLink="https://app.apiframe.ai/auth"
                        getLinkText="Get an APIFrame.ai API Key"
                        statusMessage={
                            mjKeyIsConfigured ? (
                                <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Your APIFrame.ai key is saved in this browser.</p>
                            ) : (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>API Key Recommended:</strong> Add a key to enable Midjourney image generation.</p>
                            )
                        }
                    />
                    <ApiKeyInput
                        label="midapi.ai API Key"
                        value={midapiApiKeyInput}
                        onChange={setMidapiApiKeyInput}
                        onSave={handleSaveMidapiKey}
                        onClear={handleClearMidapiKey}
                        placeholder="Enter your midapi.ai key"
                        getLink="https://midapi.ai/"
                        getLinkText="Get a midapi.ai API Key"
                        statusMessage={
                            mj2KeyIsConfigured ? (
                                <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Your midapi.ai key is saved in this browser.</p>
                            ) : (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>API Key Recommended:</strong> Add a key to enable midapi.ai image generation.</p>
                            )
                        }
                    />
                    <ApiKeyInput
                        label="ImagineAPI API Key"
                        value={imagineApiKeyInput}
                        onChange={setImagineApiKeyInput}
                        onSave={handleSaveImagineKey}
                        onClear={handleClearImagineKey}
                        placeholder="Enter your ImagineAPI key"
                        getLink="https://imagineapi.dev/"
                        getLinkText="Get an ImagineAPI API Key"
                        statusMessage={
                            imagineKeyIsConfigured ? (
                                <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Your ImagineAPI key is saved in this browser.</p>
                            ) : (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>API Key Recommended:</strong> Add a key to enable ImagineAPI image generation.</p>
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
                                <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Your useapi.net key is saved in this browser.</p>
                            ) : (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>API Key Recommended:</strong> Add a key to enable useapi.net image generation.</p>
                            )
                        }
                    />
                </div>
                 <div className="!mt-6 pt-4 border-t border-slate-200/80 space-y-3">
                    <InputField
                        data={data}
                        onFieldChange={onFieldChange}
                        id="imageModel"
                        label="Image Generation Model (Fal.ai)"
                        description={!falKeyIsConfigured ? 'Add Fal.ai key to use.' : 'e.g., fal-ai/recraft/v3/text-to-image'}
                    />
                    <InputField
                        data={data}
                        onFieldChange={onFieldChange}
                        id="textModel"
                        label="Text Generation Model (OpenRouter)"
                         description={!openRouterKeyIsConfigured ? 'Add OpenRouter key to use.' : 'e.g., google/gemini-2.5-flash'}
                    />
                </div>
            </ControlCard>
        </>
    );
};


export const PinContentControls: React.FC<ControlsProps> = ({ data, onFieldChange, openRouterApiKey, onGenerateDescription, isGeneratingDescription, onGenerateKeywords, isGeneratingKeywords, onGenerateShortTitle, isGeneratingShortTitle, isBulkGenerating }) => {
    const TITLE_RECOMMENDED_MAX_LENGTH = 35;
    const TITLE_HARD_MAX_LENGTH = 100;
    const titleLength = data.title?.length || 0;
    const openRouterKeyIsConfigured = openRouterApiKey && openRouterApiKey.length > 5;

    const getTitleCounterColor = () => {
        if (titleLength > TITLE_HARD_MAX_LENGTH) return 'text-red-600';
        if (titleLength > TITLE_RECOMMENDED_MAX_LENGTH) return 'text-amber-600';
        return 'text-slate-500';
    };

    return (
        <ControlCard icon={<PinContentIcon />} title="Pin Content">
             <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-1.5">Title</label>
                <div className="relative">
                    <input
                        type="text"
                        id="title"
                        value={data.title || ''}
                        onChange={(e) => onFieldChange('title', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                     <button
                        type="button"
                        onClick={onGenerateShortTitle}
                        disabled={isGeneratingShortTitle || isBulkGenerating || !openRouterKeyIsConfigured || titleLength <= TITLE_RECOMMENDED_MAX_LENGTH}
                        title={!openRouterKeyIsConfigured ? "Add an OpenRouter API key to enable" : titleLength <= TITLE_RECOMMENDED_MAX_LENGTH ? "Title is already a good length" : "Use AI to shorten the title"}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed rounded-r-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500 transition-colors"
                    >
                        {isGeneratingShortTitle ? <LoadingSpinner className="mr-2" /> : '✨'}
                    </button>
                </div>
                <div className="text-xs text-right mt-1.5">
                    <span className={getTitleCounterColor()}>{titleLength} / {TITLE_RECOMMENDED_MAX_LENGTH}</span>
                </div>
            </div>

            <InputField data={data} onFieldChange={onFieldChange} id="board" label="Pinterest Board" />
            <InputField data={data} onFieldChange={onFieldChange} id="website" label="Link" />
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1.5">Description</label>
                <textarea
                    id="description"
                    value={data.description || ''}
                    onChange={(e) => onFieldChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900 transition-colors duration-200"
                    rows={4}
                    placeholder="A short, enticing description of your pin."
                />
                <button
                    type="button"
                    onClick={onGenerateDescription}
                    disabled={isGeneratingDescription || isBulkGenerating}
                    title={openRouterKeyIsConfigured ? 'Generate a high-quality description with OpenRouter AI' : 'Generate a basic placeholder description'}
                    className="w-full mt-2 flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors duration-200"
                >
                    {isGeneratingDescription ? (
                        <><LoadingSpinner className="mr-2"/> Generating...</>
                    ) : '✨ Generate Description'}
                </button>
            </div>
             <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-slate-600 mb-1.5">Keywords</label>
                <textarea
                    id="keywords"
                    value={data.keywords || ''}
                    onChange={(e) => onFieldChange('keywords', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900 transition-colors duration-200"
                    rows={3}
                    placeholder="Comma-separated keywords for your pin."
                />
                <button
                    type="button"
                    onClick={onGenerateKeywords}
                    disabled={isGeneratingKeywords || isBulkGenerating}
                    title={openRouterKeyIsConfigured ? 'Generate keywords with OpenRouter AI' : 'Generate basic placeholder keywords'}
                    className="w-full mt-2 flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors duration-200"
                >
                    {isGeneratingKeywords ? (
                        <><LoadingSpinner className="mr-2"/> Generating...</>
                    ) : '✨ Generate Keywords'}
                </button>
            </div>
        </ControlCard>
    );
};

export const CsvAndActionsControls: React.FC<ControlsProps> = (props) => {
    const { 
        data, 
        onFieldChange, 
        onImageUpload, 
        onGenerateImage,
        onGenerateImageWithMidjourney,
        onGenerateImageWithMidApiAi,
        onGenerateImageWithImagineApi,
        onGenerateImageWithUseApi,
        onDownload, 
        isLoading, 
        isGeneratingImage,
        isGeneratingMidjourneyImage,
        isGeneratingMidjourney2Image,
        isGeneratingImagineImage,
        isGeneratingUseApiImage,
        onCsvUpload,
        onNextRow,
        onPrevRow,
        csvData,
        currentRowIndex,
        onBulkGeneration,
        isBulkGenerating,
        bulkMessage,
        apiError,
        generatedAssets,
        onDownloadGeneratedAssets,
        lastCompletedRowIndex,
        onResetBulkGeneration,
        falAiApiKey,
        apiframeApiKey,
        midapiApiKey,
        imagineApiKey,
        useapiApiKey,
        bulkJobType,
    } = props;

    const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          onCsvUpload(file);
        }
    };

    // FIX: Ensure all split-layout templates are accounted for in multi-image logic (restored missing ranges)
    const needsImage2 = ['2', '4', '7', '11', '13', '15', '16', '19', '22', '23', '48', '49', '50', '51', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '90'].includes(data.templateId);
    const needsImage3 = ['7', '15', '19', '22'].includes(data.templateId);
    const isQuotaError = apiError?.type === 'quota';
    const hasPausedJob = lastCompletedRowIndex !== null;
    const falKeyIsConfigured = falAiApiKey && falAiApiKey.length > 5;
    const mjKeyIsConfigured = apiframeApiKey && apiframeApiKey.length > 5;
    const mj2KeyIsConfigured = midapiApiKey && midapiApiKey.length > 5;
    const imagineKeyIsConfigured = imagineApiKey && imagineApiKey.length > 5;
    const useapiKeyIsConfigured = useapiApiKey && useapiApiKey.length > 5;

    const getBulkJobName = () => {
        if (bulkJobType === 'midjourney') return 'Midjourney';
        if (bulkJobType === 'midjourney2') return 'midapi.ai';
        if (bulkJobType === 'imagine') return 'ImagineAPI';
        if (bulkJobType === 'useapi') return 'useapi.net';
        return 'Fal.ai';
    };

    return (
        <>
            <ControlCard icon={<CsvIcon />} title="CSV Import">
                <div>
                    <label htmlFor="csv-upload" className="block text-sm font-medium text-slate-600 mb-1.5">Upload CSV</label>
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleCsvFileSelect}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer transition-colors duration-200"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Needs 'Title'. 'Description' and 'Keywords' are used if available, or auto-generated if empty.</p>
                </div>
                {csvData.length > 0 && currentRowIndex !== null && (
                    <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg border border-slate-200">
                    <button
                        onClick={onPrevRow}
                        disabled={currentRowIndex === 0 || isBulkGenerating}
                        className="p-2 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
                        aria-label="Previous Row"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1-0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <span className="text-sm font-medium text-slate-800">
                        Row {currentRowIndex + 1} of {csvData.length}
                    </span>
                    <button
                        onClick={onNextRow}
                        disabled={currentRowIndex === csvData.length - 1 || isBulkGenerating}
                        className="p-2 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
                        aria-label="Next Row"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1-0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                )}
            </ControlCard>

             <ControlCard icon={<ImagesIcon />} title="Images">
                <ImageUpload id={1} label="Background Image 1" isGeneratingImage={isGeneratingImage} onImageUpload={onImageUpload} onGenerateImage={onGenerateImage} isBulkGenerating={isBulkGenerating} isConfigured={falKeyIsConfigured} isGeneratingMidjourneyImage={isGeneratingMidjourneyImage} onGenerateImageWithMidjourney={onGenerateImageWithMidjourney} isMjConfigured={mjKeyIsConfigured} isGeneratingMidjourney2Image={isGeneratingMidjourney2Image} onGenerateImageWithMidApiAi={onGenerateImageWithMidApiAi} isMj2Configured={mj2KeyIsConfigured} isGeneratingImagineImage={isGeneratingImagineImage} onGenerateImageWithImagineApi={onGenerateImageWithImagineApi} isImagineConfigured={imagineKeyIsConfigured} isGeneratingUseApiImage={isGeneratingUseApiImage} onGenerateImageWithUseApi={onGenerateImageWithUseApi} isUseApiConfigured={useapiKeyIsConfigured} />
                {needsImage2 && (
                    <ImageUpload id={2} label="Background Image 2" isGeneratingImage={isGeneratingImage} onImageUpload={onImageUpload} onGenerateImage={onGenerateImage} isBulkGenerating={isBulkGenerating} isConfigured={falKeyIsConfigured} isGeneratingMidjourneyImage={isGeneratingMidjourneyImage} onGenerateImageWithMidjourney={onGenerateImageWithMidjourney} isMjConfigured={mjKeyIsConfigured} isGeneratingMidjourney2Image={isGeneratingMidjourney2Image} onGenerateImageWithMidApiAi={onGenerateImageWithMidApiAi} isMj2Configured={mj2KeyIsConfigured} isGeneratingImagineImage={isGeneratingImagineImage} onGenerateImageWithImagineApi={onGenerateImageWithImagineApi} isImagineConfigured={imagineKeyIsConfigured} isGeneratingUseApiImage={isGeneratingUseApiImage} onGenerateImageWithUseApi={onGenerateImageWithUseApi} isUseApiConfigured={useapiKeyIsConfigured} />
                )}
                {needsImage3 && (
                    <ImageUpload id={3} label="Background Image 3" isGeneratingImage={isGeneratingImage} onImageUpload={onImageUpload} onGenerateImage={onGenerateImage} isBulkGenerating={isBulkGenerating} isConfigured={falKeyIsConfigured} isGeneratingMidjourneyImage={isGeneratingMidjourneyImage} onGenerateImageWithMidjourney={onGenerateImageWithMidjourney} isMjConfigured={mjKeyIsConfigured} isGeneratingMidjourney2Image={isGeneratingMidjourney2Image} onGenerateImageWithMidApiAi={onGenerateImageWithMidApiAi} isMj2Configured={mj2KeyIsConfigured} isGeneratingImagineImage={isGeneratingImagineImage} onGenerateImageWithImagineApi={onGenerateImageWithImagineApi} isImagineConfigured={imagineKeyIsConfigured} isGeneratingUseApiImage={isGeneratingUseApiImage} onGenerateImageWithUseApi={onGenerateImageWithUseApi} isUseApiConfigured={useapiKeyIsConfigured} />
                )}
             </ControlCard>

             <ControlCard icon={<ActionsIcon />} title="Single Pin Actions">
                 <button
                    onClick={onDownload}
                    disabled={isLoading || isBulkGenerating}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                    {isLoading ? 'Generating...' : <><DownloadIcon className="w-5 h-5 mr-2" /> Download Pin</>}
                </button>
             </ControlCard>

            <ControlCard icon={<BulkIcon />} title="Bulk Actions">
                <div className="grid grid-cols-2 gap-4">
                    {data.useRandomPinsPerDay ? (
                        <>
                            <InputField data={data} onFieldChange={onFieldChange} id="pinsPerDayMin" label="Min Pins" type="number" min="1" placeholder="e.g., 3" />
                            <InputField data={data} onFieldChange={onFieldChange} id="pinsPerDayMax" label="Max Pins" type="number" min="1" placeholder="e.g., 5" />
                        </>
                    ) : (
                        <InputField data={data} onFieldChange={onFieldChange} id="pinsPerDay" label="Pins Per Day" type="number" min="1" placeholder="e.g., 3" />
                    )}
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-600 mb-1.5">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={data.startDate}
                            onChange={(e) => onFieldChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900"
                        />
                    </div>
                </div>
                <div className="mt-2 mb-2 flex items-center">
                    <input
                        type="checkbox"
                        id="useRandomPinsPerDay"
                        checked={data.useRandomPinsPerDay}
                        onChange={(e) => onFieldChange('useRandomPinsPerDay', e.target.checked)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useRandomPinsPerDay" className="ml-2 block text-sm text-slate-600">
                        Randomize daily count?
                    </label>
                </div>
                <div>
                    <InputField data={data} onFieldChange={onFieldChange} id="mediaUrlPrefix" label="Media URL Prefix" placeholder="e.g., http://yourwebsite.com/images/" />
                    <p className="text-xs text-slate-500 mt-1.5">This URL will be prefixed to the generated image filenames in the CSV.</p>
                </div>
                <div className="space-y-2 mt-4">
                    {hasPausedJob ? (
                        <button
                            onClick={() => bulkJobType && onBulkGeneration(bulkJobType, true)}
                            disabled={isBulkGenerating || isQuotaError || !bulkJobType}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                            {isBulkGenerating ? (
                                <><LoadingSpinner className="mr-3" /> Resuming...</>
                            ) : (
                                `Resume from Row ${lastCompletedRowIndex + 2} with ${getBulkJobName()}`
                            )}
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => onBulkGeneration('fal', false)}
                                disabled={isBulkGenerating || csvData.length === 0 || isQuotaError}
                                title={csvData.length === 0 ? 'Please upload a CSV first' : 'Generate all pins using Fal.ai for images'}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isBulkGenerating && bulkJobType === 'fal' ? (
                                    <><LoadingSpinner className="mr-3" /> Generating...</>
                                ) : '✨ Generate with Fal.ai & CSV'}
                            </button>
                             <button
                                onClick={() => onBulkGeneration('midjourney', false)}
                                disabled={isBulkGenerating || csvData.length === 0 || isQuotaError || !mjKeyIsConfigured}
                                title={!mjKeyIsConfigured ? 'Add APIFrame.ai key to use Midjourney' : 'Generate all pins using Midjourney for images'}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isBulkGenerating && bulkJobType === 'midjourney' ? (
                                    <><LoadingSpinner className="mr-3" /> Generating...</>
                                ) : '🎨 Generate with Midjourney & CSV'}
                            </button>
                            <button
                                onClick={() => onBulkGeneration('midjourney2', false)}
                                disabled={isBulkGenerating || csvData.length === 0 || isQuotaError || !mj2KeyIsConfigured}
                                title={!mj2KeyIsConfigured ? 'Add a midapi.ai API key to use this generator' : 'Generate all pins using midapi.ai for images'}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isBulkGenerating && bulkJobType === 'midjourney2' ? (
                                    <><LoadingSpinner className="mr-3" /> Generating...</>
                                ) : '🚀 Generate with midapi.ai & CSV'}
                            </button>
                            <button
                                onClick={() => onBulkGeneration('imagine', false)}
                                disabled={isBulkGenerating || csvData.length === 0 || isQuotaError || !imagineKeyIsConfigured}
                                title={!imagineKeyIsConfigured ? 'Add an ImagineAPI key to use this generator' : 'Generate all pins using ImagineAPI for images'}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isBulkGenerating && bulkJobType === 'imagine' ? (
                                    <><LoadingSpinner className="mr-3" /> Generating...</>
                                ) : '🖼️ Generate with ImagineAPI & CSV'}
                            </button>
                            <button
                                onClick={() => onBulkGeneration('useapi', false)}
                                disabled={isBulkGenerating || csvData.length === 0 || isQuotaError || !useapiKeyIsConfigured}
                                title={!useapiKeyIsConfigured ? 'Add a useapi.net API key to use this generator' : 'Generate all pins using useapi.net for images'}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isBulkGenerating && bulkJobType === 'useapi' ? (
                                    <><LoadingSpinner className="mr-3" /> Generating...</>
                                ) : '🌍 Generate with useapi.net & CSV'}
                            </button>
                        </div>
                    )}
                    {hasPausedJob && !isBulkGenerating && (
                         <button
                            onClick={onResetBulkGeneration}
                            className="w-full text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 py-2 rounded-lg transition-colors"
                        >
                            Cancel and Start Over
                        </button>
                    )}
                </div>
                {bulkMessage && (
                    <p className="text-sm text-center text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200 mt-2">{bulkMessage}</p>
                )}
                {generatedAssets && !isBulkGenerating && (
                    <button
                        onClick={onDownloadGeneratedAssets}
                        className="w-full flex items-center justify-center mt-2 px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Download Files (.zip & .csv)
                    </button>
                )}
            </ControlCard>
        </>
    );
};

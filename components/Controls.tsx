import React, { useState, useEffect } from 'react';
import type { TemplateData, TemplateId, PinSize, CsvRow } from '../types';
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
  onGenerateDescription: () => void;
  onGenerateKeywords: () => void;
  onDownload: () => void;
  isLoading: boolean;
  isGeneratingImage: { [key: number]: boolean };
  isGeneratingDescription: boolean;
  isGeneratingKeywords: boolean;
  onCsvUpload: (file: File) => void;
  onNextRow: () => void;
  onPrevRow: () => void;
  csvData: CsvRow[];
  currentRowIndex: number | null;
  onBulkGeneration: (resume: boolean) => void;
  isBulkGenerating: boolean;
  bulkMessage: string;
  apiError: { type: string; message: string; helpLink?: string } | null;
  generatedAssets: { zip: Blob; csv: Blob } | null;
  onDownloadGeneratedAssets: () => void;
  lastCompletedRowIndex: number | null;
  onResetBulkGeneration: () => void;
  onSetUserApiKey: (key: string) => void;
  isApiKeyFromEnv: boolean;
  userApiKey: string;
  onSetFalAiApiKey: (key: string) => void;
  falAiApiKey: string;
}

const ControlCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
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


const InputField: React.FC<{data: TemplateData; onFieldChange: (field: keyof TemplateData, value: string) => void; id: keyof TemplateData, label: string, type?: string, placeholder?: string, min?: string, description?: string}> = ({ data, onFieldChange, id, label, type = 'text', placeholder, min, description }) => (
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
            style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}
        >
           {children}
        </select>
    </div>
);

const ToggleButtonGrid: React.FC<{ label: string; options: {id: string; name: string}[]; selected: string; onSelect: (id: string) => void; }> = ({ label, options, selected, onSelect }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">{label}</label>
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


const ImageUpload: React.FC<{id: 1 | 2 | 3, label: string; isGeneratingImage: { [key: number]: boolean }; onImageUpload: (file: File, imageNumber: 1 | 2 | 3) => void; onGenerateImage: (imageNumber: 1 | 2 | 3) => void; isBulkGenerating: boolean; isConfigured: boolean;}> = ({ id, label, isGeneratingImage, onImageUpload, onGenerateImage, isBulkGenerating, isConfigured }) => {
    const isGenerating = isGeneratingImage[id];
    return (
        <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
        <div className="flex gap-2">
            <label htmlFor={`file-upload-${id}`} className="flex-1 text-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors duration-200">
                Upload
            </label>
            <input id={`file-upload-${id}`} type="file" className="sr-only" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                onImageUpload(e.target.files[0], id);
                }
            }} />
            <button
                type="button"
                onClick={() => onGenerateImage(id)}
                disabled={isGenerating || isBulkGenerating}
                title={isConfigured ? 'Generate a high-quality image with Fal.ai based on the pin title' : 'Generate a basic placeholder image based on the pin title (add a Fal.ai API key to use AI)'}
                className="flex-1 flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors duration-200"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner className="mr-2"/>
                  Generating...
                </>
              ) : '✨ Generate'}
            </button>
        </div>
        </div>
    );
  };

const ApiKeyInput: React.FC<{
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

export const SettingsAndCustomizeControls: React.FC<ControlsProps> = ({ data, onFieldChange, onSetUserApiKey, isApiKeyFromEnv, userApiKey, onSetFalAiApiKey, falAiApiKey }) => {
    const options: {templates: {id: TemplateId, name: string}[], sizes: {id: PinSize, name:string}[]} = {
        templates: [
          { id: 'classic', name: 'Classic' },
          { id: 'split', name: 'Split View' },
          { id: 'modern', name: 'Modern' },
          { id: 'brush', name: 'Brush Stroke' },
          { id: 'border', name: 'Border' },
          { id: 'editorial', name: 'Editorial' },
          { id: 'clean-grid', name: 'Clean Grid' },
          { id: 'minimalist-quote', name: 'Minimalist Quote' },
          { id: 'tasty-recipe', name: 'Tasty Recipe' },
          { id: 'trendy-collage', name: 'Trendy Collage' },
          { id: 'retro-vibes', name: 'Retro Vibes' },
          { id: 'product-spotlight', name: 'Product Spotlight' },
          { id: 'infographic', name: 'Infographic' },
          { id: 'quote-overlay', name: 'Quote Overlay' },
          { id: 'shop-the-look', name: 'Shop the Look' },
          { id: 'before-after', name: 'Before & After' },
        ],
        sizes: [
          { id: 'standard', name: 'Standard (3:4)' },
          { id: 'long', name: 'Long (9:16)' },
        ],
      };
      
    const [googleApiKeyInput, setGoogleApiKeyInput] = useState(userApiKey);
    const [falApiKeyInput, setFalApiKeyInput] = useState(falAiApiKey);

    useEffect(() => { setGoogleApiKeyInput(userApiKey); }, [userApiKey]);
    useEffect(() => { setFalApiKeyInput(falAiApiKey); }, [falAiApiKey]);

    const handleSaveGoogleKey = () => onSetUserApiKey(googleApiKeyInput.trim());
    const handleClearGoogleKey = () => { setGoogleApiKeyInput(''); onSetUserApiKey(''); };
    
    const handleSaveFalKey = () => onSetFalAiApiKey(falApiKeyInput.trim());
    const handleClearFalKey = () => { setFalApiKeyInput(''); onSetFalAiApiKey(''); };

    const googleKeyIsConfigured = isApiKeyFromEnv || (userApiKey && userApiKey.length > 5);
    const falKeyIsConfigured = falAiApiKey && falAiApiKey.length > 5;

    return (
        <>
            <ControlCard icon={<SettingsIcon />} title="AI Configuration">
                <div className="space-y-6">
                    <ApiKeyInput
                        label="Google AI API Key (for Text)"
                        value={googleApiKeyInput}
                        onChange={setGoogleApiKeyInput}
                        onSave={handleSaveGoogleKey}
                        onClear={handleClearGoogleKey}
                        placeholder={isApiKeyFromEnv && !userApiKey ? 'Using secure environment key' : 'Enter your Google AI key'}
                        getLink="https://aistudio.google.com/app/apikey"
                        getLinkText="Get a Google AI API Key"
                        statusMessage={
                            userApiKey ? (
                                <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Your Google AI key is saved in this browser.</p>
                            ) : isApiKeyFromEnv ? (
                                <p className="text-slate-600 p-2 bg-slate-100 rounded-lg border border-slate-200">A secure environment key is active. Saving a key here will override it.</p>
                            ) : (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>API Key Recommended:</strong> Add a key to enable AI text generation.</p>
                            )
                        }
                    />

                    <ApiKeyInput
                        label="Fal.ai API Key (for Images)"
                        value={falApiKeyInput}
                        onChange={setFalApiKeyInput}
                        onSave={handleSaveFalKey}
                        onClear={handleClearFalKey}
                        placeholder="Enter your Fal.ai key"
                        getLink="https://fal.ai/dashboard/keys"
                        getLinkText="Get a Fal.ai API Key"
                        statusMessage={
                            falAiApiKey ? (
                                <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Your Fal.ai key is saved in this browser.</p>
                            ) : (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>API Key Recommended:</strong> Add a key to enable AI image generation.</p>
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
                        description={!falKeyIsConfigured ? 'Add Fal.ai key to use.' : 'e.g., fal-ai/stable-diffusion-v3-medium'}
                    />
                    <InputField
                        data={data}
                        onFieldChange={onFieldChange}
                        id="textModel"
                        label="Text Generation Model (Google AI)"
                         description={!googleKeyIsConfigured ? 'Add Google key to use.' : 'e.g., gemini-2.5-flash'}
                    />
                </div>
            </ControlCard>
             <ControlCard icon={<PaletteIcon />} title="Customize Your Pin">
                <ToggleButtonGrid 
                    label="Template"
                    options={options.templates}
                    selected={data.templateId}
                    onSelect={(id) => onFieldChange('templateId', id as TemplateId)}
                />
                <ToggleButtonGrid 
                    label="Pin Size"
                    options={options.sizes}
                    selected={data.pinSize}
                    onSelect={(id) => onFieldChange('pinSize', id as PinSize)}
                />
             </ControlCard>
        </>
    );
};


export const PinContentControls: React.FC<ControlsProps> = ({ data, onFieldChange, isApiKeyFromEnv, userApiKey, onGenerateDescription, isGeneratingDescription, onGenerateKeywords, isGeneratingKeywords, isBulkGenerating }) => {
    const googleKeyIsConfigured = isApiKeyFromEnv || (userApiKey && userApiKey.length > 5);

    return (
        <ControlCard icon={<PinContentIcon />} title="Pin Content">
            <InputField data={data} onFieldChange={onFieldChange} id="title" label="Title" />
            <InputField data={data} onFieldChange={onFieldChange} id="subtitle" label="Pinterest Board" />
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
                    title={googleKeyIsConfigured ? 'Generate a high-quality description with Google AI' : 'Generate a basic placeholder description'}
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
                    title={googleKeyIsConfigured ? 'Generate keywords with Google AI' : 'Generate basic placeholder keywords'}
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

export const CsvAndActionsControls: React.FC<ControlsProps> = ({ 
    data, 
    onFieldChange, 
    onImageUpload, 
    onGenerateImage, 
    onDownload, 
    isLoading, 
    isGeneratingImage,
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
    isApiKeyFromEnv,
    userApiKey,
    falAiApiKey,
}) => {
    const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          onCsvUpload(file);
        }
    };

    const needsImage2 = ['split', 'brush', 'clean-grid', 'trendy-collage', 'product-spotlight', 'before-after', 'shop-the-look'].includes(data.templateId);
    const needsImage3 = ['clean-grid', 'shop-the-look'].includes(data.templateId);
    const isQuotaError = apiError?.type === 'quota';
    const hasPausedJob = lastCompletedRowIndex !== null;
    const falKeyIsConfigured = falAiApiKey && falAiApiKey.length > 5;

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
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
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
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                )}
            </ControlCard>

             <ControlCard icon={<ImagesIcon />} title="Images">
                <ImageUpload id={1} label="Background Image 1" isGeneratingImage={isGeneratingImage} onImageUpload={onImageUpload} onGenerateImage={onGenerateImage} isBulkGenerating={isBulkGenerating} isConfigured={falKeyIsConfigured} />
                {needsImage2 && (
                    <ImageUpload id={2} label="Background Image 2" isGeneratingImage={isGeneratingImage} onImageUpload={onImageUpload} onGenerateImage={onGenerateImage} isBulkGenerating={isBulkGenerating} isConfigured={falKeyIsConfigured} />
                )}
                {needsImage3 && (
                    <ImageUpload id={3} label="Background Image 3" isGeneratingImage={isGeneratingImage} onImageUpload={onImageUpload} onGenerateImage={onGenerateImage} isBulkGenerating={isBulkGenerating} isConfigured={falKeyIsConfigured} />
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
                    <InputField data={data} onFieldChange={onFieldChange} id="pinsPerDay" label="Pins Per Day" type="number" min="1" placeholder="e.g., 3" />
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
                <div>
                    <InputField data={data} onFieldChange={onFieldChange} id="mediaUrlPrefix" label="Media URL Prefix" placeholder="e.g., http://yourwebsite.com/images/" />
                    <p className="text-xs text-slate-500 mt-1.5">This URL will be prefixed to the generated image filenames in the CSV.</p>
                </div>
                <div className="space-y-2">
                    {hasPausedJob ? (
                        <button
                            onClick={() => onBulkGeneration(true)}
                            disabled={isBulkGenerating || isQuotaError}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                            {isBulkGenerating ? (
                                <><LoadingSpinner className="mr-3" /> Resuming...</>
                            ) : (
                                `Resume from Row ${lastCompletedRowIndex + 2}`
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => onBulkGeneration(false)}
                            disabled={isBulkGenerating || csvData.length === 0 || isQuotaError}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                            {isBulkGenerating ? (
                                <><LoadingSpinner className="mr-3" /> Generating...</>
                            ) : '✨ Generate All Pins & CSV'}
                        </button>
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

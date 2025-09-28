
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
  onDownload: () => void;
  isLoading: boolean;
  isGeneratingImage: { [key: number]: boolean };
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


const InputField: React.FC<{data: TemplateData; onFieldChange: (field: keyof TemplateData, value: string) => void; id: 'title' | 'subtitle' | 'website' | 'imagePrompt' | 'mediaUrlPrefix' | 'pinsPerDay', label: string, type?: string, placeholder?: string, min?: string}> = ({ data, onFieldChange, id, label, type = 'text', placeholder, min }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        type={type}
        id={id}
        value={data[id] || ''}
        onChange={(e) => onFieldChange(id, e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900 transition-colors duration-200"
        placeholder={placeholder}
        min={min}
      />
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


const ImageUpload: React.FC<{id: 1 | 2 | 3, label: string; isGeneratingImage: { [key: number]: boolean }; onImageUpload: (file: File, imageNumber: 1 | 2 | 3) => void; onGenerateImage: (imageNumber: 1 | 2 | 3) => void; isBulkGenerating: boolean; isQuotaError: boolean; isApiKeyFromEnv: boolean; userApiKey: string}> = ({ id, label, isGeneratingImage, onImageUpload, onGenerateImage, isBulkGenerating, isQuotaError, isApiKeyFromEnv, userApiKey }) => {
    const isGenerating = isGeneratingImage[id];
    const isConfigured = isApiKeyFromEnv || (userApiKey && userApiKey.length > 5);
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
                disabled={isGenerating || isBulkGenerating || isQuotaError || !isConfigured}
                className="flex-1 flex justify-center items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors duration-200"
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

export const SettingsAndCustomizeControls: React.FC<ControlsProps> = ({ data, onFieldChange, onSetUserApiKey, isApiKeyFromEnv, userApiKey }) => {
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
      
    const [apiKeyInput, setApiKeyInput] = useState(userApiKey);

    useEffect(() => {
        setApiKeyInput(userApiKey);
    }, [userApiKey]);

    const handleSaveKey = () => {
        onSetUserApiKey(apiKeyInput.trim());
    };

    const handleClearKey = () => {
        setApiKeyInput('');
        onSetUserApiKey('');
    };

    return (
        <>
            <ControlCard icon={<SettingsIcon />} title="Model Settings">
                <div>
                    <label htmlFor="apiKeyInput" className="block text-sm font-medium text-slate-600 mb-1.5">API Key</label>
                    <div className="flex gap-2">
                        <input
                            id="apiKeyInput"
                            type="text"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder={isApiKeyFromEnv && !userApiKey ? 'Using secure environment key (override here)' : 'Enter your Google AI API key'}
                            className="flex-grow w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <button
                            onClick={handleSaveKey}
                            className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                    <div className="mt-2 text-xs">
                        {userApiKey ? (
                            <div className="flex justify-between items-center text-green-900 bg-green-50 border border-green-200 p-2 rounded-lg">
                                <span className="font-semibold">Key is saved in your browser.</span>
                                <button onClick={handleClearKey} className="underline font-semibold hover:text-green-900/80">
                                    Clear Key
                                </button>
                            </div>
                        ) : isApiKeyFromEnv ? (
                            <p className="text-slate-600 p-2 bg-slate-100 rounded-lg border border-slate-200">
                                A secure environment key is active. Saving a key here will override it for this browser.
                            </p>
                        ) : (
                            <p className="text-red-600 font-medium">
                                API Key is required to use AI features.
                            </p>
                        )}
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:text-pink-800 hover:underline pt-2 w-full text-left block">
                            Get a Google AI API Key
                        </a>
                    </div>
                </div>

                <SelectField value={data.imageModel} onChange={(value) => onFieldChange('imageModel', value)} id="imageModel" label="Image Generation Model">
                    <option value="imagen-4.0-generate-001">Imagen 4.0</option>
                </SelectField>
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


export const PinContentControls: React.FC<ControlsProps> = ({ data, onFieldChange }) => {
    const styleOptions = [
        { id: 'photorealistic', name: 'Photorealistic' },
        { id: 'realistic', name: 'Realistic' },
        { id: 'fantasy', name: 'Fantasy Art' },
        { id: 'anime', name: 'Anime' },
        { id: 'minimalist', name: 'Minimalist' },
        { id: 'vintage', name: 'Vintage' },
        { id: 'vibrant', name: 'Vibrant' },
    ];
    return (
        <ControlCard icon={<PinContentIcon />} title="Pin Content">
            <InputField data={data} onFieldChange={onFieldChange} id="title" label="Title" />
            <InputField data={data} onFieldChange={onFieldChange} id="subtitle" label="Pinterest Board" />
            <InputField data={data} onFieldChange={onFieldChange} id="website" label="Link" />
            <InputField data={data} onFieldChange={onFieldChange} id="imagePrompt" label="Image Prompt (optional)" />
            <SelectField value={data.imageStyle} onChange={(value) => onFieldChange('imageStyle', value)} id="imageStyle" label="Image Style">
                {styleOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                ))}
            </SelectField>
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
    const isConfigured = isApiKeyFromEnv || (userApiKey && userApiKey.length > 5);

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
                    <p className="text-xs text-slate-500 mt-1.5">Needs 'Title' column. 'Pinterest Board', 'Link', 'Description', and 'Keywords' are used if available.</p>
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
                <ImageUpload id={1} label="Background Image 1" {...{isGeneratingImage, onImageUpload, onGenerateImage, isBulkGenerating, isQuotaError, isApiKeyFromEnv, userApiKey}}/>
                {needsImage2 && (
                    <ImageUpload id={2} label="Background Image 2" {...{isGeneratingImage, onImageUpload, onGenerateImage, isBulkGenerating, isQuotaError, isApiKeyFromEnv, userApiKey}}/>
                )}
                {needsImage3 && (
                    <ImageUpload id={3} label="Background Image 3" {...{isGeneratingImage, onImageUpload, onGenerateImage, isBulkGenerating, isQuotaError, isApiKeyFromEnv, userApiKey}}/>
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
                            disabled={isBulkGenerating || isQuotaError || !isConfigured}
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
                            disabled={isBulkGenerating || csvData.length === 0 || isQuotaError || !isConfigured}
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

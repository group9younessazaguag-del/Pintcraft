
import React from 'react';
import type { TemplateData, TemplateId, PinSize, CsvRow } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface ControlsProps {
  data: TemplateData;
  onFieldChange: (field: keyof TemplateData, value: string) => void;
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
  onAutoGenerateAll: () => void;
  isBulkGenerating: boolean;
  bulkMessage: string;
  apiError: string;
  generatedAssets: { zip: Blob; csv: Blob } | null;
  onDownloadGeneratedAssets: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
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
    onAutoGenerateAll,
    isBulkGenerating,
    bulkMessage,
    apiError,
    generatedAssets,
    onDownloadGeneratedAssets
}) => {
  
  const InputField: React.FC<{id: 'title' | 'subtitle' | 'website' | 'imagePrompt' | 'apiKey', label: string, type?: string, placeholder?: string}> = ({ id, label, type = 'text', placeholder }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        id={id}
        value={data[id] || ''}
        onChange={(e) => onFieldChange(id, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/50 text-gray-900"
        placeholder={placeholder}
      />
    </div>
  );

  const ImageUpload: React.FC<{id: 1 | 2 | 3, label: string}> = ({ id, label }) => {
    const isGenerating = isGeneratingImage[id];
    return (
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor={`file-upload-${id}`} className="flex-1 text-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                📤 Upload
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
                className="flex-1 flex justify-center items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : '✨ Generate'}
            </button>
        </div>
        </div>
    );
  };
  
  const options: {templates: {id: TemplateId, name: string}[], sizes: {id: PinSize, name: string}[]} = {
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
    ],
    sizes: [
      { id: 'standard', name: 'Standard (3:4)' },
      { id: 'long', name: 'Long (9:16)' },
    ],
  };

  const styleOptions = [
      { id: 'photorealistic', name: 'Photorealistic' },
      { id: 'realistic', name: 'Realistic' },
      { id: 'fantasy', name: 'Fantasy Art' },
      { id: 'anime', name: 'Anime' },
      { id: 'minimalist', name: 'Minimalist' },
      { id: 'vintage', name: 'Vintage' },
      { id: 'vibrant', name: 'Vibrant' },
  ];

  const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCsvUpload(file);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-xl space-y-6 border">
      {apiError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold">An error occurred</p>
            <p>{apiError}</p>
        </div>
      )}
      <div className="space-y-4 pb-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">⚙️ Model Settings</h3>
        <div>
            <InputField id="apiKey" label="Google AI API Key" type="password" placeholder="Enter your API key" />
            <p className="text-xs text-gray-500 mt-1">ℹ️ Your API key is stored locally in your browser and is not shared.</p>
        </div>
        <div>
            <label htmlFor="imageModel" className="block text-sm font-medium text-gray-700 mb-1">Image Generation Model</label>
            <select
                id="imageModel"
                value={data.imageModel}
                onChange={(e) => onFieldChange('imageModel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/50 text-gray-900 appearance-none bg-no-repeat bg-right pr-8"
                style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}
            >
                <option value="imagen-4.0-generate-001">Imagen 4.0</option>
            </select>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">🎨 Customize Your Pin</h2>
      
        <div className="space-y-4 mt-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <div className="grid grid-cols-2 gap-2">
                    {options.templates.map(template => (
                        <button 
                            key={template.id}
                            onClick={() => onFieldChange('templateId', template.id)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 shadow-sm ${data.templateId === template.id ? 'bg-gray-800 text-white scale-105 shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {template.name}
                        </button>
                    ))}
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pin Size</label>
                <div className="grid grid-cols-2 gap-2">
                    {options.sizes.map(size => (
                        <button 
                            key={size.id}
                            onClick={() => onFieldChange('pinSize', size.id)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 shadow-sm ${data.pinSize === size.id ? 'bg-gray-800 text-white scale-105 shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {size.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">✍️ Pin Content</h3>
        <InputField id="title" label="Title" />
        <InputField id="subtitle" label="Pinterest Board" />
        <InputField id="website" label="Link" />
        <InputField id="imagePrompt" label="Image Prompt (optional)" />
        <div>
            <label htmlFor="imageStyle" className="block text-sm font-medium text-gray-700 mb-1">Image Style</label>
            <select
                id="imageStyle"
                value={data.imageStyle}
                onChange={(e) => onFieldChange('imageStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/50 text-gray-900 appearance-none bg-no-repeat bg-right pr-8"
                style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}
            >
                {styleOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="border-t pt-6 space-y-4">
         <h3 className="text-lg font-semibold text-gray-800">🚀 CSV Import</h3>
         <div>
            <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-1">Upload CSV</label>
            <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCsvFileSelect}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">ℹ️ Needs 'Title' column. 'Pinterest Board', 'Link', 'Description', and 'Keywords' are used if available.</p>
         </div>
         {csvData.length > 0 && currentRowIndex !== null && (
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg border">
              <button
                  onClick={onPrevRow}
                  disabled={currentRowIndex === 0 || isBulkGenerating}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous Row"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
              </button>
              <span className="text-sm font-medium text-gray-800">
                  Row {currentRowIndex + 1} of {csvData.length}
              </span>
              <button
                  onClick={onNextRow}
                  disabled={currentRowIndex === csvData.length - 1 || isBulkGenerating}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next Row"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
              </button>
          </div>
         )}
      </div>

      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">🖼️ Images</h3>
        <ImageUpload id={1} label="Background Image 1" />
        {['split', 'brush', 'clean-grid', 'trendy-collage', 'product-spotlight'].includes(data.templateId) && (
            <ImageUpload id={2} label="Background Image 2" />
        )}
        {data.templateId === 'clean-grid' && (
            <ImageUpload id={3} label="Background Image 3" />
        )}
      </div>
      
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">⚡ Actions</h3>
        <button
            onClick={onDownload}
            disabled={isLoading || isBulkGenerating}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold rounded-md shadow-lg hover:from-pink-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
            {isLoading ? 'Generating...' : <><DownloadIcon className="w-5 h-5 mr-2" /> Download Pin</>}
        </button>
      </div>

      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">🤖 Bulk Actions</h3>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="pinsPerDay" className="block text-sm font-medium text-gray-700 mb-1">Pins Per Day</label>
                <input
                    type="number"
                    id="pinsPerDay"
                    value={data.pinsPerDay}
                    onChange={(e) => onFieldChange('pinsPerDay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 text-gray-900"
                    min="1"
                    placeholder="e.g., 3"
                />
            </div>
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                    type="date"
                    id="startDate"
                    value={data.startDate}
                    onChange={(e) => onFieldChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 text-gray-900"
                />
            </div>
        </div>
        <div>
            <label htmlFor="mediaUrlPrefix" className="block text-sm font-medium text-gray-700 mb-1">Media URL Prefix</label>
            <input
                type="text"
                id="mediaUrlPrefix"
                value={data.mediaUrlPrefix || ''}
                onChange={(e) => onFieldChange('mediaUrlPrefix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 text-gray-900"
                placeholder="e.g., http://yourwebsite.com/images/"
            />
            <p className="text-xs text-gray-500 mt-1">ℹ️ This URL will be prefixed to the generated image filenames in the CSV.</p>
        </div>
        <button
            onClick={onAutoGenerateAll}
            disabled={isBulkGenerating || csvData.length === 0}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-md shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
            {isBulkGenerating ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
            </>
            ) : '✨ Generate All Pins & CSV'}
        </button>
        {bulkMessage && (
            <p className="text-sm text-center text-gray-600 bg-gray-100 p-2 rounded-md border mt-2">{bulkMessage}</p>
        )}
        {generatedAssets && !isBulkGenerating && (
            <button
                onClick={onDownloadGeneratedAssets}
                className="w-full flex items-center justify-center mt-2 px-4 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-md shadow-lg hover:from-green-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download Files (.zip & .csv)
            </button>
        )}
      </div>

    </div>
  );
};

export default Controls;
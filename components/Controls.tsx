import React from 'react';
import type { TemplateData } from '../types';
import PinContentIcon from './icons/PinContentIcon';
import PaletteIcon from './icons/PaletteIcon';
import ImagesIcon from './icons/ImagesIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface ControlsProps {
  data: TemplateData;
  onDataChange: (field: keyof TemplateData, value: any) => void;
  templates: { id: string, name: string }[];
  onGenerateKeywords: () => void;
  onGenerateImage: (field: 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3') => void;
  isKeywordsLoading: boolean;
  isImageLoading: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
    data, 
    onDataChange, 
    templates, 
    onGenerateKeywords,
    onGenerateImage,
    isKeywordsLoading,
    isImageLoading,
}) => {

    const imageFields: ('backgroundImage' | 'backgroundImage2' | 'backgroundImage3')[] = ['backgroundImage', 'backgroundImage2', 'backgroundImage3'];

    const handleImagePromptChange = (field: keyof TemplateData, value: string) => {
        // This is a proxy to handle prompts without adding new fields to TemplateData
        // In a real app, you might store prompts separately.
        (document.getElementById(field as string) as HTMLInputElement).value = value;
    }

    return (
        <div className="space-y-6">
            {/* Pin Content */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 text-slate-500"><PinContentIcon /></div>
                    <h3 className="text-md font-semibold text-slate-800 tracking-tight">Pin Content</h3>
                </div>
                <div className="space-y-4 pt-4 mt-4 border-t border-slate-200/80">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-1.5">Title</label>
                        <input type="text" id="title" value={data.title} onChange={e => onDataChange('title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    </div>
                    <div>
                        <label htmlFor="subtitle" className="block text-sm font-medium text-slate-600 mb-1.5">Subtitle / Description</label>
                        <textarea id="subtitle" value={data.subtitle} onChange={e => onDataChange('subtitle', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500" rows={3}></textarea>
                    </div>
                     <div>
                        <label htmlFor="website" className="block text-sm font-medium text-slate-600 mb-1.5">Website URL</label>
                        <input type="text" id="website" value={data.website} onChange={e => onDataChange('website', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    </div>
                </div>
            </div>

            {/* Design & Style */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 text-slate-500"><PaletteIcon /></div>
                    <h3 className="text-md font-semibold text-slate-800 tracking-tight">Design & Style</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-200/80">
                    <div>
                        <label htmlFor="templateId" className="block text-sm font-medium text-slate-600 mb-1.5">Template</label>
                        <select id="templateId" value={data.templateId} onChange={e => onDataChange('templateId', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white">
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="pinSize" className="block text-sm font-medium text-slate-600 mb-1.5">Pin Size</label>
                        <select id="pinSize" value={data.pinSize} onChange={e => onDataChange('pinSize', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white">
                            <option value="standard">Standard (2:3)</option>
                            <option value="tall">Tall (9:16)</option>
                        </select>
                    </div>
                </div>
            </div>

             {/* Images */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 text-slate-500"><ImagesIcon /></div>
                    <h3 className="text-md font-semibold text-slate-800 tracking-tight">Images</h3>
                </div>
                <div className="space-y-4 pt-4 mt-4 border-t border-slate-200/80">
                    {imageFields.map((field, index) => (
                         <div key={field}>
                            <label htmlFor={field} className="block text-sm font-medium text-slate-600 mb-1.5">Background Image {index + 1} Prompt</label>
                            <div className="flex gap-2">
                                <input type="text" id={field} placeholder="e.g., 'A cozy, minimalist home office'" className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                                <button onClick={() => onGenerateImage(field)} disabled={isImageLoading} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-wait">
                                    {isImageLoading ? <LoadingSpinner /> : 'Generate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Controls;

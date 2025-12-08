import React, { useState, useEffect } from 'react';
import type { TemplateData, CustomTheme } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';
import TemplatePreview from '../TemplatePreview';
import { ControlCard } from '../Controls';
import PaletteIcon from '../icons/PaletteIcon';

const FONT_OPTIONS = [
    { name: 'Poppins', value: "'Poppins', sans-serif" },
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
    { name: 'Anton', value: "'Anton', sans-serif" },
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Lobster', value: "'Lobster', cursive" },
    { name: 'Luckiest Guy', value: "'Luckiest Guy', cursive" },
    { name: 'Fredoka One', value: "'Fredoka One', cursive" },
    { name: 'Bangers', value: "'Bangers', cursive" },
    { name: 'Bungee Spice', value: "'Bungee Spice', cursive" },
];

const DEFAULT_THEME: CustomTheme = {
    primaryColor: '#F472B6', // A default pink color
    textColor: '#334155',    // A default slate color
    titleFont: "'Playfair Display', serif",
    bodyFont: "'Poppins', sans-serif",
};

const TemplateCustomizerPage: React.FC = () => {
    const [customTheme, setCustomTheme] = useLocalStorage<CustomTheme>('customTheme', DEFAULT_THEME);
    const [localTheme, setLocalTheme] = useState<CustomTheme>(customTheme);
    const [selectedTemplateId, setSelectedTemplateId] = useState<`${number}`>('1');
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        setLocalTheme(customTheme);
    }, [customTheme]);

    const handleThemeChange = (field: keyof CustomTheme, value: string) => {
        setLocalTheme(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setCustomTheme(localTheme);
        setSaveMessage('Theme saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset to the default theme?')) {
            setLocalTheme(DEFAULT_THEME);
            setCustomTheme(DEFAULT_THEME);
            setSaveMessage('Theme has been reset to default.');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const previewData: TemplateData = {
        title: 'Your Beautiful Title Here',
        website: 'YOURWEBSITE.COM',
        board: 'CUSTOMIZED WITH STYLE',
        backgroundImage: 'https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070',
        backgroundImage2: 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?q=80&w=2148',
        backgroundImage3: 'https://images.unsplash.com/photo-1614850523011-8f49ffc73908?q=80&w=2070',
        templateId: selectedTemplateId,
        pinSize: 'long',
        imageAspectRatio: '9:16',
        description: '',
        keywords: '',
        mediaUrlPrefix: '',
        pinsPerDay: 1,
        startDate: '',
        imageModel: '',
        textModel: '',
    };
    
    const templateCount = 56;
    const templateOptions = Array.from({ length: templateCount }, (_, i) => ({
        id: `${i + 1}`,
        name: `${i + 1}`
    }));

    return (
        <div className="container mx-auto">
             <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800">Template Customizer</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                    Change the colors and fonts of any template to match your brand. Your changes will be saved and applied across the app.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <ControlCard icon={<PaletteIcon />} title="Customize Your Theme">
                        <div>
                            <label htmlFor="template-select" className="block text-sm font-medium text-slate-600 mb-1.5">Template to Preview</label>
                             <select
                                id="template-select"
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value as `${number}`)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900"
                            >
                                {templateOptions.map(opt => <option key={opt.id} value={opt.id}>Template {opt.name}</option>)}
                            </select>
                        </div>
                        <hr/>
                        <div>
                            <label htmlFor="primary-color" className="block text-sm font-medium text-slate-600 mb-1.5">Primary Color</label>
                            <input type="color" id="primary-color" value={localTheme.primaryColor} onChange={e => handleThemeChange('primaryColor', e.target.value)} className="w-full h-10 p-1 border border-slate-300 rounded-lg cursor-pointer" />
                        </div>
                         <div>
                            <label htmlFor="text-color" className="block text-sm font-medium text-slate-600 mb-1.5">Text Color</label>
                            <input type="color" id="text-color" value={localTheme.textColor} onChange={e => handleThemeChange('textColor', e.target.value)} className="w-full h-10 p-1 border border-slate-300 rounded-lg cursor-pointer" />
                        </div>
                        <div>
                            <label htmlFor="title-font" className="block text-sm font-medium text-slate-600 mb-1.5">Title Font</label>
                            <select id="title-font" value={localTheme.titleFont} onChange={e => handleThemeChange('titleFont', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900">
                                {FONT_OPTIONS.map(font => <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="body-font" className="block text-sm font-medium text-slate-600 mb-1.5">Body Font</label>
                            <select id="body-font" value={localTheme.bodyFont} onChange={e => handleThemeChange('bodyFont', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900">
                                {FONT_OPTIONS.map(font => <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500">Save Theme</button>
                            <button onClick={handleReset} className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50">Reset to Defaults</button>
                        </div>
                        {saveMessage && <p className="text-sm text-center text-green-700 font-medium">{saveMessage}</p>}
                    </ControlCard>
                </div>
                <div className="lg:col-span-2 flex justify-center items-start">
                    <div className="w-full max-w-md sticky top-24">
                         <div style={{
                            '--primary-color': localTheme.primaryColor,
                            '--text-color': localTheme.textColor,
                            '--title-font': localTheme.titleFont,
                            '--body-font': localTheme.bodyFont,
                         } as React.CSSProperties}>
                            <TemplatePreview data={previewData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateCustomizerPage;

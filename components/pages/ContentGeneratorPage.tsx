
import React, { useState, useEffect } from 'react';
import { generatePinContentFromKeyword } from '../../services/googleAi';
import type { GeneratedContentRow } from '../../types';
import CsvIcon from '../icons/CsvIcon';
import SettingsIcon from '../icons/SettingsIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import DownloadIcon from '../icons/DownloadIcon';
import ErrorIcon from '../icons/ErrorIcon';

interface ContentGeneratorPageProps {
    getApiKey: () => string | undefined;
    textModel: string;
    onSetUserApiKey: (key: string) => void;
    isApiKeyFromEnv: boolean;
    userApiKey: string;
}

const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i+1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
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

const ContentGeneratorPage: React.FC<ContentGeneratorPageProps> = ({ getApiKey, textModel, onSetUserApiKey, isApiKeyFromEnv, userApiKey }) => {
    const [keywords, setKeywords] = useState<string[]>([]);
    const [generatedData, setGeneratedData] = useState<GeneratedContentRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [apiError, setApiError] = useState<{ type: string; message: string; helpLink?: string } | null>(null);
    const [googleApiKeyInput, setGoogleApiKeyInput] = useState(userApiKey);

    useEffect(() => { setGoogleApiKeyInput(userApiKey); }, [userApiKey]);
    const handleSaveGoogleKey = () => onSetUserApiKey(googleApiKeyInput.trim());
    const handleClearGoogleKey = () => { setGoogleApiKeyInput(''); onSetUserApiKey(''); };

    const resetState = () => {
        setKeywords([]);
        setGeneratedData([]);
        setIsLoading(false);
        setProgressMessage('');
        setApiError(null);
    }

    const handleCsvUpload = (file: File) => {
        resetState();
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length === 0) {
                setApiError({ type: 'generic', message: "CSV file is empty or invalid." });
                return;
            }

            const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
            const keywordIndex = headers.indexOf('keywords');

            const dataStartIndex = keywordIndex !== -1 ? 1 : 0;
            
            if (lines.length <= dataStartIndex) {
                setApiError({ type: 'generic', message: "CSV file must contain data rows." });
                return;
            }

            const extractedKeywords = lines.slice(dataStartIndex).map(line => {
                const values = parseCsvLine(line);
                if (keywordIndex !== -1) {
                    return values[keywordIndex] || '';
                }
                // If no 'keywords' header, assume it's the first column
                return values[0] || '';
            }).filter(Boolean); // Filter out any empty keywords

            if (extractedKeywords.length === 0) {
                setApiError({type: 'generic', message: "No valid keywords found in the CSV. Please ensure there is a 'Keywords' column or that keywords are in the first column."})
                return;
            }

            setKeywords(extractedKeywords);
        };
        reader.readAsText(file);
    };

    const handleGenerateContent = async () => {
        const apiKey = getApiKey();
        if (!apiKey) {
            setApiError({type: 'generic', message: "Please provide a Google AI API key to generate content."});
            return;
        }
        if (keywords.length === 0) {
            setApiError({type: 'generic', message: "Please upload a CSV with keywords first."});
            return;
        }

        setIsLoading(true);
        setApiError(null);
        setGeneratedData([]);
        
        const results: GeneratedContentRow[] = [];

        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i];
            setProgressMessage(`Processing keyword ${i + 1} of ${keywords.length}: "${keyword}"`);
            try {
                const content = await generatePinContentFromKeyword(apiKey, textModel, keyword);
                results.push({ keyword, ...content });
                setGeneratedData([...results]); // Update table as we go
            } catch (error: any) {
                console.error(error);
                setApiError({type: error.type || 'generic', message: error.message, helpLink: error.helpLink});
                setIsLoading(false);
                setProgressMessage(`Failed at keyword ${i + 1}. Please check the error message.`);
                return; // Stop on error
            }
        }

        setProgressMessage('Content generation complete!');
        setIsLoading(false);
    };

    const handleDownloadCsv = () => {
        if (generatedData.length === 0) return;

        const headers = ['Keyword', 'Title of recipes', 'Board', 'Image Prompt', 'Description', 'Description Alt Text', 'Interest Used', 'Categorie'];
        const rows = generatedData.map(row => [
            row.keyword,
            row.title,
            row.board,
            row.imagePrompt,
            row.description,
            row.altText,
            row.interests,
            row.category
        ].map(value => {
            const escaped = (value || '').replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'pinterest_content_ideas.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };
    

    return (
        <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800">AI Content Idea Generator</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                    Supercharge your content strategy. Upload a CSV with keywords, and let AI generate complete Pinterest-ready content for you.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Controls Column */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 text-slate-500"><SettingsIcon/></div>
                            <h3 className="text-md font-semibold text-slate-800 tracking-tight">Configuration</h3>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-slate-200/80">
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
                                        <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>API Key Required:</strong> Add a key to enable AI text generation.</p>
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 text-slate-500"><CsvIcon/></div>
                            <h3 className="text-md font-semibold text-slate-800 tracking-tight">1. Upload Keywords</h3>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-slate-200/80">
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={(e) => e.target.files && e.target.files[0] && handleCsvUpload(e.target.files[0])}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer transition-colors duration-200"
                            />
                            <p className="text-xs text-slate-500">Upload a CSV with a 'Keywords' column, or a single-column list of keywords.</p>
                        </div>
                    </div>
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8-5.6.8 4 3.9-1 5.5L12 16l5.5 2.9-1-5.5 4-3.9-5.6-.8z"/></svg>
                            </div>
                            <h3 className="text-md font-semibold text-slate-800 tracking-tight">2. Generate Content</h3>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-slate-200/80">
                             <button
                                onClick={handleGenerateContent}
                                disabled={isLoading || keywords.length === 0}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isLoading ? (
                                    <><LoadingSpinner className="mr-3" /> Generating...</>
                                ) : '✨ Generate All Content'}
                            </button>
                             {progressMessage && (
                                <p className="text-sm text-center text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200">{progressMessage}</p>
                            )}
                            {apiError && (
                                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-start" role="alert">
                                    <div className="flex-shrink-0">
                                        <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold">An error occurred</p>
                                        <p className="text-sm mt-1">{apiError.message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {generatedData.length > 0 && !isLoading && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
                             <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 text-slate-500"><DownloadIcon /></div>
                                <h3 className="text-md font-semibold text-slate-800 tracking-tight">3. Download CSV</h3>
                            </div>
                            <div className="pt-4 border-t border-slate-200/80">
                                <button
                                    onClick={handleDownloadCsv}
                                    className="w-full flex items-center justify-center px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
                                >
                                    <DownloadIcon className="w-5 h-5 mr-2" />
                                    Download Content CSV
                                </button>
                                <p className="text-xs text-slate-500 mt-2">You can use this file with the Pin Generator.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Column */}
                <div className="md:col-span-2">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
                        <h3 className="text-lg font-semibold text-slate-800 tracking-tight mb-4">Generated Content ({generatedData.length} / {keywords.length})</h3>
                        <div className="overflow-x-auto max-h-[80vh] rounded-lg border border-slate-200">
                           <table className="w-full text-sm text-left text-slate-500">
                               <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                                   <tr>
                                       <th scope="col" className="px-4 py-3">Keyword</th>
                                       <th scope="col" className="px-4 py-3">Generated Title</th>
                                       <th scope="col" className="px-4 py-3">Board</th>
                                       <th scope="col" className="px-4 py-3">Description</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {generatedData.length > 0 ? (
                                       generatedData.map((row, index) => (
                                           <tr key={index} className="bg-white border-b hover:bg-slate-50">
                                               <td className="px-4 py-3 font-semibold text-slate-800 align-top">{row.keyword}</td>
                                               <td className="px-4 py-3 align-top">{row.title}</td>
                                               <td className="px-4 py-3 align-top">{row.board}</td>
                                               <td className="px-4 py-3 align-top min-w-[250px]">{row.description}</td>
                                           </tr>
                                       ))
                                   ) : (
                                       <tr>
                                           <td colSpan={4} className="text-center py-10 px-4 text-slate-500">
                                               {keywords.length > 0 ? 'Generated content will appear here...' : 'Upload a keyword CSV to get started.'}
                                           </td>
                                       </tr>
                                   )}
                               </tbody>
                           </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentGeneratorPage;

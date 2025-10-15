
import React, { useState, useEffect } from 'react';
import { generatePinContentFromKeyword } from '../../services/googleAi';
import type { GeneratedContentRow } from '../../types';
import CsvIcon from '../icons/CsvIcon';
import SettingsIcon from '../icons/SettingsIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import DownloadIcon from '../icons/DownloadIcon';
import ErrorIcon from '../icons/ErrorIcon';

interface ContentGeneratorPageProps {
    googleKeyIsConfigured: boolean;
    textModel: string;
    boardList: string;
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

const ContentGeneratorPage: React.FC<ContentGeneratorPageProps> = ({ googleKeyIsConfigured, textModel, boardList }) => {
    const [keywords, setKeywords] = useState<string[]>([]);
    const [generatedData, setGeneratedData] = useState<GeneratedContentRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [apiError, setApiError] = useState<{ type: string; message: string; helpLink?: string } | null>(null);

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
        if (!googleKeyIsConfigured) {
            setApiError({type: 'generic', message: "Google AI API key not configured. Please set the API_KEY environment variable."});
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
        const boardOptions = boardList.split('\n').map(b => b.trim()).filter(Boolean);

        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i];
            setProgressMessage(`Processing keyword ${i + 1} of ${keywords.length}: "${keyword}"`);
            try {
                const content = await generatePinContentFromKeyword(textModel, keyword, boardOptions);
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

        const headers = ['Title of recipes', 'Board', 'Image Prompt', 'Description', 'Description Alt Text', 'Interest Used', 'SITE'];
        const rows = generatedData.map(row => [
            row.title,
            row.board,
            row.imagePrompt,
            row.description,
            row.altText,
            row.interests,
            '' // Empty site column as requested
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
                           {/* FIX: Removed Google AI API Key input to comply with guidelines. */}
                           {!googleKeyIsConfigured && (
                                <div className="text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 font-medium text-sm">
                                    <strong>Google AI Key Not Found:</strong> To enable AI text generation, a <code>API_KEY</code> environment variable must be configured for this application.
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 hover:underline mt-2 w-full text-left block">
                                        Get a Google AI API Key &rarr;
                                    </a>
                                </div>
                            )}
                             {googleKeyIsConfigured && (
                                <div className="text-green-800 bg-green-50 p-3 rounded-lg border border-green-200 font-medium text-sm">
                                    <strong>Google AI Key is configured.</strong> You're ready to generate content.
                                </div>
                            )}
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

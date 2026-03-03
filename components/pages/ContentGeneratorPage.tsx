
import React, { useState, useEffect } from 'react';
import { generatePinContentFromKeyword, rewriteKeyword } from '@/services/ai';
import type { AdminSettings, GeneratedContentRow } from '@/types';
import CsvIcon from '../icons/CsvIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import DownloadIcon from '../icons/DownloadIcon';
import ErrorIcon from '../icons/ErrorIcon';
import SettingsIcon from '../icons/SettingsIcon';
import { ApiKeyInput, ControlCard } from '../Controls';
import ProfileIcon from '../icons/ProfileIcon';

interface ContentGeneratorPageProps {
    openRouterApiKey: string;
    onSetOpenRouterApiKey: (key: string) => void;
    textModel: string;
    adminSettings: AdminSettings;
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

// Removed ServiceToggleButton as OpenRouter is now exclusive for text AI

const ContentGeneratorPage: React.FC<ContentGeneratorPageProps> = ({ openRouterApiKey, onSetOpenRouterApiKey, textModel, adminSettings }) => {
    const [keywords, setKeywords] = useState<string[]>([]);
    const [generatedData, setGeneratedData] = useState<GeneratedContentRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [apiError, setApiError] = useState<{ type: string; message: string; helpLink?: string } | null>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    
    // Default model for OpenRouter, previously it was set for Google AI
    const [openRouterModel, setOpenRouterModel] = useState(textModel || 'google/gemini-2.5-flash'); 
    
    const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState(openRouterApiKey);
    useEffect(() => { setOpenRouterApiKeyInput(openRouterApiKey); }, [openRouterApiKey]);


    // Set the default profile when the component loads or profiles change
    useEffect(() => {
        const defaultProfile = adminSettings.websiteProfiles.find(p => p.isDefault);
        if (defaultProfile) {
            setSelectedProfileId(defaultProfile.id);
        } else if (adminSettings.websiteProfiles.length > 0) {
            setSelectedProfileId(adminSettings.websiteProfiles[0].id);
        }
    }, [adminSettings.websiteProfiles]);


    const handleSaveOpenRouterKey = () => onSetOpenRouterApiKey(openRouterApiKeyInput.trim());
    const handleClearOpenRouterKey = () => {
        setOpenRouterApiKeyInput('');
        onSetOpenRouterApiKey('');
    };
    
    const openRouterKeyIsConfigured = openRouterApiKey && openRouterApiKey.length > 5;

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
                return values[0] || '';
            }).filter(Boolean);

            if (extractedKeywords.length === 0) {
                setApiError({type: 'generic', message: "No valid keywords found in the CSV. Please ensure there is a 'Keywords' column or that keywords are in the first column."})
                return;
            }

            setKeywords(extractedKeywords);
        };
        reader.readAsText(file);
    };

    const handleGenerateContent = async () => {
        if (!openRouterKeyIsConfigured) {
            setApiError({type: 'generic', message: "An OpenRouter API key is required. Please add one in the 'AI Configuration' settings."});
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
        const generationErrors: string[] = [];

        const selectedProfile = adminSettings.websiteProfiles.find(p => p.id === selectedProfileId);
        const boardOptions = selectedProfile?.boardList.split('\n').filter(Boolean).join(', ');
        const categoryOptions = selectedProfile?.categoryList.split('\n').filter(Boolean).join(', ');

        for (let i = 0; i < keywords.length; i++) {
            const originalKeyword = keywords[i];
            let currentKeyword = originalKeyword;
            setProgressMessage(`Processing keyword ${i + 1} of ${keywords.length}: "${originalKeyword}"`);
            
            let success = false;
            let attempt = 1;
            const maxAttempts = 2; // Original attempt + 1 retry

            while (attempt <= maxAttempts && !success) {
                try {
                    const content = await generatePinContentFromKeyword(
                        openRouterApiKey,
                        openRouterModel,
                        currentKeyword,
                        boardOptions,
                        categoryOptions
                    );
                    results.push({ keyword: originalKeyword, ...content }); // Push with original keyword
                    setGeneratedData([...results]);
                    success = true;

                } catch (error: unknown) {
                    const err = error as { type?: string; message?: string; helpLink?: string };
                    console.error(`Attempt ${attempt} failed for keyword "${currentKeyword}":`, err);
                    
                    // Don't retry quota errors
                    if (err.type === 'quota') {
                        setApiError({type: err.type, message: `API Quota Exceeded on keyword "${originalKeyword}". Generation stopped.`, helpLink: err.helpLink});
                        setIsLoading(false);
                        return;
                    }

                    if (attempt < maxAttempts) {
                        setProgressMessage(`Attempt ${attempt} failed for "${originalKeyword}". Rewriting and retrying...`);
                        
                        try {
                            const rewrittenKeyword = await rewriteKeyword(openRouterApiKey, openRouterModel, originalKeyword);
                            
                            if (rewrittenKeyword && rewrittenKeyword.toLowerCase() !== originalKeyword.toLowerCase()) {
                               currentKeyword = rewrittenKeyword;
                               setProgressMessage(`Retrying with new keyword: "${currentKeyword}"`);
                            } else {
                               setProgressMessage(`Could not rewrite keyword, retrying with original.`);
                            }

                        } catch (rewriteError) {
                            console.error("Failed to rewrite keyword, will use original for next attempt.", rewriteError);
                        }
                    } else {
                        // Final attempt failed
                        const errorMessage = `Failed on keyword "${originalKeyword}": ${err.message}`;
                        generationErrors.push(errorMessage);
                    }
                }
                attempt++;
            }
        }

        if (generationErrors.length > 0) {
            setProgressMessage(`Content generation complete with ${generationErrors.length} error(s).`);
            const summaryError = `Failed to process ${generationErrors.length} keyword(s). First error: ${generationErrors[0]}`;
            setApiError({ type: 'generic', message: summaryError });
        } else {
            setProgressMessage('Content generation complete!');
            setApiError(null); // Clear any transient errors if the whole process succeeded
        }
        
        setIsLoading(false);
    };

    const handleDownloadCsv = () => {
        if (generatedData.length === 0) return;

        const escapeCsvCell = (cell: unknown): string => {
            const value = cell ? String(cell) : '';
            if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };

        const headers = [
            'Title of recipes', 'Pinterest board', 'Image Prompt', 'Description', 
            'Interest Used', 'Description Alt Text', 'SITE', 'Category',
            'Prep Time', 'Cook Time', 'Servings', 'Difficulty', 'Ingredients',
            'Calories', 'Protein', 'Fat', 'Carbs'
        ];
        const headerString = headers.map(escapeCsvCell).join(',');

        const rows = generatedData.map(row => {
            const rowData = [
                row.title,
                row.board,
                row.image_prompt,
                row.description,
                row.interests.join(','),
                row.alt_text,
                '', // Site is always void as requested
                row.category,
                row.prepTime || '',
                row.cookTime || '',
                row.servings || '',
                row.difficulty || '',
                row.ingredients || '',
                row.calories || '',
                row.protein || '',
                row.fat || '',
                row.carbs || '',
            ];
            return rowData.map(escapeCsvCell).join(',');
        });

        const csvContent = [headerString, ...rows].join('\r\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'pinterest_content_for_pin_generator.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };
    

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">AI Content Idea Generator</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                    Supercharge your content strategy. Upload a CSV with keywords, and let AI generate complete Pinterest-ready content for you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls Column */}
                <div className="lg:col-span-1 space-y-6">
                     <ControlCard icon={<SettingsIcon />} title="AI Configuration">
                        <div className="space-y-6">
                            {/* Service Toggle Button removed as OpenRouter is now the sole text AI provider */}
                            
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
                                        <p className="text-green-800 dark:text-green-100 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg border border-green-200 dark:border-green-800 font-medium">Your OpenRouter key is saved in this browser.</p>
                                    ) : (
                                        <p className="text-amber-800 dark:text-amber-100 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800 font-medium"><strong>API Key Required:</strong> Add a key to enable AI text generation.</p>
                                    )
                                }
                            />
                            <div>
                                <label htmlFor="openrouter-model" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">OpenRouter Model</label>
                                <input
                                    type="text"
                                    id="openrouter-model"
                                    value={openRouterModel}
                                    onChange={(e) => setOpenRouterModel(e.target.value)}
                                    placeholder="e.g., google/gemini-2.5-flash"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                    Find models on the <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="underline text-pink-600 dark:text-pink-400">OpenRouter models page</a>.
                                </p>
                            </div>
                        </div>
                    </ControlCard>
                    
                     <ControlCard icon={<ProfileIcon />} title="Website Profile">
                        <div>
                           <label htmlFor="profile-select" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Select Profile</label>
                            <select
                                id="profile-select"
                                value={selectedProfileId}
                                onChange={(e) => setSelectedProfileId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                disabled={adminSettings.websiteProfiles.length === 0}
                            >
                                {adminSettings.websiteProfiles.length > 0 ? (
                                    adminSettings.websiteProfiles.map(profile => (
                                        <option key={profile.id} value={profile.id}>
                                            {profile.name} {profile.isDefault && '(Default)'}
                                        </option>
                                    ))
                                ) : (
                                    <option>No profiles configured</option>
                                )}
                            </select>
                            {adminSettings.websiteProfiles.length === 0 && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                    You can create profiles in the <a href="/#/admin" className="underline text-pink-600 dark:text-pink-400">Admin Panel</a> to pre-fill board and category lists.
                                </p>
                            )}
                        </div>
                    </ControlCard>

                     <ControlCard icon={<CsvIcon/>} title="1. Upload Keywords">
                        <div className="space-y-4">
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={(e) => e.target.files && e.target.files[0] && handleCsvUpload(e.target.files[0])}
                                className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 dark:file:bg-pink-900/30 file:text-pink-600 dark:file:text-pink-400 hover:file:bg-pink-100 dark:hover:file:bg-pink-900/50 cursor-pointer transition-colors duration-200"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">Upload a CSV with a 'Keywords' column, or a single-column list of keywords.</p>
                        </div>
                    </ControlCard>

                     <ControlCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8-5.6.8 4 3.9-1 5.5L12 16l5.5 2.9-1-5.5 4-3.9-5.6-.8z"/></svg>} title="2. Generate Content">
                        <div className="space-y-3">
                             <button
                                onClick={handleGenerateContent}
                                disabled={isLoading || keywords.length === 0 || !openRouterKeyIsConfigured}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isLoading ? (
                                    <><LoadingSpinner className="mr-3" /> Generating...</>
                                ) : '✨ Generate All Content'}
                            </button>
                             {progressMessage && (
                                <p className="text-sm text-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">{progressMessage}</p>
                            )}
                            {apiError && (
                                <div className={`border p-3 rounded-xl ${apiError.type === 'quota' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-100' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-100'}`} role="alert">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <ErrorIcon className={`w-5 h-5 mt-0.5 ${apiError.type === 'quota' ? 'text-amber-500' : 'text-red-500'}`} />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-semibold">
                                                {apiError.type === 'quota' ? 'API Quota Reached' : 'An Error Occurred'}
                                            </h3>
                                            <div className="text-sm mt-1 space-y-1">
                                                <p className="whitespace-pre-wrap">{apiError.message}</p>
                                                {apiError.type === 'quota' && apiError.helpLink && (
                                                    <a href={apiError.helpLink} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100 mt-2 block">
                                                        Learn more about API billing &rarr;
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ControlCard>
                    {generatedData.length > 0 && !isLoading && (
                        <ControlCard icon={<DownloadIcon />} title="3. Download CSV">
                            <div>
                                <button
                                    onClick={handleDownloadCsv}
                                    className="w-full flex items-center justify-center px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
                                >
                                    <DownloadIcon className="w-5 h-5 mr-2" />
                                    Download Content CSV
                                </button>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">You can upload this file directly into the Pin Generator.</p>
                            </div>
                        </ControlCard>
                    )}
                </div>

                {/* Results Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight mb-4">Generated Content ({generatedData.length} / {keywords.length})</h3>
                        <div className="overflow-x-auto max-h-[80vh] rounded-lg border border-slate-200 dark:border-slate-800">
                           <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                               <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800 sticky top-0">
                                   <tr>
                                       <th scope="col" className="px-4 py-3">Keyword</th>
                                       <th scope="col" className="px-4 py-3">Title of recipes</th>
                                       <th scope="col" className="px-4 py-3">Board</th>
                                       <th scope="col" className="px-4 py-3">Image Prompt</th>
                                       <th scope="col" className="px-4 py-3">Description</th>
                                       <th scope="col" className="px-4 py-3">Description Alt Text</th>
                                       <th scope="col" className="px-4 py-3">Interest Used</th>
                                       <th scope="col" className="px-4 py-3">SITE</th>
                                       <th scope="col" className="px-4 py-3">Category</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {generatedData.length > 0 ? (
                                       generatedData.map((row, index) => (
                                           <tr key={index} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                               <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 align-top">{row.keyword}</td>
                                               <td className="px-4 py-3 align-top min-w-[200px]">{row.title}</td>
                                               <td className="px-4 py-3 align-top">{row.board}</td>
                                               <td className="px-4 py-3 align-top min-w-[250px] font-mono text-xs">{row.image_prompt}</td>
                                               <td className="px-4 py-3 align-top min-w-[250px]">{row.description}</td>
                                               <td className="px-4 py-3 align-top min-w-[200px]">{row.alt_text}</td>
                                               <td className="px-4 py-3 align-top min-w-[200px]">{row.interests.join(', ')}</td>
                                               <td className="px-4 py-3 align-top"></td>
                                               <td className="px-4 py-3 align-top">{row.category}</td>
                                           </tr>
                                       ))
                                   ) : (
                                       <tr>
                                           <td colSpan={9} className="text-center py-10 px-4 text-slate-500 dark:text-slate-400">
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

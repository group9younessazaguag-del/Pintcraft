
import React, { useState, useEffect } from 'react';
import { rewriteDescriptionWithOpenRouter } from '../../services/googleAi';
import CsvIcon from '../icons/CsvIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import DownloadIcon from '../icons/DownloadIcon';
import ErrorIcon from '../icons/ErrorIcon';
import SettingsIcon from '../icons/SettingsIcon';
import RewriteIcon from '../icons/RewriteIcon';
import { ApiKeyInput, ControlCard } from '../Controls';

interface DescriptionRewritePageProps {
    openRouterApiKey: string;
    onSetOpenRouterApiKey: (key: string) => void;
}

interface RewriteDataRow {
    originalTitle: string;
    originalDescription: string;
    rewrittenTitle: string;
    rewrittenDescription: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
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

const DescriptionRewritePage: React.FC<DescriptionRewritePageProps> = ({ openRouterApiKey, onSetOpenRouterApiKey }) => {
    const [csvData, setCsvData] = useState<RewriteDataRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [apiError, setApiError] = useState<{ type: string; message: string; helpLink?: string } | null>(null);
    
    const [openRouterModel, setOpenRouterModel] = useState('google/gemini-2.5-flash');
    
    const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState(openRouterApiKey);
    useEffect(() => { setOpenRouterApiKeyInput(openRouterApiKey); }, [openRouterApiKey]);

    const handleSaveOpenRouterKey = () => onSetOpenRouterApiKey(openRouterApiKeyInput.trim());
    const handleClearOpenRouterKey = () => {
        setOpenRouterApiKeyInput('');
        onSetOpenRouterApiKey('');
    };
    
    const openRouterKeyIsConfigured = openRouterApiKey && openRouterApiKey.length > 5;

    const handleCsvUpload = (file: File) => {
        setCsvData([]);
        setIsLoading(false);
        setApiError(null);
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                setApiError({ type: 'generic', message: "CSV file must have a header and at least one data row." });
                return;
            }

            const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
            const findHeaderIndex = (keys: string[]): number => {
                for (const key of keys) {
                    const index = headers.findIndex(h => h.includes(key));
                    if (index !== -1) return index;
                }
                return -1;
            };

            const titleIndex = findHeaderIndex(['title of recipes', 'title', 'headline']);
            const descIndex = findHeaderIndex(['description']);

            if (titleIndex === -1 || descIndex === -1) {
                setApiError({ type: 'generic', message: "CSV must contain columns with 'Title' and 'Description' in the headers." });
                return;
            }

            const parsedData: RewriteDataRow[] = lines.slice(1).map(line => {
                const values = parseCsvLine(line);
                return {
                    originalTitle: values[titleIndex] || '',
                    originalDescription: values[descIndex] || '',
                    rewrittenTitle: '',
                    rewrittenDescription: '',
                    status: 'pending'
                };
            });

            setCsvData(parsedData);
        };
        reader.readAsText(file);
    };

    const handleRewriteDescriptions = async () => {
        if (!openRouterKeyIsConfigured) {
            setApiError({type: 'generic', message: "An OpenRouter API key is required."});
            return;
        }
        if (csvData.length === 0) {
            setApiError({type: 'generic', message: "Please upload a CSV first."});
            return;
        }

        setIsLoading(true);
        setApiError(null);
        
        const workingData = [...csvData];
        let errorCount = 0;

        for (let i = 0; i < workingData.length; i++) {
            if (workingData[i].status === 'completed') continue;

            workingData[i].status = 'processing';
            setCsvData([...workingData]); 
            setProgressMessage(`Rewriting row ${i + 1} of ${workingData.length}...`);

            try {
                const result = await rewriteDescriptionWithOpenRouter(
                    openRouterApiKey,
                    openRouterModel,
                    workingData[i].originalTitle,
                    workingData[i].originalDescription,
                    workingData[i].originalTitle.length,
                    workingData[i].originalDescription.length
                );
                
                workingData[i].rewrittenTitle = result.title;
                workingData[i].rewrittenDescription = result.description;
                workingData[i].status = 'completed';
            } catch (error: any) {
                console.error(`Failed to rewrite row ${i + 1}:`, error);
                workingData[i].status = 'failed';
                workingData[i].error = error.message;
                errorCount++;
                
                if (error.message && (error.message.includes('quota') || error.message.includes('429'))) {
                     setApiError({ type: 'quota', message: "API Quota exceeded. Process stopped." });
                     setCsvData([...workingData]);
                     setIsLoading(false);
                     return;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            setCsvData([...workingData]);
        }

        setIsLoading(false);
        setProgressMessage(errorCount > 0 ? `Finished with ${errorCount} errors.` : 'All content rewritten successfully!');
    };

    const handleDownloadCsv = () => {
        if (csvData.length === 0) return;

        const escapeCsvCell = (cell: any): string => {
            const value = cell ? String(cell) : '';
            if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };

        const headers = ['Original Title', 'Rewritten Title', 'Original Description', 'Rewritten Description'];
        const headerString = headers.join(',');

        const rows = csvData.map(row => {
            return [
                escapeCsvCell(row.originalTitle),
                escapeCsvCell(row.rewrittenTitle || row.originalTitle),
                escapeCsvCell(row.originalDescription),
                escapeCsvCell(row.rewrittenDescription || row.originalDescription)
            ].join(',');
        });

        const csvContent = [headerString, ...rows].join('\r\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'rewritten_content.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800">Rewrite Title & Description</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                    Batch optimize your Pinterest Titles and Descriptions for blogging using AI.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls Column */}
                <div className="lg:col-span-1 space-y-6">
                     <ControlCard icon={<SettingsIcon />} title="1. AI Configuration">
                        <div className="space-y-6">
                            <ApiKeyInput
                                label="OpenRouter.ai API Key"
                                value={openRouterApiKeyInput}
                                onChange={setOpenRouterApiKeyInput}
                                onSave={handleSaveOpenRouterKey}
                                onClear={handleClearOpenRouterKey}
                                placeholder="Enter your OpenRouter key"
                                getLink="https://openrouter.ai/keys"
                                getLinkText="Get an OpenRouter API Key"
                                statusMessage={
                                    openRouterKeyIsConfigured ? (
                                        <p className="text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">Key is configured.</p>
                                    ) : (
                                        <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium"><strong>Required</strong></p>
                                    )
                                }
                            />
                            <div>
                                <label htmlFor="openrouter-model" className="block text-sm font-medium text-slate-600 mb-1.5">OpenRouter Model</label>
                                <input
                                    type="text"
                                    id="openrouter-model"
                                    value={openRouterModel}
                                    onChange={(e) => setOpenRouterModel(e.target.value)}
                                    placeholder="e.g., google/gemini-2.5-flash"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                        </div>
                    </ControlCard>

                     <ControlCard icon={<CsvIcon/>} title="2. Upload CSV">
                        <div className="space-y-4">
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={(e) => e.target.files && e.target.files[0] && handleCsvUpload(e.target.files[0])}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer transition-colors duration-200"
                            />
                            <p className="text-xs text-slate-500">
                                CSV must contain <strong>Title</strong> and <strong>Description</strong> columns.
                            </p>
                        </div>
                    </ControlCard>

                     <ControlCard icon={<RewriteIcon className="w-6 h-6" />} title="3. Rewrite">
                        <div className="space-y-3">
                             <button
                                onClick={handleRewriteDescriptions}
                                disabled={isLoading || csvData.length === 0 || !openRouterKeyIsConfigured}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                {isLoading ? (
                                    <><LoadingSpinner className="mr-3" /> Processing...</>
                                ) : '✨ Rewrite Titles & Descriptions'}
                            </button>
                             {progressMessage && (
                                <p className="text-sm text-center text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200">{progressMessage}</p>
                            )}
                            {apiError && (
                                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-start" role="alert">
                                    <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0 mr-2" />
                                    <p className="text-sm">{apiError.message}</p>
                                </div>
                            )}
                        </div>
                    </ControlCard>
                    
                    {csvData.some(r => r.status === 'completed') && !isLoading && (
                        <ControlCard icon={<DownloadIcon />} title="4. Download Results">
                            <button
                                onClick={handleDownloadCsv}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
                            >
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Download CSV
                            </button>
                        </ControlCard>
                    )}
                </div>

                {/* Results Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
                        <h3 className="text-lg font-semibold text-slate-800 tracking-tight mb-4">
                            Results {csvData.length > 0 && `(${csvData.filter(r => r.status === 'completed').length} / ${csvData.length})`}
                        </h3>
                        <div className="overflow-x-auto max-h-[80vh] rounded-lg border border-slate-200">
                           <table className="w-full text-sm text-left text-slate-500">
                               <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                                   <tr>
                                       <th scope="col" className="px-4 py-3 w-10">#</th>
                                       <th scope="col" className="px-4 py-3 w-1/4">Original Title</th>
                                       <th scope="col" className="px-4 py-3 w-1/4 bg-green-50">New Title</th>
                                       <th scope="col" className="px-4 py-3 w-1/4">Original Desc</th>
                                       <th scope="col" className="px-4 py-3 w-1/4 bg-green-50">New Desc</th>
                                       <th scope="col" className="px-4 py-3 w-10">Status</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {csvData.length > 0 ? (
                                       csvData.map((row, index) => (
                                           <tr key={index} className="bg-white border-b hover:bg-slate-50">
                                               <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                                               <td className="px-4 py-3 font-medium text-slate-800 text-xs">{row.originalTitle}</td>
                                               <td className="px-4 py-3 font-medium text-green-700 text-xs bg-green-50/30">{row.rewrittenTitle}</td>
                                               <td className="px-4 py-3 text-slate-500 text-xs">{row.originalDescription}</td>
                                               <td className="px-4 py-3 text-slate-900 font-medium bg-green-50/30 text-xs">{row.rewrittenDescription}</td>
                                               <td className="px-4 py-3">
                                                   {row.status === 'pending' && <span className="text-slate-400">...</span>}
                                                   {row.status === 'processing' && <LoadingSpinner className="w-4 h-4 text-indigo-500"/>}
                                                   {row.status === 'completed' && <span className="text-green-500 font-bold">✓</span>}
                                                   {row.status === 'failed' && <span className="text-red-500 font-bold" title={row.error}>✗</span>}
                                               </td>
                                           </tr>
                                       ))
                                   ) : (
                                       <tr>
                                           <td colSpan={6} className="text-center py-10 px-4 text-slate-500">
                                               Upload a CSV file to begin.
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

export default DescriptionRewritePage;

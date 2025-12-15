import React, { useState, useMemo, useEffect } from 'react';
import type { PinterestAccount } from '../../types';
import { generatePinIdeas, getAiSuggestions, PinIdea, AISuggestions } from '../../services/ai';
import PlusIcon from '../icons/PlusIcon';
import TrashIcon from '../icons/TrashIcon';
import LightbulbIcon from '../icons/LightbulbIcon';
import CloseIcon from '../icons/CloseIcon';
import LoadingSpinner from '../icons/LoadingSpinner';
import SparklesIcon from '../icons/SparklesIcon';
import StarIcon from '../icons/StarIcon';
import ErrorIcon from '../icons/ErrorIcon';

interface AssistantPageProps {
    accounts: PinterestAccount[];
    setAccounts: (accounts: PinterestAccount[]) => void;
    openRouterApiKey: string; // OpenRouter is now the primary text AI key
    textModel: string;
}

type StatusType = 'Overdue' | 'Due Today' | 'Due Soon' | 'Scheduled';

const getStatus = (nextPostDate: string): { type: StatusType, color: string } => {
    if (!nextPostDate) return { type: 'Scheduled', color: 'bg-slate-100 text-slate-600' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(nextPostDate);
    // Adjust for timezone differences by getting the date in UTC
    const dueDateUTC = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());

    const diffTime = dueDateUTC.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { type: 'Overdue', color: 'bg-red-100 text-red-700' };
    if (diffDays === 0) return { type: 'Due Today', color: 'bg-amber-100 text-amber-700' };
    if (diffDays <= 3) return { type: 'Due Soon', color: 'bg-yellow-100 text-yellow-700' };
    return { type: 'Scheduled', color: 'bg-green-100 text-green-700' };
};

const StarRating: React.FC<{ score: number; onRate: (newScore: number) => void }> = ({ score, onRate }) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => onRate(star)} className="p-0.5 text-slate-300 hover:text-yellow-400 focus:outline-none">
                    <StarIcon className={`w-4 h-4 transition-colors ${score >= star ? 'text-yellow-400 fill-current' : ''}`} />
                </button>
            ))}
        </div>
    );
};


const AssistantPage: React.FC<AssistantPageProps> = ({ accounts, setAccounts, openRouterApiKey, textModel }) => {
    const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);
    const [ideasModalContent, setIdeasModalContent] = useState<PinIdea[] | string | null>(null);
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
    const [suggestionsModalContent, setSuggestionsModalContent] = useState<AISuggestions | string | null>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [filterQuery, setFilterQuery] = useState('');
    const [showReminder, setShowReminder] = useState(true);

    const handleAddAccount = () => {
        const newAccount: PinterestAccount = {
            id: new Date().toISOString(),
            name: `Account ${accounts.length + 1}`,
            lastPostDate: '',
            nextPostDate: '',
            notes: '',
            performance: 0,
        };
        setAccounts([...accounts, newAccount]);
    };

    const handleUpdateAccount = (id: string, field: keyof PinterestAccount, value: string | number) => {
        const updatedAccounts = accounts.map(acc => {
            if (acc.id === id) {
                const newAcc = { ...acc, [field]: value };
                if (field === 'lastPostDate' && value) {
                    const lastDate = new Date(value as string);
                    lastDate.setDate(lastDate.getDate() + 8); // To account for timezone and make it exactly 7 days later
                    newAcc.nextPostDate = lastDate.toISOString().split('T')[0];
                }
                return newAcc;
            }
            return acc;
        });
        setAccounts(updatedAccounts);
    };

    const handleDeleteAccount = (id: string) => {
        if (window.confirm("Are you sure you want to delete this account?")) {
            setAccounts(accounts.filter(acc => acc.id !== id));
        }
    };

    const handleGenerateIdeas = async (account: PinterestAccount) => {
        if (!openRouterApiKey) {
            alert("Please add your OpenRouter API Key in the Pin Generator page's settings to use this feature.");
            return;
        }
        setIsGenerating(account.id);
        setModalTitle(`Pin Ideas for ${account.name}`);
        setIdeasModalContent(null);
        setIsIdeasModalOpen(true);

        try {
            const ideas = await generatePinIdeas(openRouterApiKey, textModel, account.name);
            setIdeasModalContent(ideas);
        } catch (error: any) {
            setIdeasModalContent(`An error occurred while generating ideas:\n\n${error.message}`);
        } finally {
            setIsGenerating(null);
        }
    };

    const handleGetSuggestions = async (account: PinterestAccount) => {
        if (!openRouterApiKey) {
            alert("Please add your OpenRouter API Key to use this feature.");
            return;
        }
        setIsGenerating(account.id);
        setModalTitle(`AI Suggestions for ${account.name}`);
        setSuggestionsModalContent(null);
        setIsSuggestionsModalOpen(true);

        try {
            const suggestions = await getAiSuggestions(openRouterApiKey, textModel, account);
            setSuggestionsModalContent(suggestions);
        } catch (error: any) {
            setSuggestionsModalContent(`An error occurred while getting suggestions:\n\n${error.message}`);
        } finally {
            setIsGenerating(null);
        }
    };
    
    const filteredAccounts = useMemo(() => {
        const query = filterQuery.toLowerCase().trim();
        if (!query) return accounts;

        return accounts.filter(acc => {
            const status = getStatus(acc.nextPostDate).type.toLowerCase();
            if (query.includes('due') && !query.includes('overdue')) {
                return status === 'due today' || status === 'overdue';
            }
            if (query.includes('overdue')) {
                return status === 'overdue';
            }
             if (query.includes('scheduled')) {
                return status === 'scheduled';
            }
            return acc.name.toLowerCase().includes(query);
        });
    }, [accounts, filterQuery]);

    const { overdueCount, dueTodayCount } = useMemo(() => {
        let overdue = 0;
        let dueToday = 0;
        accounts.forEach(acc => {
            const status = getStatus(acc.nextPostDate).type;
            if (status === 'Overdue') overdue++;
            if (status === 'Due Today') dueToday++;
        });
        return { overdueCount: overdue, dueTodayCount: dueToday };
    }, [accounts]);

    useEffect(() => {
      // Show reminder if there are due/overdue items and it hasn't been dismissed
      if (overdueCount > 0 || dueTodayCount > 0) {
        setShowReminder(true);
      }
    }, [overdueCount, dueTodayCount]);

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800">Posting Assistant</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                    Manage your Pinterest posting schedule and brainstorm new ideas with AI.
                </p>
            </div>

            {showReminder && (overdueCount > 0 || dueTodayCount > 0) && (
              <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 text-amber-800 p-4 rounded-r-lg shadow-md" role="alert">
                <div className="flex items-start">
                  <div className="py-1">
                    <ErrorIcon className="w-6 h-6 text-amber-500 mr-4" />
                  </div>
                  <div>
                    <p className="font-bold">Action Required!</p>
                    <p className="text-sm">
                      You have {overdueCount > 0 && `${overdueCount} overdue post(s)`}
                      {overdueCount > 0 && dueTodayCount > 0 && ' and '}
                      {dueTodayCount > 0 && `${dueTodayCount} post(s) due today`}.
                    </p>
                  </div>
                  <button onClick={() => setShowReminder(false)} className="ml-auto p-1.5 rounded-full hover:bg-amber-100">
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}


            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full md:max-w-md">
                        <input
                            type="text"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            placeholder="Filter by name or command (e.g., 'due', 'overdue')..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>
                   
                    <button onClick={handleAddAccount} className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                        <PlusIcon className="w-4 h-4" />
                        Add Account
                    </button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 min-w-[150px]">Account Name</th>
                                <th scope="col" className="px-4 py-3">Performance</th>
                                <th scope="col" className="px-4 py-3">Last Post</th>
                                <th scope="col" className="px-4 py-3">Next Post</th>
                                <th scope="col" className="px-4 py-3">Status</th>
                                <th scope="col" className="px-4 py-3 min-w-[200px]">Notes</th>
                                <th scope="col" className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccounts.map(acc => {
                                const status = getStatus(acc.nextPostDate);
                                return (
                                    <tr key={acc.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-4 py-3"><input type="text" value={acc.name} onChange={e => handleUpdateAccount(acc.id, 'name', e.target.value)} className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-400 rounded px-1 -mx-1" /></td>
                                        <td className="px-4 py-3"><StarRating score={acc.performance} onRate={(score) => handleUpdateAccount(acc.id, 'performance', score)} /></td>
                                        <td className="px-4 py-3"><input type="date" value={acc.lastPostDate} onChange={e => handleUpdateAccount(acc.id, 'lastPostDate', e.target.value)} className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-400 rounded px-1 -mx-1" /></td>
                                        <td className="px-4 py-3"><input type="date" value={acc.nextPostDate} onChange={e => handleUpdateAccount(acc.id, 'nextPostDate', e.target.value)} className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-400 rounded px-1 -mx-1" /></td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>{status.type}</span></td>
                                        <td className="px-4 py-3"><input type="text" value={acc.notes} onChange={e => handleUpdateAccount(acc.id, 'notes', e.target.value)} className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-400 rounded px-1 -mx-1" /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleGetSuggestions(acc)} disabled={!!isGenerating} className="p-1.5 rounded-full text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 disabled:cursor-not-allowed" title="AI Suggestions">
                                                    {isGenerating === acc.id ? <LoadingSpinner className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => handleGenerateIdeas(acc)} disabled={!!isGenerating} className="p-1.5 rounded-full text-slate-400 hover:bg-yellow-100 hover:text-yellow-600 disabled:cursor-not-allowed" title="Generate Pin Ideas">
                                                    {isGenerating === acc.id ? <LoadingSpinner className="w-4 h-4" /> : <LightbulbIcon className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => handleDeleteAccount(acc.id)} className="p-1.5 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600" title="Delete Account">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                             {accounts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 px-4">Click 'Add Account' to get started.</td>
                                </tr>
                             )}
                             {accounts.length > 0 && filteredAccounts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 px-4">No accounts match your filter.</td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>

            {(isIdeasModalOpen || isSuggestionsModalOpen) && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setIsIdeasModalOpen(false); setIsSuggestionsModalOpen(false); }}></div>
                    <div className="relative bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 id="modal-title" className="text-lg font-semibold text-slate-800">{modalTitle}</h2>
                            <button onClick={() => { setIsIdeasModalOpen(false); setIsSuggestionsModalOpen(false); }} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="min-h-[200px] max-h-[60vh] overflow-y-auto pr-2">
                             {isGenerating !== null ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <LoadingSpinner className="w-8 h-8" />
                                    <p className="mt-3">Generating...</p>
                                </div>
                             ) : isIdeasModalOpen ? (
                                typeof ideasModalContent === 'string' ? <div className="text-red-600 whitespace-pre-wrap">{ideasModalContent}</div> :
                                <div className="space-y-4">
                                  {(ideasModalContent as PinIdea[])?.map((idea, index) => (
                                    <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                      <h4 className="font-semibold text-slate-800">{idea.title}</h4>
                                      <p className="text-sm text-slate-600 mt-1">{idea.description}</p>
                                      <p className="text-sm font-semibold text-pink-600 mt-2">{idea.hashtags}</p>
                                    </div>
                                  ))}
                                </div>
                             ) : isSuggestionsModalOpen ? (
                                 typeof suggestionsModalContent === 'string' ? <div className="text-red-600 whitespace-pre-wrap">{suggestionsModalContent}</div> :
                                 <div className="space-y-4 text-sm">
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <h4 className="font-semibold text-slate-800">Best Posting Time</h4>
                                        <p className="text-slate-600">{(suggestionsModalContent as AISuggestions)?.bestTime}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <h4 className="font-semibold text-slate-800">Next Pin Type Suggestion</h4>
                                        <p className="text-slate-600">{(suggestionsModalContent as AISuggestions)?.nextPinType}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <h4 className="font-semibold text-slate-800">Seasonal Theme Idea</h4>
                                        <p className="text-slate-600">{(suggestionsModalContent as AISuggestions)?.seasonalTheme}</p>
                                    </div>
                                 </div>
                             ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssistantPage;
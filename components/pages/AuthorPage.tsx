
import React, { useState } from 'react';
import LoadingSpinner from '../icons/LoadingSpinner';

const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const BoltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const RandomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l6-3l6 3l6-3v13l-6 3l-6-3l-6 3z"></path><path d="M9 4v13"></path><path d="M15 7v13"></path></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
                <h3 className="text-md font-semibold text-slate-700 text-left">{title}</h3>
                <svg className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-200 text-slate-600">
                    {children}
                </div>
            )}
        </div>
    );
};

const AuthorPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<string[] | null>(null);

    const handleSearch = () => {
        setIsLoading(true);
        setResults(null);
        setTimeout(() => {
            setResults(['vintagedesign.com', 'techsavvy.ai', 'gourmetfinds.net', 'ecowise.org']);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
             <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200/80 space-y-12">
                {/* Intro Section */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-800">Expired Domain Suggestor</h1>
                    <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                        Discover premium expired domains with high value and brand potential from our curated database.
                    </p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center bg-slate-100 text-slate-600 p-3 rounded-full mb-3"><HistoryIcon /></div>
                            <h4 className="font-semibold text-slate-800">Recently Expired</h4>
                            <p className="text-sm text-slate-500">Access domains that have recently dropped.</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center bg-slate-100 text-slate-600 p-3 rounded-full mb-3"><FilterIcon /></div>
                            <h4 className="font-semibold text-slate-800">Quality Filtered</h4>
                            <p className="text-sm text-slate-500">We pre-screen for valuable opportunities.</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center bg-slate-100 text-slate-600 p-3 rounded-full mb-3"><BoltIcon /></div>
                            <h4 className="font-semibold text-slate-800">Instant Availability</h4>
                            <p className="text-sm text-slate-500">Real-time verification of domains.</p>
                        </div>
                    </div>
                </div>

                {/* Tool Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-center text-slate-800">Choose Your Domain Discovery Method</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                            <RandomIcon />
                            <h5 className="font-semibold text-lg mt-2">Random Suggestions</h5>
                            <p className="text-sm text-slate-600 mt-1">Discover hidden gems from our curated database.</p>
                            <button onClick={handleSearch} className="mt-4 w-full px-5 py-2.5 bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-slate-900">Get Random Suggestions</button>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                            <SearchIcon />
                            <h5 className="font-semibold text-lg mt-2">Keyword Suggestions</h5>
                            <p className="text-sm text-slate-600 mt-1">Find domains containing your specific keywords.</p>
                            <div className="mt-4 flex gap-2">
                                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm" placeholder="e.g., tech, health" />
                                <button onClick={handleSearch} className="px-5 py-2.5 bg-pink-500 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-pink-600">Search</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {(isLoading || results) && (
                    <div>
                        <h4 className="text-xl font-semibold text-center text-slate-800 mb-4">Domain Suggestions</h4>
                        {isLoading && (
                            <div className="text-center p-8 space-y-3">
                                <LoadingSpinner className="mx-auto h-8 w-8 text-pink-500" />
                                <h5 className="font-semibold">Searching for premium domains...</h5>
                                <p className="text-sm text-slate-500">Verifying availability in real-time.</p>
                            </div>
                        )}
                        {results && !isLoading && (
                            <div className="grid grid-cols-2 gap-4">
                                {results.map((domain, index) => (
                                    <div key={index} className={`p-3 rounded-lg flex justify-between items-center ${index % 2 === 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                                        <span className="font-mono font-semibold">{domain}</span>
                                        <span className="text-xs font-bold uppercase">{index % 2 === 0 ? 'Available' : 'Taken'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-200">
                    <div>
                        <h4 className="font-semibold text-lg text-slate-800 mb-2">SEO Advantages</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-start"><CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><strong>Existing Backlinks:</strong> Retain valuable backlink profiles.</li>
                            <li className="flex items-start"><CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><strong>Domain Age:</strong> Search engines often favor older domains.</li>
                            <li className="flex items-start"><CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><strong>Authority Transfer:</strong> Leverage existing domain authority.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-lg text-slate-800 mb-2">Business Benefits</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-start"><CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><strong>Brand Potential:</strong> Find memorable and brandable names.</li>
                            <li className="flex items-start"><CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><strong>Cost Efficiency:</strong> More affordable than premium purchases.</li>
                            <li className="flex items-start"><CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><strong>Competitive Edge:</strong> Acquire established domains quickly.</li>
                        </ul>
                    </div>
                </div>

                {/* FAQ Section */}
                 <div className="pt-8 border-t border-slate-200">
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <AccordionItem title="How are the suggested domains selected?">
                             Our system analyzes recently expired domains and filters them based on quality factors including age, length, pronounceability, and brand potential.
                        </AccordionItem>
                         <AccordionItem title="Are all suggested domains immediately available to register?">
                            We perform real-time availability checks and indicate which ones are available. Domains are in high demand, so availability can change quickly.
                        </AccordionItem>
                         <AccordionItem title="How often is the expired domain database updated?">
                            Our database is updated daily to include the latest expired and dropped domains, ensuring you have access to fresh opportunities.
                        </AccordionItem>
                    </div>
                </div>

             </div>
        </div>
    );
};

export default AuthorPage;

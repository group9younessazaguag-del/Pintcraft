import React, { useState } from 'react';
import SparklesIcon from '../icons/SparklesIcon';
import CsvIcon from '../icons/CsvIcon';
import LoadingSpinner from '../icons/LoadingSpinner';

const AuthorPage: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [valuation, setValuation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain) return;

        setIsLoading(true);
        setValuation(null);

        // Simulate an AI valuation
        setTimeout(() => {
            const mockPrice = Math.floor(Math.random() * (15000 - 500 + 1)) + 500;
            setValuation(`Estimated BIN Price: $${mockPrice.toLocaleString()}`);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4 space-y-16">
            {/* Search Section */}
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200/80 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800">Domain Name Rater</h1>
                <p className="mt-4 text-lg text-slate-600">We help you set the BIN price for your domain names.</p>
                
                <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="example.com"
                            className="flex-grow w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                        >
                            {isLoading ? <><LoadingSpinner className="mr-2" /> Searching...</> : 'Search'}
                        </button>
                    </div>
                </form>
                {valuation && !isLoading && (
                    <div className="mt-8 bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 font-semibold text-xl">
                        {valuation}
                    </div>
                )}
            </div>

            {/* Features Section */}
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800">Why <b className="text-pink-500">DNRater</b>?</h2>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80">
                        <span className="inline-block bg-slate-100 text-slate-600 p-4 rounded-full">
                            <SparklesIcon className="w-8 h-8" />
                        </span>
                        <h3 className="text-2xl font-semibold text-slate-800 mt-4">AI Estimator</h3>
                        <p className="text-slate-600 mt-2">
                            Using artificial intelligence to predict the Buy It Now (BIN) price of your domain names.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80">
                         <span className="inline-block bg-slate-100 text-slate-600 p-4 rounded-full">
                            <CsvIcon className="w-8 h-8" />
                        </span>
                        <h3 className="text-2xl font-semibold text-slate-800 mt-4">Bulk Domain Search</h3>
                        <p className="text-slate-600 mt-2">
                            Do you have big domain lists? Our bulk domain search makes it easy to search for the BIN price of multiple domains at once.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AuthorPage;
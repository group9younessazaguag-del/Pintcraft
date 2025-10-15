import React from 'react';
import CrownIcon from '../icons/CrownIcon';

interface UpgradePageProps {
    onUpgrade: () => void;
}

const Feature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        <span>{children}</span>
    </li>
);

const UpgradePage: React.FC<UpgradePageProps> = ({ onUpgrade }) => {
    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200/80 text-center">
                <div className="mx-auto bg-pink-100 text-pink-600 w-16 h-16 rounded-full flex items-center justify-center">
                    <CrownIcon className="w-9 h-9" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-800 mt-6">Upgrade to Pin4You Pro</h1>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-600">
                    Unlock the full potential of AI-powered pin creation and supercharge your Pinterest workflow.
                </p>

                <div className="grid md:grid-cols-2 gap-8 text-left my-12">
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800">Free Plan</h2>
                        <ul className="space-y-4 mt-4 text-slate-600">
                           <Feature><strong>20</strong> Pin Generations / Month</Feature>
                           <Feature>All <strong>30+</strong> Professional Templates</Feature>
                           <Feature>CSV Bulk Generation</Feature>
                           <Feature>AI Generates <strong>Placeholder</strong> Content</Feature>
                        </ul>
                    </div>
                    <div className="bg-pink-50 p-6 rounded-lg border-2 border-pink-500 ring-4 ring-pink-500/10">
                        <h2 className="text-xl font-semibold text-pink-800">Pro Plan</h2>
                         <ul className="space-y-4 mt-4 text-slate-700">
                           <Feature><strong>Unlimited</strong> Pin Generations</Feature>
                           <Feature>All <strong>30+</strong> Professional Templates</Feature>
                           <Feature>CSV Bulk Generation</Feature>
                           <Feature><strong>High-Quality AI</strong> Text & Image Generation</Feature>
                           <Feature><strong>✨ NEW: Automatic Pin Generation</strong></Feature>
                        </ul>
                    </div>
                </div>

                <div className="mt-8">
                     <p className="text-slate-500 text-sm mb-4">(This is a demo. Clicking below will enable Pro features for this session.)</p>
                    <button 
                        onClick={() => {
                            onUpgrade();
                            window.location.hash = 'home';
                        }}
                        className="px-8 py-4 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 transform hover:scale-105 text-lg"
                    >
                        Upgrade Now & Unleash AI
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;

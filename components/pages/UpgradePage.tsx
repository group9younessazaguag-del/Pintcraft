import React from 'react';
import CrownIcon from '../icons/CrownIcon';

const UpgradePage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200/80 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg -mt-20 mb-8">
            <CrownIcon className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">Upgrade to Pin4You Pro</h1>
        <p className="lead mt-4 max-w-2xl mx-auto text-slate-600">
          Unlock your full creative potential and supercharge your Pinterest workflow. Go Pro to get unlimited access to all our powerful features.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 my-12 text-left">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-700">Unlimited Generations</h3>
                <p className="text-sm text-slate-500 mt-1">Create as many pins as you need without any daily limits. Perfect for agencies and power users.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-700">All Templates</h3>
                <p className="text-sm text-slate-500 mt-1">Get full access to our entire library of premium, high-converting pin templates.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-700">Priority Support</h3>
                <p className="text-sm text-slate-500 mt-1">Jump to the front of the line with dedicated email support for any questions or issues.</p>
            </div>
        </div>
        
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-8 max-w-sm mx-auto">
            <h2 className="text-3xl font-bold text-rose-900">$19 <span className="text-lg font-medium">/ month</span></h2>
            <p className="text-sm text-rose-700 mt-1">Billed monthly. Cancel anytime.</p>
            <button className="mt-6 w-full px-8 py-4 bg-rose-500 text-white font-bold rounded-xl shadow-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-300 text-lg flex items-center justify-center gap-2">
                <CrownIcon className="w-6 h-6" />
                <span>Start Your Pro Journey</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;

import React from 'react';
import CrownIcon from './icons/CrownIcon';

interface LimitReachedModalProps {
  onClose: () => void;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8 text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto bg-amber-100 text-amber-600 w-16 h-16 rounded-full flex items-center justify-center">
            <CrownIcon className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mt-6">Monthly Limit Reached</h2>
        <p className="text-slate-600 mt-3">
          You've used all 20 of your free pin generations for this month. Upgrade to Pro to continue creating with unlimited generations.
        </p>
        <div className="mt-8 space-y-3">
            <a 
                href="#upgrade"
                onClick={onClose}
                className="block w-full px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all"
            >
                Upgrade to Pro
            </a>
            <button 
                onClick={onClose}
                className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
            >
                Maybe Later
            </button>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedModal;

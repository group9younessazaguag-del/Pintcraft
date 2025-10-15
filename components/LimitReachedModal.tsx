import React from 'react';
import CrownIcon from './icons/CrownIcon';

interface LimitReachedModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="limitReachedModalTitle"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8 space-y-6 transform transition-all text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-pink-100">
          <CrownIcon className="h-8 w-8 text-pink-600" />
        </div>
        <div>
          <h2 id="limitReachedModalTitle" className="text-2xl font-bold text-slate-800">
            Daily Limit Reached
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            You've used all your free generations for today. Upgrade to Pin4You Pro for unlimited pin creation and access to all premium features!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
          <button 
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-300"
          >
            Maybe Later
          </button>
          <button 
            onClick={onUpgrade}
            className="w-full px-6 py-2.5 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <CrownIcon className="w-5 h-5" />
            <span>Upgrade to Pro</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedModal;

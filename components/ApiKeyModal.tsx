
import React from 'react';

interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apiKeyModalTitle"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8 space-y-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 id="apiKeyModalTitle" className="text-2xl font-bold text-slate-800">
            Managing Your API Key
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-slate-700 text-lg mb-2">Why is the API key handled this way?</h3>
          <p className="text-slate-600 text-sm">
            For your security, this application is designed to use an API key from a secure environment setting. Storing the key directly in the browser or in the code could expose it to others. Using an environment variable (or a "secret") is the industry standard for keeping keys safe.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-700 text-lg mb-3">How to Set or Change Your API Key</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold rounded-full mr-4">1</div>
              <div>
                <h4 className="font-semibold text-slate-800">Get your Google AI API key</h4>
                <p className="text-sm text-slate-600">
                  If you don't have one, you can create one at the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline hover:text-pink-700">Google AI Studio</a>.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold rounded-full mr-4">2</div>
              <div>
                <h4 className="font-semibold text-slate-800">Set the API_KEY Secret</h4>
                <p className="text-sm text-slate-600 mb-2">
                  In your hosting environment (like AI Studio, Glitch, Vercel, or your local terminal), find the section for "Secrets" or "Environment Variables".
                </p>
                <div className="bg-slate-100 p-3 rounded-lg text-sm border border-slate-200">
                  <p>Create a new secret with the following name and value:</p>
                  <p className="mt-2"><strong>Name:</strong> <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded">API_KEY</code></p>
                  <p className="mt-1"><strong>Value:</strong> <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded">[Your actual API key here]</code></p>
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold rounded-full mr-4">3</div>
              <div>
                <h4 className="font-semibold text-slate-800">Save and Refresh</h4>
                <p className="text-sm text-slate-600">
                  Save your changes in the environment settings. The application should automatically pick up the new key. You may need to refresh this page.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right pt-4 border-t border-slate-200">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;

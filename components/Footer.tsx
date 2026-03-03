
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Pin4You. All Rights Reserved.
          </p>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a href="/#/facebook-post-generator" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Facebook Post Generator</a>
            <a href="/#/facebook-page-builder" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Facebook Page Builder</a>
            <a href="/#/quote-generator" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Quote Generator</a>
            <a href="/#/content-generator" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">AI Content Idea Generator</a>
            <a href="/#/pin-generator" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Pin Generator</a>
            <a href="/#/welcome" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Overview</a>
            <a href="/#/assistant" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Assistant</a>
            <a href="/#/domain-suggestor" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Domain Rater</a>
            <a href="/#/how-to-use" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">How to Use</a>
            <a href="/#/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">About</a>
            <a href="/#/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Contact Us</a>
            <a href="/#/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Privacy</a>
            <a href="/#/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Terms</a>
            <a href="/#/admin" className="text-sm text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">Admin</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

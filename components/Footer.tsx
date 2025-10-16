import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Pin4You. All Rights Reserved.
          </p>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a href="/home" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">Pin Generator</a>
            <a href="/content-generator" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">Content Generator</a>
            <a href="/how-to-use" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">How to Use</a>
            <a href="/about" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">About</a>
            <a href="/contact" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">Contact Us</a>
            <a href="/privacy" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">Privacy</a>
            <a href="/terms" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">Terms</a>
            <a href="/admin" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">Admin</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
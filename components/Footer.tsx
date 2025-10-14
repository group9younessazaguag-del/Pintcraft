import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Pinterest Pin Generator By youness azaguag. All Rights Reserved.
          </p>
          <nav className="flex gap-4 md:gap-6">
            <a href="#" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">Home</a>
            <a href="#about" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">About</a>
            <a href="#privacy" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">Privacy Policy</a>
            <a href="#terms" className="text-sm text-slate-600 hover:text-pink-500 transition-colors">Terms of Service</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
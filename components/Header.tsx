import React from 'react';
import PinIcon from './icons/PinIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex justify-center items-center gap-3">
            <PinIcon className="w-7 h-7 text-pink-500" />
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">
              Pin4You
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
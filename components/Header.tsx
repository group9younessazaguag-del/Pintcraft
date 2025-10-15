import React from 'react';
import PinIcon from './icons/PinIcon';
import CrownIcon from './icons/CrownIcon';

interface HeaderProps {
    userIsPro: boolean;
    onUpgradeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ userIsPro, onUpgradeClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <PinIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pin4You</h1>
          </a>
          
          <nav className="flex items-center gap-4">
            <a href="#/about" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-pink-500 transition-colors">
              About
            </a>
            
            {!userIsPro && (
              <button 
                onClick={onUpgradeClick}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white text-sm font-semibold rounded-full shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all"
              >
                <CrownIcon className="w-4 h-4" />
                <span>Upgrade</span>
              </button>
            )}

            {userIsPro && (
                 <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
                    <CrownIcon className="w-4 h-4 text-amber-600" />
                    <span>Pro Member</span>
                </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import PinIcon from './icons/PinIcon';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';

interface HeaderProps {
    isPro: boolean;
    generationCount: number;
}

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
    <a 
      href={href} 
      onClick={onClick}
      className="text-slate-600 hover:text-pink-500 transition-colors duration-200 text-sm font-medium"
    >
        {children}
    </a>
);

const MobileNavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
    <a 
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-lg text-slate-700 hover:bg-slate-100 hover:text-pink-500 rounded-lg transition-colors duration-200"
    >
        {children}
    </a>
);

const Header: React.FC<HeaderProps> = ({ isPro, generationCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const pinsUsed = isPro ? 0 : generationCount;
  const pinsLimit = 20;
  const percentageUsed = (pinsUsed / pinsLimit) * 100;

  return (
    <>
      <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand Name */}
            <a href="#home" onClick={closeMobileMenu} className="flex items-center gap-3">
              <PinIcon className="w-7 h-7 text-pink-500" />
              <h1 className="text-xl font-semibold tracking-tight text-slate-800">
                Pin4You
              </h1>
            </a>

            {/* Desktop Navigation & User Status */}
            <nav className="hidden md:flex items-center gap-6">
                {!isPro && (
                    <div className="flex items-center gap-3 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/80">
                        <div className="w-24">
                           <div className="bg-slate-200 rounded-full h-1.5 w-full overflow-hidden">
                               <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${percentageUsed}%`}}></div>
                           </div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{pinsUsed} / {pinsLimit} Pins</span>
                    </div>
                )}
                <NavLink href="#how-to-use">How to Use</NavLink>
                <a href="#upgrade" className="px-4 py-2 text-sm font-semibold text-white bg-pink-500 rounded-full shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200 transform hover:scale-105">
                    ✨ {isPro ? 'You are Pro!' : 'Upgrade to Pro'}
                </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu} 
                className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay & Panel */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}
      
      <div 
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center h-16 px-4 border-b border-slate-200">
             <h2 className="font-semibold text-slate-800">Menu</h2>
             <button onClick={closeMobileMenu} className="p-2 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close menu">
                <CloseIcon className="w-6 h-6" />
             </button>
        </div>
        <nav className="p-4 space-y-2">
            {!isPro && (
                <div className="px-4 py-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-800 mb-2">Free Plan Usage</p>
                    <div className="bg-slate-200 rounded-full h-2 w-full overflow-hidden">
                       <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${percentageUsed}%`}}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">{pinsUsed} of {pinsLimit} pins generated this month.</p>
                </div>
            )}
             <a href="#upgrade" onClick={closeMobileMenu} className="block w-full text-center px-4 py-3 text-lg font-semibold text-white bg-pink-500 rounded-lg shadow-sm hover:bg-pink-600 transition-colors duration-200">
                ✨ {isPro ? 'You are Pro!' : 'Upgrade to Pro'}
             </a>
            <MobileNavLink href="#home" onClick={closeMobileMenu}>Home</MobileNavLink>
            <MobileNavLink href="#how-to-use" onClick={closeMobileMenu}>How to Use</MobileNavLink>
            <MobileNavLink href="#about" onClick={closeMobileMenu}>About</MobileNavLink>
            <MobileNavLink href="#terms" onClick={closeMobileMenu}>Terms of Service</MobileNavLink>
            <MobileNavLink href="#privacy" onClick={closeMobileMenu}>Privacy Policy</MobileNavLink>
            <MobileNavLink href="#contact" onClick={closeMobileMenu}>Contact Us</MobileNavLink>
        </nav>
      </div>
    </>
  );
};

export default Header;

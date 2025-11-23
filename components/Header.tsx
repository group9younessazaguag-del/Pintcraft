


import React, { useState, useEffect } from 'react';
import PinIcon from './icons/PinIcon';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';
import RewriteIcon from './icons/RewriteIcon';

const getCurrentPage = () => {
    const hash = window.location.hash.substring(1).replace(/^\/|\/$/g, '');
    return hash || 'rewrite-title-description';
};

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void; isActive: boolean }> = ({ href, children, onClick, isActive }) => (
    <a 
      href={href} 
      onClick={onClick}
      className={`flex items-center h-16 px-3 transition-all duration-200 text-sm font-medium border-b-2 whitespace-nowrap flex-shrink-0 ${isActive ? 'text-pink-500 font-semibold border-pink-500' : 'text-slate-600 hover:text-pink-500 border-transparent'}`}
    >
        {children}
    </a>
);

const MobileNavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void; isActive: boolean }> = ({ href, children, onClick, isActive }) => (
    <a 
      href={href}
      onClick={onClick}
      className={`block px-4 py-3 text-lg rounded-lg transition-colors duration-200 ${isActive ? 'bg-pink-50 text-pink-600 font-semibold' : 'text-slate-700 hover:bg-slate-100 hover:text-pink-500'}`}
    >
        {children}
    </a>
);

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState(getCurrentPage());

  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(getCurrentPage());
    };
    window.addEventListener('hashchange', handleHashChange);
    // Also handle initial load correctly
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: "/#/rewrite-title-description", label: "Desc Rewrite" },
    { href: "/#/facebook-post-generator", label: "FB Post Gen" },
    { href: "/#/facebook-page-builder", label: "FB Page Builder" },
    { href: "/#/quote-generator", label: "Quote Gen" },
    { href: "/#/content-generator", label: "Content Ideas" },
    { href: "/#/pin-generator", label: "Pin Gen" },
    { href: "/#/assistant", label: "Assistant" },
    { href: "/#/domain-suggestor", label: "Domain Rater" },
    { href: "/#/author", label: "Author" },
    { href: "/#/how-to-use", label: "Guide" },
    { href: "/#/about", label: "About" },
    { href: "/#/contact", label: "Contact" },
  ];

  const mobileNavItems = [
      ...navItems,
      { href: "/#/privacy", label: "Privacy Policy" },
  ];


  return (
    <>
      <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center h-16">
            {/* Logo and Brand Name - Fixed Layout */}
            <div className="flex-shrink-0 mr-6">
                <a href="/#/rewrite-title-description" onClick={closeMobileMenu} className="flex items-center gap-2 group">
                <PinIcon className="w-7 h-7 text-pink-500 transition-colors group-hover:text-pink-600" />
                <h1 className="text-xl font-semibold tracking-tight text-slate-800 transition-colors group-hover:text-slate-900 whitespace-nowrap">
                    Pin4You
                </h1>
                </a>
            </div>

            {/* Desktop Navigation - Flexible & Scrollable */}
            <div className="hidden md:flex flex-1 min-w-0 overflow-hidden justify-end">
                <nav 
                    className="flex items-center gap-1 overflow-x-auto no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style>{`
                        nav::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    {navItems.map(item => (
                        <NavLink 
                        key={item.href}
                        href={item.href}
                        isActive={activePage === (item.href.substring(2) || 'rewrite-title-description')}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-auto flex-shrink-0">
              <button 
                onClick={toggleMobileMenu} 
                className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        >
        </div>
      )}
      
      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center h-16 px-4 border-b border-slate-200">
             <h2 className="font-semibold text-slate-800">Menu</h2>
             <button 
                onClick={closeMobileMenu} 
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                aria-label="Close menu"
             >
                <CloseIcon className="w-6 h-6" />
             </button>
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20">
            {mobileNavItems.map(item => (
                <MobileNavLink
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    isActive={activePage === (item.href.substring(2) || 'rewrite-title-description')}
                >
                    {item.label}
                </MobileNavLink>
            ))}
        </nav>
      </div>
    </>
  );
};

export default Header;
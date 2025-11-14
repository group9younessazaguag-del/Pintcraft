import React, { useState, useEffect } from 'react';
import PinIcon from './icons/PinIcon';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';
import AssistantIcon from './icons/AssistantIcon';

const getCurrentPage = () => {
    const hash = window.location.hash.substring(1).replace(/^\/|\/$/g, '');
    return hash || 'pin-generator';
};

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void; isActive: boolean }> = ({ href, children, onClick, isActive }) => (
    <a 
      href={href} 
      onClick={onClick}
      className={`flex items-center h-16 transition-all duration-200 text-sm font-medium border-b-2 ${isActive ? 'text-pink-500 font-semibold border-pink-500' : 'text-slate-600 hover:text-pink-500 border-transparent'}`}
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
    { href: "/#/facebook-post-generator", label: "Facebook Post Generator" },
    { href: "/#/facebook-page-builder", label: "Facebook Page Builder" },
    { href: "/#/content-generator", label: "AI Content Idea Generator" },
    { href: "/#/pin-generator", label: "Pin Generator" },
    { href: "/#/assistant", label: "Assistant" },
    { href: "/#/domain-suggestor", label: "Domain Rater" },
    { href: "/#/author", label: "Author" },
    { href: "/#/how-to-use", label: "How to Use" },
    { href: "/#/about", label: "About" },
    { href: "/#/contact", label: "Contact Us" },
  ];

  const mobileNavItems = [
      ...navItems.slice(0, 7),
      { href: "/#/privacy", label: "Privacy Policy" },
      ...navItems.slice(7),
  ];


  return (
    <>
      <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand Name */}
            <a href="/#/pin-generator" onClick={closeMobileMenu} className="flex items-center gap-3 group">
              <PinIcon className="w-7 h-7 text-pink-500 transition-colors group-hover:text-pink-600" />
              <h1 className="text-xl font-semibold tracking-tight text-slate-800 transition-colors group-hover:text-slate-900">
                Pin4You
              </h1>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <NavLink 
                  key={item.href}
                  href={item.href}
                  isActive={activePage === (item.href.substring(2) || 'pin-generator')}
                >
                    {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
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
        <nav className="p-4 space-y-2">
            {mobileNavItems.map(item => (
                <MobileNavLink
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    isActive={activePage === (item.href.substring(2) || 'pin-generator')}
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
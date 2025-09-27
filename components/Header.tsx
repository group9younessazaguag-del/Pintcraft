
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
          ✨ Pinterest Pin Template Generator
        </h1>
      </div>
    </header>
  );
};

export default Header;
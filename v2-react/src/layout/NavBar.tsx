import React, { useState } from 'react';
import MobileNav from '../components/MobileNav';
import TouchWrapper from '../components/TouchWrapper';
import { useMobileDetect } from '../hooks/useMobileDetect';

const NavBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isTouchDevice } = useMobileDetect();

  const links = [
    { href: "https://thefinalsloadout.com/", label: "Home" },
    { href: "https://thefinalsloadout.com/ragequit/index.html", label: "Rage Quit" },
    { href: "https://thefinalsloadout.com/patch-notes/index.html", label: "Patch Notes" },
    { href: "https://thefinalsloadout.com/feedback/index.html", label: "Feedback" }
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-surface-dark-transparent border-b border-purple-500/40 neon-purple">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <img 
                src="/images/the-finals-logo.webp" 
                alt="The Finals" 
                className="h-3.5 sm:h-4 w-auto animate-pulse-slow"
              />
              <span className="hidden sm:inline text-lg font-bold gradient-text">
                Loadout Generator
              </span>
            </div>

            {/* Mobile Menu Button */}
            <TouchWrapper
              onTap={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden"
              hapticFeedback={isTouchDevice}
            >
              <button 
                className="p-2 rounded-lg hover:bg-purple-900/30 transition-colors touch-target"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </TouchWrapper>

            {/* Desktop Nav Links */}
            <div className="hidden sm:flex items-center space-x-6">
              {links.map((link) => (
                <a 
                  key={link.href}
                  href={link.href}
                  className="relative py-2 text-gray-300 hover:text-accent-gold transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-purple-400 after:to-yellow-400 after:transition-all after:duration-300 hover:after:w-full"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        links={links}
      />
    </>
  );
};

export default NavBar;
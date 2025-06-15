import React, { useState, useEffect } from 'react';
import TouchWrapper from './TouchWrapper';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile navigation menu with smooth animations
 */
const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { href: '#generator', label: 'Generator', icon: '🎲' },
    { href: '#history', label: 'History', icon: '📜' },
    { href: '#about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Menu with Swipe Support */}
      <TouchWrapper
        onSwipeLeft={onClose}
        swipeThreshold={80}
        className="sm:hidden"
      >
        <div 
          className={`
            fixed top-16 left-0 right-0 bottom-0 bg-gray-900/98 backdrop-blur-md z-50 
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
        <nav className="p-6">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <TouchWrapper
                  onTap={() => {
                    window.location.href = item.href;
                    onClose();
                  }}
                  className="block"
                >
                  <div
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-purple-600/20 
                             transition-colors group cursor-pointer"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-lg font-medium group-hover:text-purple-400 transition-colors">
                      {item.label}
                    </span>
                    <svg 
                      className="w-5 h-5 ml-auto text-gray-400 group-hover:text-purple-400 
                               transform group-hover:translate-x-1 transition-all" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </TouchWrapper>
              </li>
            ))}
          </ul>

          {/* Social Links */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-4">Connect with us</p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-purple-600/20 
                         flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-purple-600/20 
                         flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
          {/* Swipe hint */}
          <div className="absolute bottom-8 left-4 right-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Swipe left to close
            </p>
          </div>
        </nav>
      </div>
      </TouchWrapper>
    </>
  );
};

export default MobileNav;
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-20 bg-surface-dark border-t border-purple-500/60">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          {/* Season Badge */}
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-gold"></span>
            </span>
            <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
              Season 7: The Divide
            </span>
          </div>

          {/* Main Footer Content */}
          <div className="text-sm text-gray-400">
            <span>© 2025 TheFinalsLoadout.com</span>
            <span className="mx-2">|</span>
            <span>
              Created by{' '}
              <a 
                href="https://paultakisaki.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-blue hover:text-accent-gold transition-colors duration-300"
              >
                Paul Takisaki
              </a>
            </span>
            <span className="mx-2">|</span>
            <a 
              href="https://thefinalsloadout.com/legal/legal.html"
              className="text-secondary-blue hover:text-accent-gold transition-colors duration-300"
            >
              Legal Disclaimer
            </a>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
    </footer>
  );
};

export default Footer;
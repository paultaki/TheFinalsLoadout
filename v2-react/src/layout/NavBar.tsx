import React, { useState, useEffect } from 'react';

const NavBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: "https://thefinalsloadout.com/", label: "Home" },
    { href: "https://thefinalsloadout.com/ragequit/index.html", label: "Rage Quit" },
    { href: "https://thefinalsloadout.com/patch-notes/index.html", label: "Patch Notes" },
    { href: "https://thefinalsloadout.com/feedback/index.html", label: "Feedback" }
  ];

  return (
    <>
      {/* Scroll Progress Bar at very top */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-gray-900/50">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 via-magenta-500 to-yellow-400 transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Placeholder for fixed navbar and progress bar */}
      <div className="h-12" />
      
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent backdrop-blur-md neon-outline">
        <nav className="pointer-events-auto bg-gray-950/95 border-b border-[#8a2eff]/40" style={{ filter: 'drop-shadow(0 0 6px #8a2effaa)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-start h-12">

            {/* Nav Links - Always visible */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              {links.map((link) => (
                <a 
                  key={link.href}
                  href={link.href}
                  className="inline-block relative py-2 text-xs sm:text-sm text-gray-300 hover:text-accent-gold transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-purple-400 after:to-yellow-400 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
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
      </header>

    </>
  );
};


export default NavBar;
import React from 'react';
import styles from './MobileNav.module.css';

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links?: NavLink[];
}

/**
 * Mobile navigation menu with smooth animations
 */
const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, links }) => {
  const navItems = links || [
    { href: '#generator', label: 'Generator' },
    { href: '#history', label: 'History' },
    { href: '#about', label: 'About' },
  ];

  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return '🏠';
      case 'generator': return '🎲';
      case 'history': return '📜';
      case 'about': return 'ℹ️';
      case 'rage quit': return '😤';
      case 'patch notes': return '📋';
      case 'feedback': return '💬';
      default: return '📌';
    }
  };

  // Only render on mobile screens
  if (typeof window !== 'undefined' && window.innerWidth >= 640) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Mobile Menu - Compact dropdown style */}
      <div 
        className={`
          fixed top-12 right-4 w-64 max-w-[calc(100vw-2rem)] bg-gray-950/98 backdrop-blur-md z-50 rounded-xl
          transform transition-all duration-300 ease-in-out border border-purple-500/40
          shadow-2xl ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}
        `}
      >
        <nav className="p-2 menu-reset">
          <ul className="flex flex-col gap-2 md:gap-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={onClose}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`${styles.navLink} flex items-center gap-3 cursor-pointer text-sm`}
                >
                    <span className="text-lg">{getIcon(item.label)}</span>
                    <span className="font-medium group-hover:text-purple-400 transition-colors">
                      {item.label}
                    </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default MobileNav;
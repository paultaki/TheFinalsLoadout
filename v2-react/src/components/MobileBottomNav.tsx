import React, { useState, useEffect } from 'react';
import TouchWrapper from './TouchWrapper';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface MobileBottomNavProps {
  activeSection?: string;
}

/**
 * Mobile bottom navigation bar with smooth animations
 * Provides iOS/Android-style bottom navigation
 */
const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeSection = '' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '#'
    },
    {
      id: 'generator',
      label: 'Generate',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      href: '#generator'
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '#history'
    },
    {
      id: 'features',
      label: 'Features',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      href: '#features'
    }
  ];

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (href: string) => {
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`mobile-bottom-nav ${isVisible ? 'visible' : 'hidden'}`}
    >
      <div className="nav-container">
        {navItems.map((item) => (
          <TouchWrapper
            key={item.id}
            onTap={() => handleNavClick(item.href)}
            className="nav-item-wrapper"
          >
            <div 
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            >
              <div className="nav-icon">
                {item.icon}
              </div>
              <span className="nav-label">{item.label}</span>
              {activeSection === item.id && (
                <div className="active-indicator" />
              )}
            </div>
          </TouchWrapper>
        ))}
      </div>

      <style jsx>{`
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(168, 85, 247, 0.2);
          z-index: 40;
          transform: translateY(0);
          transition: transform 0.3s ease;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .mobile-bottom-nav.hidden {
          transform: translateY(100%);
        }

        .nav-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0.5rem 0;
        }

        .nav-item-wrapper {
          flex: 1;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          color: #9ca3af;
          transition: all 0.2s ease;
          position: relative;
          min-height: 60px;
        }

        .nav-item.active {
          color: #a855f7;
        }

        .nav-icon {
          transition: transform 0.2s ease;
        }

        .nav-item.active .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          font-size: 0.75rem;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        .active-indicator {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background: linear-gradient(90deg, #a855f7 0%, #eab308 100%);
          border-radius: 0 0 3px 3px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Hide on larger screens */
        @media (min-width: 640px) {
          .mobile-bottom-nav {
            display: none;
          }
        }

        /* Adjust for iPhone notch */
        @supports (padding: max(0px)) {
          .mobile-bottom-nav {
            padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </nav>
  );
};

export default MobileBottomNav;
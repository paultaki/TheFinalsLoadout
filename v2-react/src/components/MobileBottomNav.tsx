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
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '#'
    },
    {
      id: 'generator',
      label: 'Generate',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      href: '#generator'
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '#history'
    },
    {
      id: 'features',
      label: 'Info',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      className="sm:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to bottom, rgba(18, 18, 26, 0.98), rgba(10, 10, 15, 0.98))',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(171, 71, 188, 0.3)',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5), 0 -2px 20px rgba(171, 71, 188, 0.2)',
        zIndex: 40,
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.75rem 0',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {navItems.map((item) => (
          <TouchWrapper
            key={item.id}
            onTap={() => handleNavClick(item.href)}
            className="flex-1"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              color: activeSection === item.id ? '#FFD700' : '#6b7280',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              minHeight: '48px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                transform: activeSection === item.id ? 'scale(1.15) translateY(-2px)' : 'scale(1)',
                filter: activeSection === item.id ? 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.5))' : 'none'
              }}>
                {React.cloneElement(item.icon as React.ReactElement, {
                  style: { width: '20px', height: '20px' }
                })}
              </div>
              <span style={{
                fontSize: '0.65rem',
                marginTop: '0.25rem',
                fontWeight: activeSection === item.id ? 600 : 400,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                opacity: activeSection === item.id ? 1 : 0.7
              }}>{item.label}</span>
              {activeSection === item.id && (
                <div style={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
                }} />
              )}
            </div>
          </TouchWrapper>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
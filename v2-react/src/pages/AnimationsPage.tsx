import React, { useState, useEffect } from 'react';
import { GameProvider } from '../context/GameProvider';
import { LoadoutHistoryProvider } from '../context/LoadoutHistoryContext';
import GameFlow from '../components/GameFlow';
import LoadoutHistory from '../components/LoadoutHistory';
import NavBar from '../layout/NavBar';
import Footer from '../layout/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import MobilePerformanceMonitor from '../components/MobilePerformanceMonitor';
import PullToRefresh from '../components/PullToRefresh';
import { useMobileDetect } from '../hooks/useMobileDetect';
import './AnimationsPage.css';
import './AnimationsPage.premium.css';

/**
 * AnimationsPage - Mobile-first full page implementation with navigation, hero, animations, and footer
 */
const AnimationsPage: React.FC = () => {
  const { isMobile, isTouchDevice } = useMobileDetect();
  const [activeSection, setActiveSection] = useState('home');
  
  // Track active section for mobile UI enhancements
  useEffect(() => {
    const handleScroll = () => {
      // Determine active section
      const sections = ['generator', 'history'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      let currentSection = 'home';
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element && element.offsetTop <= scrollPosition) {
          currentSection = sectionId;
        }
      }
      setActiveSection(currentSection);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Removed intersection observer since features section was removed
  
  // Pull to refresh handler
  const handleRefresh = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.reload();
  };

  const content = (
    <div className="flex flex-col min-h-screen">
      {/* Cyber Grid Background */}
      <div className="cyber-grid" />
      
      {/* Navigation Bar with built-in scroll progress */}
      <NavBar />

      {/* Hero Section - Mobile Optimized */}
      <section id="home" className="relative pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="particle-field">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative container mx-auto px-4 pt-2 pb-1">
          <div className="text-center">
            {/* Centered Logo - Scaled to match heading width */}
            <div className="mb-1">
              <img 
                src="/images/the-finals-logo.webp" 
                alt="The Finals" 
                className="mx-auto filter drop-shadow-[0_0_15px_rgba(255,39,231,0.5)]"
                style={{ 
                  width: window.innerWidth >= 768 ? '260px' : '60%',
                  height: 'auto',
                  maxWidth: '80vw'
                }}
              />
            </div>

            {/* Title with Holographic Effect */}
            <div className="mb-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                <span className="holographic-text">THE FINALS</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-1">
                <span className="holographic-text">LOADOUT GENERATOR</span>
              </h2>
            </div>

            {/* Season Badge with Glow - Moved below title with less spacing */}
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card 
                          border border-yellow-400/50 rounded-full pulse-glow">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">SEASON 7: THE DIVIDE</span>
            </div>

            {/* Removed premium text per request */}
          </div>
        </div>
      </section>

      {/* Main content wrapper that grows to push footer down */}
      <div className="flex-1">
        {/* Wrap both sections in a single LoadoutHistoryProvider */}
        <LoadoutHistoryProvider>
          {/* Main Content - Animations */}
          <section id="generator" className="relative pt-2 pb-3 mt-4">
          {/* Section Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
          
          <div className="relative container mx-auto px-4">
            {/* Section Header - Compact with reduced spacing */}
            <div className="text-center mb-2">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text uppercase tracking-wider">
                Generate Your Loadout
              </h2>
            </div>

            {/* Game Flow Container with Mobile Optimizations */}
            <div className={`max-w-4xl mx-auto ${isMobile ? 'px-2' : ''}`}>
              <GameProvider>
                <div className="relative">
                  {/* Removed mobile progress indicator */}
                  <GameFlow />
                </div>
              </GameProvider>
            </div>
          </div>
        </section>

          {/* Loadout History Section */}
          <section id="history" className="py-0 relative pb-6">
            <LoadoutHistory />
          </section>
        </LoadoutHistoryProvider>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* Mobile Bottom Navigation - After footer to avoid gap */}
      {isMobile && <MobileBottomNav activeSection={activeSection} />}
      
      {/* Performance Monitor for Development */}
      {isMobile && <MobilePerformanceMonitor />}

    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      {isMobile && isTouchDevice ? (
        <PullToRefresh onRefresh={handleRefresh}>
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
    </div>
  );
};

export default AnimationsPage;
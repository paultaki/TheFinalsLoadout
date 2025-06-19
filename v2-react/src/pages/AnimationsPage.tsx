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
import '../styles/refined-fix.css';
// import DebugOverlay from '../components/DebugOverlay';
import { detectOverflow } from '../utils/debug-overflow';

/**
 * AnimationsPage - Mobile-first full page implementation with navigation, hero, animations, and footer
 */
const AnimationsPage: React.FC = () => {
  const { isMobile, isTouchDevice } = useMobileDetect();
  const [activeSection, setActiveSection] = useState('home');
  
  // Debug overflow on mount
  useEffect(() => {
    detectOverflow();
  }, []);
  
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
    <div className="min-h-screen w-full" style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
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

        <div className="relative w-full pt-2 pb-1" style={{ overflowX: 'hidden' }}>
          <div className="container mx-auto px-4" style={{ maxWidth: '1024px' }}>
            {/* Centered Logo - Scaled to match heading width */}
            <div className="mb-2 flex justify-center">
              <img 
                src="/images/the-finals-logo.webp" 
                alt="The Finals" 
                style={{ width: '172.40px', height: '168.80px' }}
                className="filter drop-shadow-[0_0_15px_rgba(255,39,231,0.5)]"
              />
            </div>

            {/* Title with Holographic Effect */}
            <div className="mb-2 w-full text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-center w-full">
                <span className="holographic-text inline-block">THE FINALS</span>
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mt-1 text-center w-full">
                <span className="holographic-text inline-block">LOADOUT GENERATOR</span>
              </h2>
            </div>

            {/* Season Badge with Glow - Moved below title with less spacing */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card 
                            border border-yellow-400/50 rounded-full pulse-glow">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">SEASON 7: THE DIVIDE</span>
              </div>
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
          
          <div className="relative mx-auto" style={{ maxWidth: '1024px', padding: '0 16px', width: '100%' }}>
            {/* Game Flow Container - Fully centered */}
            <div className="flex justify-center items-center w-full">
              <GameProvider>
                <GameFlow />
              </GameProvider>
            </div>
          </div>
        </section>

          {/* Loadout History Section */}
          <section id="history" className="py-0 relative pb-6">
            <div className="mx-auto" style={{ maxWidth: '1024px', width: '100%', padding: '0 16px' }}>
              <LoadoutHistory />
            </div>
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
    <>
      {isMobile && isTouchDevice ? (
        <PullToRefresh onRefresh={handleRefresh}>
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
    </>
  );
};

export default AnimationsPage;
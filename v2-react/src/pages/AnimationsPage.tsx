import React, { useState, useEffect } from 'react';
import { GameProvider } from '../context/GameProvider';
import { LoadoutHistoryProvider } from '../context/LoadoutHistoryContext';
import GameFlow from '../components/GameFlow';
import LoadoutHistory from '../components/LoadoutHistory';
import NavBar from '../layout/NavBar';
import Footer from '../layout/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import MobilePerformanceMonitor from '../components/MobilePerformanceMonitor';
import TouchWrapper from '../components/TouchWrapper';
import PullToRefresh from '../components/PullToRefresh';
import { useMobileDetect } from '../hooks/useMobileDetect';
import './AnimationsPage.css';
import './AnimationsPage.premium.css';

/**
 * AnimationsPage - Mobile-first full page implementation with navigation, hero, animations, and footer
 */
const AnimationsPage: React.FC = () => {
  const { isMobile, isTouchDevice } = useMobileDetect();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState('home');
  
  // Track scroll progress and active section for mobile UI enhancements
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
      
      // Determine active section
      const sections = ['generator', 'history', 'features'];
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
  
  // Intersection observer for lazy loading and animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));
    
    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);
  
  // Pull to refresh handler
  const handleRefresh = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.reload();
  };

  const content = (
    <>
      {/* Cyber Grid Background */}
      <div className="cyber-grid" />
      
      {/* Scroll Progress Indicator for Mobile */}
      {isMobile && (
        <div 
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-yellow-500 z-[60] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      )}
      
      {/* Navigation Bar */}
      <NavBar />

      {/* Hero Section - Mobile Optimized */}
      <section id="home" className="relative overflow-hidden">
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

        <div className="relative container mx-auto px-4 py-2 sm:py-4">
          <div className="text-center">
            {/* Logo removed - NavBar already has one */}

            {/* Title with Holographic Effect */}
            <div className="mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                <span className="holographic-text">THE FINALS</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-1">
                <span className="holographic-text">LOADOUT GENERATOR</span>
              </h2>
            </div>

            {/* Season Badge with Glow - Moved below title with less spacing */}
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card 
                          border border-yellow-400/50 rounded-full mb-4 pulse-glow">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">SEASON 7: THE DIVIDE</span>
            </div>

            {/* Removed premium text per request */}

            {/* Scroll Indicator with Touch Hint */}
            <TouchWrapper 
              onTap={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              onSwipeUp={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="inline-block mt-4"
            >
              <div className="animate-bounce cursor-pointer">
                <svg className="w-6 h-6 mx-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {isMobile && (
                  <p className="text-xs text-purple-400 mt-2">Swipe up or tap</p>
                )}
              </div>
            </TouchWrapper>
          </div>
        </div>
      </section>

      {/* Wrap both sections in a single LoadoutHistoryProvider */}
      <LoadoutHistoryProvider>
        {/* Main Content - Animations */}
        <section id="generator" className="relative py-3 sm:py-4">
          {/* Section Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
          
          <div className="relative container mx-auto px-4">
            {/* Section Header - Compact with reduced spacing */}
            <div className="text-center mb-3">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text uppercase tracking-wider">
                Generate Your Loadout
              </h2>
            </div>

            {/* Game Flow Container with Mobile Optimizations */}
            <div className={`max-w-4xl mx-auto ${isMobile ? 'px-2' : ''}`}>
              <GameProvider>
                <div className="relative">
                  {/* Mobile-only: Sticky progress indicator */}
                  {isMobile && (
                    <div className="sticky top-16 z-30 bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg mb-4 text-center text-sm text-gray-400">
                      <span>Step 1: Choose number of loadouts</span>
                    </div>
                  )}
                  <GameFlow />
                </div>
              </GameProvider>
            </div>
          </div>
        </section>

        {/* Loadout History Section */}
        <section id="history" className="py-8 sm:py-12 relative">
          <LoadoutHistory />
        </section>
      </LoadoutHistoryProvider>

      {/* Features Section with Lazy Loading */}
      <section 
        id="features"
        className={`py-12 sm:py-16 transition-all duration-700 ${
          visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-purple-900/20 to-transparent border border-purple-500/20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Quick Generate</h3>
              <p className="text-gray-400 text-sm">Get a random loadout in seconds with our streamlined interface</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-yellow-900/20 to-transparent border border-yellow-500/20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-600/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">All Classes</h3>
              <p className="text-gray-400 text-sm">Support for Light, Medium, and Heavy builds</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-pink-900/20 to-transparent border border-pink-500/20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-600/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Track History</h3>
              <p className="text-gray-400 text-sm">Keep track of all your generated loadouts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      {/* Mobile Bottom Navigation - After footer to avoid gap */}
      {isMobile && <MobileBottomNav activeSection={activeSection} />}
      
      {/* Performance Monitor for Development */}
      {isMobile && <MobilePerformanceMonitor />}

    </>
  );
  
  return (
    <div className="min-h-screen">
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
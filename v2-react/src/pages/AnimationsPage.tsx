import React, { useState, useEffect } from 'react';
import { GameProvider } from '../context/GameProvider';
import { LoadoutHistoryProvider } from '../context/LoadoutHistoryContext';
import GameFlow from '../components/GameFlow';
import LoadoutHistory from '../components/LoadoutHistory';
import MobileNav from '../components/MobileNav';
import MobileBottomNav from '../components/MobileBottomNav';
import MobilePerformanceMonitor from '../components/MobilePerformanceMonitor';
import TouchWrapper from '../components/TouchWrapper';
import PullToRefresh from '../components/PullToRefresh';
import { useMobileDetect } from '../hooks/useMobileDetect';
import './AnimationsPage.css';

/**
 * AnimationsPage - Mobile-first full page implementation with navigation, hero, animations, and footer
 */
const AnimationsPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile, isTablet, isTouchDevice } = useMobileDetect();
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
      {/* Scroll Progress Indicator for Mobile */}
      {isMobile && (
        <div 
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-yellow-500 z-[60] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      )}
      {/* Navigation Bar - Mobile First */}
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img 
                src="/images/the-finals-logo.webp" 
                alt="The Finals" 
                className="h-8 w-auto"
              />
              <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
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
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors touch-target"
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
              <a href="#generator" className="hover:text-purple-400 transition-colors">Generator</a>
              <a href="#history" className="hover:text-purple-400 transition-colors">History</a>
              <a href="#about" className="hover:text-purple-400 transition-colors">About</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

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

        <div className="relative container mx-auto px-4 py-12 sm:py-20">
          <div className="text-center">
            {/* Main Logo */}
            <div className="mb-6 relative inline-block">
              <div className="absolute inset-0 bg-yellow-400/20 blur-3xl" />
              <img 
                src="/images/the-finals-logo.webp" 
                alt="The Finals" 
                className="relative h-24 sm:h-32 md:h-40 w-auto mx-auto drop-shadow-2xl"
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                LOADOUT GENERATOR
              </span>
            </h1>

            {/* Season Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-yellow-600/20 
                          border border-yellow-400/50 rounded-full mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              <span className="text-lg font-bold text-yellow-400">SEASON 7 READY!</span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto mb-8 px-4">
              Generate random loadouts for The Finals. Perfect for challenges, 
              content creation, or just mixing up your playstyle!
            </p>

            {/* Scroll Indicator with Touch Hint */}
            <TouchWrapper 
              onTap={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              onSwipeUp={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="inline-block mt-8"
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

      {/* Main Content - Animations */}
      <section id="generator" className="relative py-8 sm:py-12">
        {/* Section Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
        
        <div className="relative container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              Generate Your Loadout
            </h2>
            <p className="text-gray-400">Follow the steps to create your random loadout</p>
          </div>

          {/* Game Flow Container with Mobile Optimizations */}
          <div className={`max-w-4xl mx-auto ${isMobile ? 'px-2 pb-20' : ''}`}>
            <LoadoutHistoryProvider>
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
            </LoadoutHistoryProvider>
          </div>
        </div>
      </section>

      {/* Loadout History Section */}
      <section id="history" className="py-8 sm:py-12 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              Recent Loadouts
            </h2>
            <p className="text-gray-400">Your generated loadout history</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <LoadoutHistory />
          </div>
        </div>
      </section>

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

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav activeSection={activeSection} />}
      
      {/* Performance Monitor for Development */}
      {isMobile && <MobilePerformanceMonitor />}
      
      {/* Footer with padding for mobile nav */}
      <footer className={`border-t border-gray-800 bg-gray-900/50 ${isMobile ? 'pb-20' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              © 2025 The Finals Loadout Generator. Not affiliated with Embark Studios.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-10px) translateX(5px); }
          66% { transform: translateY(5px) translateX(-5px); }
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </>
  );
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
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
import React, { useState, useRef, useEffect } from 'react';
import type { ClassType } from '../../types';
import './RouletteWheel.css';

interface RouletteWheelProps {
  onClassSelected: (result: ClassType) => void;
}

interface Segment {
  text: ClassType;
  color: string;
}

// Segment data - updated with consistent color scheme
const segments: Segment[] = [
  { text: 'Light', color: '#4FC3F7' },  // Light blue
  { text: 'Heavy', color: '#FF1744' },  // Red
  { text: 'Light', color: '#4FC3F7' },
  { text: 'Medium', color: '#AB47BC' }, // Purple
  { text: 'Heavy', color: '#FF1744' },
  { text: 'Light', color: '#4FC3F7' },
  { text: 'Heavy', color: '#FF1744' },
  { text: 'Light', color: '#4FC3F7' },
  { text: 'Medium', color: '#AB47BC' },
  { text: 'Heavy', color: '#FF1744' },
  { text: 'Light', color: '#4FC3F7' },
  { text: 'Heavy', color: '#FF1744' }
];

/**
 * RouletteWheel component - converted from fixed_roulette.html
 * Maintains 100% identical animation behavior
 */
const RouletteWheel: React.FC<RouletteWheelProps> = ({ onClassSelected }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<ClassType | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  // Generate wheel with conic gradient and labels - exact copy from HTML
  const generateWheel = () => {
    if (!wheelRef.current) return;
    
    const wheel = wheelRef.current;
    const slice = 360 / segments.length;
    
    // Build conic-gradient string - start from top (0deg)
    let stops = '';
    segments.forEach((s, i) => {
      const start = i * slice;
      const end = start + slice;
      stops += `${s.color} ${start}deg ${end}deg,`;
    });
    wheel.style.background = `conic-gradient(from 0deg, ${stops.slice(0, -1)})`;
    
    // Clear old labels if we re-spin
    wheel.innerHTML = '';
    
    // ----- LABELS -----
    segments.forEach((s, i) => {
      const slice = 360 / segments.length;
      const mid = i * slice + slice / 2; // centre angle of this wedge
      const flip = (mid > 90 && mid < 270) ? 180 : 0; // flip lower-half text

      /* wrapper: rotates to the slice direction */
      const wrap = document.createElement('div');
      wrap.className = 'wedge-wrap';
      wrap.style.transform = `rotate(${mid - 90}deg)`; // -90 so 0° points right

      /* label: shove it out the radius, then rotate baseline */
      const lbl = document.createElement('span');
      lbl.className = 'seg-label';
      lbl.textContent = s.text.toUpperCase();
      lbl.style.transform = `translateX(110px) rotate(${flip}deg)`; // moved much closer to center to avoid rim clipping

      wrap.appendChild(lbl);
      wheel.appendChild(wrap);
    });
  };

  // Spin function - enhanced with announcement pause
  const spin = () => {
    if (isSpinning || isProcessing) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setShowAnnouncement(false);
    setResult(null);
    
    if (!wheelRef.current || !ballRef.current) return;
    
    const wheel = wheelRef.current;
    const ball = ballRef.current;
    
    // Reset positions
    wheel.style.transform = 'rotate(0deg)';
    ball.style.transform = 'translateY(-190px)';
    ball.classList.remove('spinning', 'spiraling');
    
    // Start ball spinning fast
    setTimeout(() => {
      ball.classList.add('spinning');
    }, 50);
    
    // Random spin amount (3-5 full rotations plus random angle)
    const spins = 3 + Math.random() * 2;
    const randomAngle = Math.random() * 360;
    const totalRotation = spins * 360 + randomAngle;
    
    // Start wheel spinning in opposite direction
    setTimeout(() => {
      wheel.style.transform = `rotate(-${totalRotation}deg)`;
    }, 500);
    
    // Start ball spiraling inward
    setTimeout(() => {
      ball.classList.remove('spinning');
      ball.classList.add('spiraling');
    }, 1500);
    
    // Calculate result after animation completes
    setTimeout(() => {
      // Calculate which segment the ball landed on
      // Account for opposite rotation
      const normalizedAngle = (totalRotation % 360) % 360;
      const segmentAngle = 360 / segments.length;
      const segmentIndex = Math.floor(normalizedAngle / segmentAngle);
      const landedSegment = segments[segmentIndex];
      
      // Show result immediately
      setResult(landedSegment.text);
      setShowResult(true);
      setIsSpinning(false);
      setIsProcessing(true);
      
      // Show announcement after brief pause
      setTimeout(() => {
        setShowAnnouncement(true);
      }, 500);
      
      // Give user time to digest (3 seconds), then proceed
      setTimeout(() => {
        setIsProcessing(false);
        onClassSelected(landedSegment.text);
      }, 3500);
    }, 4500);
  };

  // Auto-start spinning when component mounts
  useEffect(() => {
    generateWheel();
    const timer = setTimeout(() => {
      spin();
    }, 1000); // Auto-start after 1 second

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      <div className="roulette-container">
        <div className="arrow"></div>
        <div className="wheel-base">
          <div className="wheel" ref={wheelRef}>
            {/* Segments will be generated by generateWheel() */}
          </div>
          <div className="outer-ring"></div>
          <div className="center-hub">
            <img 
              src="/images/the-finals.webp" 
              alt="The Finals" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="ball-track">
          <div className="ball" ref={ballRef}></div>
        </div>
      </div>

      {result && (
        <div 
          className={`roulette-result ${showResult ? 'show' : ''}`}
          style={{ backgroundColor: segments.find(s => s.text === result)?.color }}
        >
          {result.toUpperCase()}
        </div>
      )}

      <button 
        className={`
          px-16 py-4 rounded-full text-xl font-bold uppercase transition-all duration-300
          border-2 text-white font-family-impact
          ${isSpinning || isProcessing
            ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-70' 
            : 'bg-gradient-to-r from-purple-600 to-purple-700 border-yellow-400 hover:from-purple-500 hover:to-purple-600 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-purple-500/25'
          }
        `}
        style={{
          boxShadow: isSpinning || isProcessing 
            ? 'none' 
            : '0 8px 24px rgba(171, 71, 188, 0.5), 0 0 40px rgba(171, 71, 188, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)'
        }}
        onClick={spin}
        disabled={isSpinning || isProcessing}
      >
        {isSpinning ? 'SPINNING...' : isProcessing ? 'PROCESSING...' : 'SPIN'}
      </button>

      {/* Class Announcement Overlay */}
      {result && showAnnouncement && (
        <div className={`class-announcement ${showAnnouncement ? 'show' : ''}`}>
          <h2>You Rolled</h2>
          <div className={`class-name ${result.toLowerCase()}`}>
            {result.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouletteWheel;
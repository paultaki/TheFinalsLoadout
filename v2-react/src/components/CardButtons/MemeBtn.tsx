import React from 'react';
import html2canvas from 'html2canvas';

interface MemeBtnProps {
  targetId: string;
}

const MemeBtn: React.FC<MemeBtnProps> = ({ targetId }) => {
  const handleDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: window.devicePixelRatio || 1,
        backgroundColor: '#0a0a0f',
        logging: false
      });

      const link = document.createElement('a');
      link.download = `loadout-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to generate meme card:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 rounded bg-slate-800/70 px-4 py-1 text-xs 
                 uppercase tracking-wide hover:bg-slate-700 transition-colors min-w-[80px] justify-center"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>Meme</span>
    </button>
  );
};

export default MemeBtn;
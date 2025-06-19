import React, { useState } from 'react';

interface CopyBtnProps {
  onClick: () => Promise<boolean>;
}

const CopyBtn: React.FC<CopyBtnProps> = ({ onClick }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const success = await onClick();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded bg-slate-800/70 px-4 py-1 text-xs 
                 uppercase tracking-wide hover:bg-slate-700 transition-colors min-w-[80px] justify-center"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill={copied ? "currentColor" : "none"} stroke={copied ? "none" : "currentColor"} viewBox="0 0 24 24">
        {copied ? (
          <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        )}
      </svg>
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

export default CopyBtn;
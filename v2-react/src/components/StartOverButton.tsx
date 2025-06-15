import React from 'react';

const StartOverButton: React.FC = () => {
  const handleStartOver = () => {
    window.location.reload();
  };

  return (
    <div className="flex justify-center pb-8">
      <button
        onClick={handleStartOver}
        className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl rounded-xl transform hover:scale-105 transition-all"
      >
        Start Over
      </button>
    </div>
  );
};

export default StartOverButton;
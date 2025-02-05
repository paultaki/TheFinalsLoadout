import React from 'react';

const SpinSelector = ({ selectedSpins, setSelectedSpins, disabled }) => {
  return (
    <div className="spin-selector">
      <div className="step-indicator active">
        Step 1️⃣: Choose number of spins
      </div>
      
      <div className="spin-buttons">
        {[1, 2, 3, 4, 5].map((count) => (
          <button
            key={count}
            onClick={() => setSelectedSpins(count)}
            disabled={disabled}
            className={`
              spin-count-btn
              ${selectedSpins === count ? 'active' : ''}
              ${disabled ? 'disabled' : ''}
            `}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpinSelector;
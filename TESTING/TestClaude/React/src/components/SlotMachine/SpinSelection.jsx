import React from 'react';
import { motion } from 'framer-motion';
import { useLoadoutStore } from '../../store/loadoutStore';

export const SpinSelection = () => {
  const { startSpin, isSpinning, currentSpin } = useLoadoutStore();
  const spinCounts = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {spinCounts.map((count, index) => (
        <motion.button
          key={count}
          onClick={() => startSpin(count)}
          disabled={isSpinning}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-16 h-16 rounded-full font-bold shadow-lg
                     transition-all duration-300 ${
            currentSpin === count
              ? 'bg-blue-500 text-white'
              : 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/40'
          }`}
        >
          {count}
        </motion.button>
      ))}
    </div>
  );
};
import React from 'react';
import { motion } from 'framer-motion';
import { useLoadoutStore } from '../../store/loadoutStore';

export const ClassSelection = () => {
  const { selectedClass, selectClass, isSpinning } = useLoadoutStore();
  const classes = ['Light', 'Medium', 'Heavy', 'Random'];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {classes.map((classType, index) => (
        <motion.button
          key={classType}
          onClick={() => selectClass(classType)}
          disabled={isSpinning}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-sm font-bold
                     transition-all duration-300 shadow-lg ${
            selectedClass === classType
              ? 'bg-yellow-500 text-black'
              : 'border-2 border-yellow-500 text-white hover:bg-yellow-500/20'
          }`}
        >
          {classType}
        </motion.button>
      ))}
    </div>
  );
};
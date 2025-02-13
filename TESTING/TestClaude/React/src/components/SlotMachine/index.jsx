import React from 'react';
import { ClassSelection } from './ClassSelection';
import { SpinSelection } from './SpinSelection';
import { SlotDisplay } from './SlotDisplay';
import { LoadoutCopy } from './LoadoutCopy';
import { useLoadoutStore } from '../../store/loadoutStore';
import { motion, AnimatePresence } from 'framer-motion';

export const SlotMachine = () => {
  const { selectedClass, isSpinning } = useLoadoutStore();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-8 py-8"
    >
      <ClassSelection />
      
      <AnimatePresence mode="wait">
        {selectedClass && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SpinSelection />
          </motion.div>
        )}
      </AnimatePresence>

      <SlotDisplay />
      <LoadoutCopy />
    </motion.div>
  );
};
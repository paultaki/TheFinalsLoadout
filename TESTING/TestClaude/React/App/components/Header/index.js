import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useLoadoutStore } from '../store/loadoutStore';

export const Header = () => {
  const { theme, setTheme } = useLoadoutStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="relative py-8 overflow-hidden">
      {/* Animated background grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url("/images/grid.png")',
          backgroundSize: '50px 50px',
          animation: 'slowMove 20s linear infinite'
        }}
      />

      <div className="container mx-auto px-4">
        <div className="relative flex flex-col items-center">
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-4 top-4 p-2 rounded-full bg-gray-800/50 text-yellow-500
                     hover:bg-gray-700/50 transition-colors"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          {/* Logo */}
          <motion.img
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            src="/images/the-finals.webp"
            alt="The Finals Logo"
            className="w-48 h-auto mb-6"
          />

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-300">
              The Finals Loadout Generator
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-300 text-center max-w-2xl"
          >
            Spin for random builds and discover new ways to play!
          </motion.p>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
    </header>
  );
};
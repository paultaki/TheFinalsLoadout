import React from 'react';
import { motion } from 'framer-motion';

export const RecentBuffs = () => {
  return (
    <section className="bg-gray-900/50 p-8 rounded-lg my-16">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-8 text-yellow-500"
      >
        Recent Buffs, Nerfs and Fixes
      </motion.h2>

      <div className="space-y-8">
        <div className="bg-gray-800/50 p-6 rounded-lg">
          <p className="text-gray-400 mb-4">Patch Date: February 5, 2025</p>
          
          {/* Weapons Section */}
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl font-bold mb-6 text-center py-3 bg-gradient-to-r from-[#D61C7C] to-[#3A5ACF] rounded-lg"
          >
            Weapons
          </motion.h3>

          <div className="space-y-6">
            {/* Buffs */}
            <div>
              <h4 className="text-xl font-bold mb-4">Buffs</h4>
              
              <div className="space-y-4">
                <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-400">Cerberus (Buff)</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Increased damage (9 → 10 per pellet)</li>
                    <li>Tighter pellet spread for better accuracy</li>
                    <li>Reduced reload times</li>
                  </ul>
                </div>

                <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-400">Pike-556 (Buff)</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Increased damage (47 → 50)</li>
                  </ul>
                </div>

                <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-bold text-blue-400">SR-84 (Buff)</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Faster bolt action animation (1.25s → 1.05s), increasing fire rate</li>
                    <li>Increased damage (115 → 118)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Nerfs */}
            <div>
              <h4 className="text-xl font-bold mb-4">Nerfs</h4>
              
              <div className="space-y-4">
                <div className="bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-bold text-red-400">FAMAS (Nerf)</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Reduced fire rate (230 → 220 RPM)</li>
                    <li>Reduced damage per bullet (24 → 23)</li>
                  </ul>
                </div>

                <div className="bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-bold text-red-400">LH1 (Nerf)</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Reduced damage (48 → 46)</li>
                    <li>Reduced fire rate (280 → 270 RPM)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Gadgets Section */}
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl font-bold my-6 text-center py-3 bg-gradient-to-r from-[#D61C7C] to-[#3A5ACF] rounded-lg"
          >
            Gadgets
          </motion.h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold mb-4">Buffs</h4>
              <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="font-bold text-blue-400">Breach Charge (Buff)</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Reduced throw delay (0.9s → 0.6s)</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-4">Nerfs</h4>
              <div className="bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                <p className="font-bold text-red-400">Winch Claw (Nerf)</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Reduced range (12m → 10m)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="https://www.reachthefinals.com/patchnotes/580" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 
                       transition-colors duration-300 font-bold"
            >
              Read Full Patch Notes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
import React from 'react';
import { Header } from './Header';
import { SlotMachine } from './SlotMachine';
import { RecentBuffs } from './RecentBuffs';
import { FAQ } from './FAQ';
import { useLoadoutStore } from '../store/loadoutStore';

export default function App() {
  const { theme } = useLoadoutStore();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-[#1B1B3A] to-[#2E004D]' : 'bg-gradient-to-b from-gray-100 to-gray-300'}`}>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <SlotMachine />
          <RecentBuffs />
          <FAQ />
        </main>

        <footer className="mt-auto py-6 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <p>© 2025 TheFinalsLoadout.com | <a href="/legal" className="text-yellow-500 hover:text-yellow-400">Legal Disclaimer</a></p>
              <div className="flex items-center gap-4">
                <span>1-800-FAT-MOMS Production</span>
                <a 
                  href="https://www.buymeacoffee.com/dismiss3d"
                  className="inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    src="/images/bmc-button.png" 
                    alt="Support Me" 
                    className="h-8"
                  />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
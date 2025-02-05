import React, { useState, useEffect, useRef } from 'react';
import { loadouts } from './data/loadouts';
import { SpinSelector } from './components/SpinSelector';
import { ClassSelector } from './components/ClassSelector';

const SPINNING_DURATION = 2700; // 2.7s matching CSS animation
const COLUMN_DELAY = 300; // 0.3s delay between columns

const SlotMachine = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedSpins, setSelectedSpins] = useState(1);
    const [currentSpin, setCurrentSpin] = useState(1);
    const [selectedClass, setSelectedClass] = useState(null);
    const [currentLoadout, setCurrentLoadout] = useState(null);
    const reelsRef = useRef([]);

    const generateReelItems = (type, items) => {
        // Generate enough items to fill the reel
        let reelItems = [];
        while (reelItems.length < 20) {
            reelItems = [...reelItems, ...items];
        }
        return reelItems.slice(0, 20);
    };

    const getRandomItem = (array) => {
        return array[Math.floor(Math.random() * array.length)];
    };

    const handleSpin = async () => {
        if (isSpinning || !selectedClass) return;
        setIsSpinning(true);

        // Determine class and loadout
        const spinClass = selectedClass === 'Random' 
            ? getRandomItem(['Light', 'Medium', 'Heavy'])
            : selectedClass;
        
        const loadout = loadouts[spinClass];
        
        // Generate new loadout
        const newLoadout = {
            class: spinClass,
            weapon: getRandomItem(loadout.weapons),
            specialization: getRandomItem(loadout.specializations),
            gadgets: [
                getRandomItem(loadout.gadgets),
                getRandomItem(loadout.gadgets),
                getRandomItem(loadout.gadgets)
            ]
        };

        // Start spinning animation for each reel with delays
        reelsRef.current.forEach((reel, index) => {
            const delay = index * COLUMN_DELAY;
            setTimeout(() => {
                reel.style.transform = 'translateY(calc(-100% + var(--item-height) * 3))';
            }, delay);
        });

        // Wait for all animations to complete
        await new Promise(resolve => setTimeout(resolve, SPINNING_DURATION + (COLUMN_DELAY * 5)));

        setCurrentLoadout(newLoadout);

        if (currentSpin < selectedSpins) {
            setCurrentSpin(prev => prev + 1);
        } else {
            setCurrentSpin(1);
            setIsSpinning(false);
        }
    };

    return (
        <div className="slot-machine-container">
            <SpinSelector 
                selectedSpins={selectedSpins}
                setSelectedSpins={setSelectedSpins}
                disabled={isSpinning}
            />
            
            <ClassSelector 
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                disabled={isSpinning}
            />

            <div className="window-border">
                <div className="window">
                    {/* Class Reel */}
                    <div className="reel">
                        <div className="reel-items" ref={el => reelsRef.current[0] = el}>
                            {generateReelItems('class', ['Light', 'Medium', 'Heavy']).map((item, i) => (
                                <div key={`class-${i}`} className="slot-item">{item}</div>
                            ))}
                        </div>
                    </div>

                    {/* Weapon Reel */}
                    <div className="reel">
                        <div className="reel-items" ref={el => reelsRef.current[1] = el}>
                            {currentLoadout && generateReelItems('weapon', loadouts[currentLoadout.class].weapons).map((item, i) => (
                                <div key={`weapon-${i}`} className="slot-item">{item}</div>
                            ))}
                        </div>
                    </div>

                    {/* Specialization Reel */}
                    <div className="reel">
                        <div className="reel-items" ref={el => reelsRef.current[2] = el}>
                            {currentLoadout && generateReelItems('spec', loadouts[currentLoadout.class].specializations).map((item, i) => (
                                <div key={`spec-${i}`} className="slot-item">{item}</div>
                            ))}
                        </div>
                    </div>

                    {/* Gadget Reels */}
                    {[0, 1, 2].map(gadgetIndex => (
                        <div key={`gadget-reel-${gadgetIndex}`} className="reel">
                            <div className="reel-items" ref={el => reelsRef.current[3 + gadgetIndex] = el}>
                                {currentLoadout && generateReelItems('gadget', loadouts[currentLoadout.class].gadgets).map((item, i) => (
                                    <div key={`gadget-${gadgetIndex}-${i}`} className="slot-item">{item}</div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="controls">
                <button 
                    className="spin-button"
                    onClick={handleSpin}
                    disabled={isSpinning || !selectedClass}
                >
                    {isSpinning 
                        ? `Spinning... (${currentSpin}/${selectedSpins})` 
                        : 'SPIN'}
                </button>

                {currentLoadout && (
                    <button 
                        className="copy-button"
                        onClick={() => {
                            const copyText = `Class: ${currentLoadout.class}\n` +
                                `Weapon: ${currentLoadout.weapon}\n` +
                                `Specialization: ${currentLoadout.specialization}\n` +
                                `Gadget 1: ${currentLoadout.gadgets[0]}\n` +
                                `Gadget 2: ${currentLoadout.gadgets[1]}\n` +
                                `Gadget 3: ${currentLoadout.gadgets[2]}`;
                            navigator.clipboard.writeText(copyText);
                            alert('Loadout copied to clipboard!');
                        }}
                    >
                        Copy Loadout
                    </button>
                )}
            </div>
        </div>
    );
};

export default SlotMachine;
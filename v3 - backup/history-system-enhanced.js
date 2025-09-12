/**
 * History System Enhancement
 * Adds icon support and refined card structure
 * This file extends the existing history-system.js
 */

// ========================================
// Icon Mapping for Equipment
// ========================================
const EQUIPMENT_ICONS = {
  // Light Weapons
  "93R": "93R.webp",
  "Dagger": "Dagger.webp",
  "SR-84": "SR-84.webp",
  "SH1900": "SH1900.webp",
  "LH1": "LH1.webp",
  "M26 Matter": "M26_Matter.webp",
  "Recurve Bow": "Recurve_Bow.webp",
  "Sword": "Sword.webp",
  "M11": "M11.webp",
  "ARN-220": "ARN-220.webp",
  "V9S": "V9S.webp",
  "XP-54": "XP-54.webp",
  "Throwing Knives": "Throwing_Knives.webp",
  
  // Medium Weapons
  "AKM": "AKM.webp",
  "Cerberus 12GA": "Cerberus_12GA.webp",
  "Dual Blades": "Dual_Blades.webp",
  "FAMAS": "FAMAS.webp",
  "CL-40": "CL-40.webp",
  "CB-01 Repeater": "CB-01_Repeater.webp",
  "FCAR": "FCAR.webp",
  "Model 1887": "Model_1887.webp",
  "Pike-556": "Pike-556.webp",
  "R.357": "R.357.webp",
  "Riot Shield": "Riot_Shield.webp",
  
  // Heavy Weapons
  ".50 Akimbo": "50_Akimbo.webp",
  "Flamethrower": "Flamethrower.webp",
  "KS-23": "KS-23.webp",
  "Lewis Gun": "Lewis_Gun.webp",
  "M60": "M60.webp",
  "M134 Minigun": "M134_Minigun.webp",
  "MGL32": "MGL32.webp",
  "SA1216": "SA1216.webp",
  "Sledgehammer": "Sledgehammer.webp",
  "ShAK-50": "SHAK-50.webp",
  "Spear": "Spear.webp",
  
  // Specializations
  "Cloaking Device": "Cloaking_Device.webp",
  "Evasive Dash": "Evasive_Dash.webp",
  "Grappling Hook": "Grappling_Hook.webp",
  "Dematerializer": "Dematerializer.webp",
  "Guardian Turret": "Guardian_Turret.webp",
  "Healing Beam": "Healing_Beam.webp",
  "Charge N Slam": "Charge_N_Slam.webp",
  "Goo Gun": "Goo_Gun.webp",
  "Mesh Shield": "Mesh_Shield.webp",
  "Winch Claw": "Winch_Claw.webp",
  
  // Gadgets
  "Breach Charge": "Breach_Charge.webp",
  "Gateway": "Gateway.webp",
  "Glitch Grenade": "Glitch_Grenade.webp",
  "Gravity Vortex": "Gravity_Vortex.webp",
  "Nullifier": "Nullifier.webp",
  "Sonar Grenade": "Sonar_Grenade.webp",
  "H+ Infuser": "H+_Infuser.webp",
  "Thermal Bore": "Thermal_Bore.webp",
  "Gas Grenade": "Gas_Grenade.webp",
  "Thermal Vision": "Thermal_Vision.webp",
  "Tracking Dart": "Tracking_Dart.webp",
  "Vanishing Bomb": "Vanishing_Bomb.webp",
  "Goo Grenade": "Goo_Grenade.webp",
  "Pyro Grenade": "Pyro_Grenade.webp",
  "Smoke Grenade": "Smoke_Grenade.webp",
  "Frag Grenade": "Frag_Grenade.webp",
  "Flashbang": "Flashbang.webp",
  "APS Turret": "APS_Turret.webp",
  "Data Reshaper": "Data_Reshaper.webp",
  "Defibrillator": "Defibrillator.webp",
  "Explosive Mine": "Explosive_Mine.webp",
  "Gas Mine": "Gas_Mine.webp",
  "Glitch Trap": "Glitch_Trap.webp",
  "Jump Pad": "Jump_Pad.webp",
  "Zipline": "Zipline.webp",
  "Breach Drill": "Breach_Drill.webp",
  "Proximity Sensor": "Proximity_Sensor.webp",
  "Health Canister": "Health_Canister.webp",
  "Anti-Gravity Cube": "Anti-Gravity_Cube.webp",
  "Barricade": "Barricade.webp",
  "C4": "C4.webp",
  "Dome Shield": "Dome_Shield.webp",
  "Lockbolt Launcher": "Lockbolt_Launcher.webp",
  "Pyro Mine": "Pyro_Mine.webp",
  "RPG-7": "RPG-7.webp"
};

// ========================================
// Enhanced History Card Creator
// ========================================
class EnhancedHistoryManager {
  /**
   * Override the createHistoryCard method with enhanced version
   */
  static enhanceHistoryManager() {
    if (!window.historyManager) {
      console.warn('⚠️ History Manager not initialized yet');
      return;
    }
    
    // Store original method
    const originalCreateCard = window.historyManager.createHistoryCard;
    
    // Override with enhanced version
    window.historyManager.createHistoryCard = function(entry) {
      return EnhancedHistoryManager.createEnhancedCard.call(this, entry);
    };
    
    console.log('✅ History Manager enhanced with icon support');
  }
  
  /**
   * Create enhanced history card with icons
   */
  static createEnhancedCard(entry) {
    const card = document.createElement("div");
    card.className = "history-card enhanced-card";
    card.dataset.id = entry.id;

    // Determine card theme based on analysis
    const score = entry.analysis?.score || 5;
    if (score >= 8) card.classList.add("high-tier");
    else if (score >= 5) card.classList.add("mid-tier");
    else card.classList.add("low-tier");

    // Format timestamp
    const date = new Date(entry.timestamp);
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Get equipment icons
    const weaponIcon = EnhancedHistoryManager.getIconPath(entry.loadout.weapon);
    const specIcon = EnhancedHistoryManager.getIconPath(entry.loadout.specialization);
    const gadgetIcons = entry.loadout.gadgets.map(g => ({
      name: g,
      icon: EnhancedHistoryManager.getIconPath(g)
    }));

    card.innerHTML = `
      <div class="history-card-header">
        <div class="card-title">
          <span class="card-class ${entry.loadout.class.toLowerCase()}">${entry.loadout.class}</span>
          <span class="card-timestamp">${timeString}</span>
        </div>
        <div class="card-actions">
          <button class="card-action favorite-btn ${entry.favorite ? "active" : ""}" 
                  data-action="favorite" title="Favorite">
            ${entry.favorite ? "⭐" : "☆"}
          </button>
          <button class="card-action copy-btn" data-action="copy" title="Copy to clipboard">
            📋
          </button>
          <button class="card-action delete-btn" data-action="delete" title="Delete">
            🗑️
          </button>
        </div>
      </div>
      
      <div class="history-card-body">
        <div class="loadout-items">
          <div class="loadout-item weapon" title="${entry.loadout.weapon}">
            ${weaponIcon ? `<img src="${weaponIcon}" alt="${entry.loadout.weapon}" class="item-icon" loading="lazy">` : ''}
            <span class="item-value">${entry.loadout.weapon}</span>
          </div>
          
          <div class="loadout-item specialization" title="${entry.loadout.specialization}">
            ${specIcon ? `<img src="${specIcon}" alt="${entry.loadout.specialization}" class="item-icon" loading="lazy">` : ''}
            <span class="item-value">${entry.loadout.specialization}</span>
          </div>
          
          <div class="loadout-item gadgets">
            <div class="gadgets-grid">
              ${gadgetIcons.map(g => `
                <div class="gadget-card" title="${g.name}">
                  ${g.icon ? `<img src="${g.icon}" alt="${g.name}" class="gadget-icon" loading="lazy">` : ''}
                  <span class="gadget-name">${g.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        ${entry.analysis ? `
          <div class="analysis-section">
            <div class="analysis-header">
              <span class="analysis-score">${entry.analysis.score}/10</span>
              ${entry.analysis.metaRating ? 
                `<span class="meta-badge tier-${entry.analysis.metaRating}">${entry.analysis.metaRating}</span>` : ''}
              ${entry.analysis.archetype ? 
                `<span class="archetype-badge">${entry.analysis.archetype}</span>` : ''}
            </div>
            <div class="analysis-text">${entry.analysis.text}</div>
            ${entry.analysis.saltIndex ? `
              <div class="salt-meter">
                <span class="salt-label">Salt Level:</span>
                <div class="salt-bar">
                  <div class="salt-fill" style="width: ${entry.analysis.saltIndex * 10}%"></div>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;

    return card;
  }
  
  /**
   * Get icon path for an equipment item
   */
  static getIconPath(itemName) {
    const iconFile = EQUIPMENT_ICONS[itemName];
    if (!iconFile) {
      console.warn(`⚠️ No icon mapping for: ${itemName}`);
      return null;
    }
    return `/images/${iconFile}`;
  }
  
  /**
   * Re-render all existing cards with enhanced version
   */
  static reRenderAllCards() {
    if (!window.historyManager) return;
    
    const container = document.querySelector('#history-list');
    if (!container || window.historyManager.entries.length === 0) return;
    
    // Clear and re-render with enhanced cards
    container.innerHTML = '';
    window.historyManager.entries.forEach(entry => {
      const card = window.historyManager.createHistoryCard(entry);
      container.appendChild(card);
    });
    
    console.log(`✅ Re-rendered ${window.historyManager.entries.length} cards with enhancements`);
  }
}

// ========================================
// Additional CSS for Enhanced Cards
// ========================================
const enhancedStyles = `
  /* Icon styling for equipment cards */
  .loadout-item .item-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    margin-bottom: 0.5rem;
  }
  
  .loadout-item.weapon,
  .loadout-item.specialization {
    flex-direction: column;
    padding: 1rem 0.75rem;
  }
  
  /* Remove placeholder circles when icons are present */
  .loadout-item:has(.item-icon)::before {
    display: none;
  }
  
  /* Gadgets grid layout */
  .gadgets-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    width: 100%;
  }
  
  .gadget-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 0.5rem;
    background: rgba(20, 20, 30, 0.4);
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .gadget-card:hover {
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
  }
  
  .gadget-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    margin-bottom: 0.25rem;
  }
  
  .gadget-name {
    font-size: 0.65rem;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.2;
    word-break: break-word;
  }
  
  /* Mobile adjustments for icons */
  @media (max-width: 768px) {
    .loadout-item .item-icon {
      width: 32px;
      height: 32px;
      margin-bottom: 0;
      margin-right: 0.75rem;
    }
    
    .loadout-item.weapon,
    .loadout-item.specialization {
      flex-direction: row;
      padding: 0.75rem;
    }
    
    .gadgets-grid {
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    }
    
    .gadget-card {
      padding: 0.5rem;
    }
    
    .gadget-icon {
      width: 24px;
      height: 24px;
    }
  }
  
  @media (max-width: 480px) {
    .gadgets-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .gadget-card {
      flex-direction: row;
      justify-content: flex-start;
      gap: 0.5rem;
      padding: 0.5rem;
    }
    
    .gadget-icon {
      margin-bottom: 0;
    }
  }
`;

// ========================================
// Initialize Enhancements
// ========================================
function initializeEnhancements() {
  // Add enhanced styles
  const styleElement = document.createElement('style');
  styleElement.textContent = enhancedStyles;
  document.head.appendChild(styleElement);
  
  // Enhance the history manager
  EnhancedHistoryManager.enhanceHistoryManager();
  
  // Re-render existing cards if any
  EnhancedHistoryManager.reRenderAllCards();
  
  console.log('🎨 History system enhancements initialized');
}

// Wait for history manager to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Give the original history manager time to initialize
    setTimeout(initializeEnhancements, 100);
  });
} else {
  // If DOM is already loaded, wait a bit for history manager
  setTimeout(initializeEnhancements, 100);
}

// Export for debugging
window.EnhancedHistoryManager = EnhancedHistoryManager;
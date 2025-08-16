/**
 * Image Preloader for Slot Machine
 * Ensures all images are loaded before spinning
 */

const ImagePreloader = {
  imageCache: new Map(),
  
  /**
   * Preload all weapon/gadget images
   */
  async preloadAllImages() {
    console.log("🖼️ Starting image preload...");
    
    // List of all possible items that might appear
    const allItems = [
      // Light Weapons
      "93R", "Dagger", "SR-84", "SH1900", "LH1", "M26 Matter", 
      "Recurve Bow", "Sword", "M11", "ARN-220", "V9S", "XP-54", 
      "Throwing Knives",
      
      // Medium Weapons
      "AKM", "Cerberus 12GA", "Dual Blades", "FAMAS", "CL-40", 
      "CB-01 Repeater", "FCAR", "Model 1887", "Pike-556", "R.357", 
      "Riot Shield",
      
      // Heavy Weapons
      "M134 Minigun", "M60", "Sledgehammer", "Lewis Gun", "MGL32", 
      "RPG-7", "Lockbolt Launcher", "Spear", "KS-23", "ShAK-50", 
      "Flamethrower", "Charge N' Slam", "SA1216", ".50 Akimbo",
      
      // Specializations
      "Cloaking Device", "Evasive Dash", "Grappling Hook",
      "Dematerializer", "Guardian Turret", "Healing Beam", 
      "Mesh Shield", "Winch Claw", "Goo Gun",
      "Charge N Slam",
      
      // Gadgets
      "Breach Charge", "Gateway", "Glitch Grenade", "Gravity Vortex",
      "Nullifier", "Sonar Grenade", "H+ Infuser", "Thermal Bore",
      "Gas Grenade", "Thermal Vision", "Tracking Dart", "Vanishing Bomb",
      "Goo Grenade", "Pyro Grenade", "Smoke Grenade", "Frag Grenade",
      "Flashbang", "APS Turret", "Data Reshaper", "Defibrillator",
      "Explosive Mine", "Gas Mine", "Glitch Trap", "Jump Pad",
      "Zipline", "Proximity Sensor", "Anti-Gravity Cube",
      "Barricade", "C4", "Dome Shield", "Pyro Mine", "RPG-7",
      "Healing Emitter", "Health Canister", "Breach Drill"
    ];
    
    let loadedCount = 0;
    let failedCount = 0;
    
    for (const item of allItems) {
      const imagePath = this.getImagePath(item);
      
      try {
        await this.preloadImage(imagePath, item);
        loadedCount++;
      } catch (error) {
        console.warn(`⚠️ Failed to preload: ${item} (${imagePath})`);
        failedCount++;
        // Store placeholder for failed images
        this.imageCache.set(item, 'placeholder');
      }
    }
    
    console.log(`✅ Preloaded ${loadedCount} images, ${failedCount} failed`);
    return { loaded: loadedCount, failed: failedCount };
  },
  
  /**
   * Preload a single image
   */
  preloadImage(src, itemName) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(itemName, src);
        resolve(src);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load ${src}`));
      };
      img.src = src;
    });
  },
  
  /**
   * Get image path for an item
   */
  getImagePath(itemName, category = '') {
    // Use centralized resolver if available
    if (window.NameToAsset && window.NameToAsset.resolveItemImage) {
      return window.NameToAsset.resolveItemImage(itemName, category);
    }
    
    // Fallback for compatibility
    const basePath = '/images';
    const fileName = itemName.replace(/\s+/g, "_").replace(/'/g, "");
    return `${basePath}/${fileName}.webp`;
  },
  
  /**
   * Get cached image path or fallback
   */
  getCachedImagePath(itemName) {
    if (this.imageCache.has(itemName)) {
      const cached = this.imageCache.get(itemName);
      const basePath = '/images';
      return cached === 'placeholder' ? `${basePath}/placeholder.webp` : cached;
    }
    return this.getImagePath(itemName);
  },
  
  /**
   * Create image element with proper error handling
   */
  createImageElement(itemName) {
    const img = document.createElement("img");
    const imagePath = this.getCachedImagePath(itemName);
    
    img.src = imagePath;
    img.alt = itemName;
    img.loading = "eager";
    img.draggable = false;
    
    // If image fails, use text fallback
    img.onerror = function() {
      this.style.display = "none";
      // Only append text if parent exists
      if (this.parentElement) {
        const textSpan = document.createElement("span");
        textSpan.textContent = itemName;
        textSpan.style.cssText = "color: #fff; font-size: 14px; text-align: center; display: block; padding: 10px;";
        this.parentElement.appendChild(textSpan);
      }
    };
    
    return img;
  }
};

// Initialize preloader when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ImagePreloader.preloadAllImages();
  });
} else {
  ImagePreloader.preloadAllImages();
}

// Make globally available
window.ImagePreloader = ImagePreloader;
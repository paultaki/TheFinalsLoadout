/**
 * Enhanced History System
 * Sophisticated loadout history with export and analysis integration
 */

// ========================================
// History Configuration
// ========================================
const HISTORY_CONFIG = {
  maxEntries: 50,
  storageKey: "finals_loadout_history_v2",
  exportFormats: ["text", "json", "image"],
  cardAnimation: {
    slideIn: "slideInFromRight",
    duration: 300,
  },
};

// ========================================
// History Manager Class
// ========================================
class HistoryManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.entries = [];
    this.analyzer = null;
    this.initialize();
  }

  /**
   * Initialize history system
   */
  initialize() {
    this.loadFromStorage();
    this.initializeAnalyzer();
    this.setupUI();  // Setup the enhanced UI first
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Setup the enhanced UI structure
   */
  setupUI() {
    console.log('🎨 Setting up enhanced UI...');
    if (!this.container) {
      console.error('❌ No container found!');
      return;
    }
    
    console.log('📦 Container found:', this.container);
    console.log('📝 Current content:', this.container.innerHTML.substring(0, 100));
    
    this.container.innerHTML = `
      <div class="history-header">
        <div class="history-title-row">
          <h2 class="history-title">
            <span class="title-icon">📜</span>
            <span>LOADOUT HISTORY</span>
            <span class="history-count">(${this.entries.length})</span>
          </h2>
          <div class="history-actions">
            <button class="history-action-btn clear-all" title="Clear All">
              🗑️
            </button>
            <button class="history-action-btn export-all" title="Export All">
              💾
            </button>
          </div>
        </div>
      </div>
      <div class="history-list" id="history-list">
        ${this.entries.length === 0 ? '<p class="empty-history">No loadouts generated yet. Click "Generate Loadout" to start!</p>' : ''}
      </div>
    `;
    
    console.log('✅ New UI content set!');
    console.log('📝 New content:', this.container.innerHTML.substring(0, 100));
  }

  /**
   * Initialize AI analyzer
   */
  async initializeAnalyzer() {
    if (typeof LoadoutAnalyzer !== "undefined") {
      this.analyzer = new LoadoutAnalyzer();
      console.log("🤖 AI Analyzer initialized for history");
    }
  }

  /**
   * Add new entry to history
   */
  async addEntry(loadout) {
    console.log('📥 HistoryManager.addEntry called with:', loadout);
    console.log('📊 Current entries count:', this.entries.length);
    
    // Validate loadout
    if (!loadout) {
      console.error('❌ No loadout provided to addEntry');
      return;
    }
    
    // Create entry object
    const entry = {
      id: this.generateId(),
      timestamp: Date.now(),
      loadout: loadout,
      analysis: null,
      favorite: false,
    };
    
    console.log('📦 Created entry:', entry);

    // Get AI analysis
    if (this.analyzer) {
      try {
        entry.analysis = await this.analyzer.analyzeLoadout(loadout);
      } catch (error) {
        console.error("Analysis failed:", error);
        entry.analysis = FallbackAnalyzer.generateFallback(loadout);
      }
    } else {
      entry.analysis = FallbackAnalyzer.generateFallback(loadout);
    }

    // Add to beginning of array
    this.entries.unshift(entry);

    // Limit entries
    if (this.entries.length > HISTORY_CONFIG.maxEntries) {
      this.entries = this.entries.slice(0, HISTORY_CONFIG.maxEntries);
    }

    // Save and render
    this.saveToStorage();
    this.renderNewEntry(entry);

    return entry;
  }

  /**
   * Render new entry with animation
   */
  renderNewEntry(entry) {
    console.log('🎨 Rendering new entry:', entry);
    if (!this.container) {
      console.error('❌ No container for rendering');
      return;
    }
    console.log('📦 Container exists:', this.container);
    console.log('🔍 Looking for .history-list');

    const card = this.createHistoryCard(entry);
    card.style.animation = `${HISTORY_CONFIG.cardAnimation.slideIn} ${HISTORY_CONFIG.cardAnimation.duration}ms ease`;

    // Find the history list container
    const historyList = this.container.querySelector('#history-list') || this.container;
    
    // Remove empty message if exists
    const emptyMsg = historyList.querySelector(".empty-history");
    if (emptyMsg) {
      emptyMsg.remove();
    }
    
    // Insert at beginning of history list
    const firstChild = historyList.firstChild;
    if (firstChild) {
      historyList.insertBefore(card, firstChild);
    } else {
      historyList.appendChild(card);
    }
    
    // Update count
    const countEl = this.container.querySelector('.history-count');
    if (countEl) {
      countEl.textContent = `(${this.entries.length})`;
    }
    
    console.log('✅ Entry rendered to UI');
  }

  /**
   * Create history card element
   */
  createHistoryCard(entry) {
    const card = document.createElement("div");
    card.className = "history-card";
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

    card.innerHTML = `
            <div class="history-card-header">
                <div class="card-title">
                    <span class="card-class ${entry.loadout.class.toLowerCase()}">${
      entry.loadout.class
    }</span>
                    <span class="card-timestamp">${timeString}</span>
                </div>
                <div class="card-actions">
                    <button class="card-action favorite-btn ${
                      entry.favorite ? "active" : ""
                    }" 
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
                    <div class="loadout-item weapon">
                        <span class="item-label">Weapon:</span>
                        <span class="item-value">${entry.loadout.weapon}</span>
                    </div>
                    <div class="loadout-item specialization">
                        <span class="item-label">Spec:</span>
                        <span class="item-value">${
                          entry.loadout.specialization
                        }</span>
                    </div>
                    <div class="loadout-item gadgets">
                        <span class="item-label">Gadgets:</span>
                        <span class="item-value">${entry.loadout.gadgets.join(
                          ", "
                        )}</span>
                    </div>
                </div>
                
                ${
                  entry.analysis
                    ? `
                    <div class="analysis-section">
                        <div class="analysis-header">
                            <span class="analysis-score">${
                              entry.analysis.score
                            }/10</span>
                            ${
                              entry.analysis.metaRating
                                ? `<span class="meta-badge tier-${entry.analysis.metaRating}">${entry.analysis.metaRating}</span>`
                                : ""
                            }
                            ${
                              entry.analysis.archetype
                                ? `<span class="archetype-badge">${entry.analysis.archetype}</span>`
                                : ""
                            }
                        </div>
                        <div class="analysis-text">${entry.analysis.text}</div>
                        ${
                          entry.analysis.saltIndex
                            ? `
                            <div class="salt-meter">
                                <span class="salt-label">Salt Level:</span>
                                <div class="salt-bar">
                                    <div class="salt-fill" style="width: ${
                                      entry.analysis.saltIndex * 10
                                    }%"></div>
                                </div>
                            </div>
                        `
                            : ""
                        }
                    </div>
                `
                    : ""
                }
            </div>
        `;

    return card;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (!this.container) return;

    // Delegate events to container
    this.container.addEventListener("click", (e) => {
      // Handle action buttons
      const button = e.target.closest(".card-action");
      if (button) {
        const card = button.closest(".history-card");
        const entryId = card.dataset.id;
        const action = button.dataset.action;

        switch (action) {
          case "favorite":
            this.toggleFavorite(entryId);
            break;
          case "copy":
            this.copyToClipboard(entryId);
            break;
          case "export":
            this.showExportOptions(entryId);
            break;
          case "delete":
            this.deleteEntry(entryId);
            break;
        }
      }
      
      // Handle header buttons
      if (e.target.closest(".clear-all")) {
        this.clearAll();
      }
      if (e.target.closest(".export-all")) {
        this.exportAll();
      }
    });
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(entryId) {
    const entry = this.entries.find((e) => e.id === entryId);
    if (!entry) return;

    entry.favorite = !entry.favorite;
    this.saveToStorage();

    // Update UI
    const card = this.container.querySelector(`[data-id="${entryId}"]`);
    const favBtn = card?.querySelector(".favorite-btn");
    if (favBtn) {
      favBtn.classList.toggle("active");
      favBtn.textContent = entry.favorite ? "⭐" : "☆";
    }

    this.showNotification(
      entry.favorite ? "Added to favorites" : "Removed from favorites"
    );
  }

  /**
   * Copy loadout to clipboard
   */
  async copyToClipboard(entryId) {
    const entry = this.entries.find((e) => e.id === entryId);
    if (!entry) return;

    const text = this.formatAsText(entry);

    try {
      await navigator.clipboard.writeText(text);
      this.showNotification("Copied to clipboard!");

      // Visual feedback
      const card = this.container.querySelector(`[data-id="${entryId}"]`);
      card?.classList.add("copied");
      setTimeout(() => card?.classList.remove("copied"), 1000);
    } catch (error) {
      console.error("Copy failed:", error);
      this.showNotification("Copy failed", "error");
    }
  }

  /**
   * Show export options
   */
  showExportOptions(entryId) {
    const entry = this.entries.find((e) => e.id === entryId);
    if (!entry) return;

    // Create export modal
    const modal = document.createElement("div");
    modal.className = "export-modal";
    modal.innerHTML = `
            <div class="export-content">
                <h3>Export Loadout</h3>
                <div class="export-options">
                    <button class="export-option" data-format="text">
                        📄 Export as Text
                    </button>
                    <button class="export-option" data-format="json">
                        🔧 Export as JSON
                    </button>
                    <button class="export-option" data-format="image">
                        🖼️ Export as Image
                    </button>
                </div>
                <button class="export-close">Close</button>
            </div>
        `;

    document.body.appendChild(modal);

    // Handle export format selection
    modal.addEventListener("click", (e) => {
      const option = e.target.closest(".export-option");
      if (option) {
        const format = option.dataset.format;
        this.exportEntry(entry, format);
        document.body.removeChild(modal);
      }

      if (e.target.classList.contains("export-close") || e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Export entry in specified format
   */
  exportEntry(entry, format) {
    switch (format) {
      case "text":
        this.exportAsText(entry);
        break;
      case "json":
        this.exportAsJSON(entry);
        break;
      case "image":
        this.exportAsImage(entry);
        break;
    }
  }

  /**
   * Export as text file
   */
  exportAsText(entry) {
    const text = this.formatAsText(entry);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `loadout_${entry.id}.txt`;
    a.click();

    URL.revokeObjectURL(url);
    this.showNotification("Exported as text");
  }

  /**
   * Export as JSON file
   */
  exportAsJSON(entry) {
    const json = JSON.stringify(entry, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `loadout_${entry.id}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showNotification("Exported as JSON");
  }

  /**
   * Export as image (screenshot)
   */
  async exportAsImage(entry) {
    // This would use html2canvas or similar library in production
    this.showNotification("Image export coming soon!", "info");
  }

  /**
   * Format entry as text
   */
  formatAsText(entry) {
    const date = new Date(entry.timestamp).toLocaleString();
    let text = `THE FINALS LOADOUT
================
Generated: ${date}

Class: ${entry.loadout.class}
Weapon: ${entry.loadout.weapon}
Specialization: ${entry.loadout.specialization}
Gadgets: ${entry.loadout.gadgets.join(", ")}`;

    if (entry.analysis) {
      text += `\n\nANALYSIS
--------
Score: ${entry.analysis.score}/10
Meta Rating: ${entry.analysis.metaRating || "N/A"}
Archetype: ${entry.analysis.archetype || "N/A"}
${entry.analysis.text}`;
    }

    text += "\n\nGenerated by The Finals Loadout Generator";

    return text;
  }

  /**
   * Delete entry
   */
  deleteEntry(entryId) {
    const index = this.entries.findIndex((e) => e.id === entryId);
    if (index === -1) return;

    // Remove from array
    this.entries.splice(index, 1);
    this.saveToStorage();

    // Remove from UI with animation
    const card = this.container.querySelector(`[data-id="${entryId}"]`);
    if (card) {
      card.style.animation = "slideOutToLeft 300ms ease";
      setTimeout(() => {
        card.remove();

        // Show empty message if no entries
        if (this.entries.length === 0) {
          this.showEmptyMessage();
        }
      }, 300);
    }

    this.showNotification("Entry deleted");
  }

  /**
   * Show notification
   */
  showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * Render all entries
   */
  render() {
    if (!this.container) return;

    // Find or create the entries container
    let entriesContainer = this.container.querySelector('.history-list, #history-list');
    if (!entriesContainer) {
      // If UI hasn't been set up yet, just return
      console.log('⚠️ Entries container not found, skipping render');
      return;
    }

    // Clear only the entries container
    entriesContainer.innerHTML = "";

    if (this.entries.length === 0) {
      this.showEmptyMessage(entriesContainer);
      return;
    }

    // Render each entry
    this.entries.forEach((entry) => {
      const card = this.createHistoryCard(entry);
      entriesContainer.appendChild(card);
    });
  }

  /**
   * Show empty message
   */
  showEmptyMessage(container = this.container) {
    container.innerHTML = `
            <div class="empty-history">
                <p>No loadouts generated yet</p>
                <p class="empty-hint">Start spinning to build your history!</p>
            </div>
        `;
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(HISTORY_CONFIG.storageKey);
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      this.entries = [];
    }
  }

  /**
   * Save to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(
        HISTORY_CONFIG.storageKey,
        JSON.stringify(this.entries)
      );
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all history
   */
  clearAll() {
    if (confirm("Are you sure you want to clear all history?")) {
      this.entries = [];
      this.saveToStorage();
      this.render();
      this.showNotification("History cleared");
    }
  }

  /**
   * Export all history
   */
  exportAll() {
    const data = {
      version: "2.0",
      exported: new Date().toISOString(),
      entries: this.entries,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `finals_history_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showNotification("All history exported");
  }
}

// ========================================
// Fallback Analyzer (simple analysis when main analyzer is not available)
// ========================================
class FallbackAnalyzer {
  static generateFallback(loadout) {
    const weapons = {
      // Light weapons
      "SR-84": { score: 9, tier: "S", archetype: "Sniper" },
      "LH1": { score: 8, tier: "A", archetype: "Assault" },
      "V9S": { score: 8, tier: "A", archetype: "SMG" },
      "XP-54": { score: 7, tier: "B", archetype: "SMG" },
      
      // Medium weapons
      "FCAR": { score: 9, tier: "S", archetype: "Assault" },
      "AKM": { score: 8, tier: "A", archetype: "Assault" },
      "Model 1887": { score: 7, tier: "B", archetype: "Shotgun" },
      
      // Heavy weapons
      "M134 Minigun": { score: 9, tier: "S", archetype: "LMG" },
      "ShAK-50": { score: 8, tier: "A", archetype: "DMR" },
      "SA1216": { score: 7, tier: "B", archetype: "Shotgun" }
    };

    const weaponData = weapons[loadout.weapon] || { score: 5, tier: "C", archetype: "Unknown" };
    
    return {
      score: weaponData.score,
      metaRating: weaponData.tier,
      archetype: weaponData.archetype,
      text: `${loadout.class} loadout with ${loadout.weapon}. ${weaponData.archetype} playstyle with ${loadout.specialization} support.`,
      saltIndex: Math.random() * 10 // Random salt meter
    };
  }
}

// ========================================
// Export for use
// ========================================
window.HistoryManager = HistoryManager;
window.FallbackAnalyzer = FallbackAnalyzer;

// Initialize when DOM is ready
console.log('🎮 History System: Script loaded');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 History System: Initializing...');
    window.historyManager = new HistoryManager('history-container');
    console.log('✅ History System: Initialized', window.historyManager);
  });
} else {
  console.log('🎮 History System: Initializing immediately...');
  window.historyManager = new HistoryManager('history-container');
  console.log('✅ History System: Initialized', window.historyManager);
}

// World Tour Tracker Settings System
const SETTINGS_KEY = 'wtTrackerSettings';

// Default Configuration
const DEFAULT_SETTINGS = {
  seasonName: 'Season 8',
  seasonStartDate: '2025-09-11',
  seasonEndDate: '2025-12-11',
  matchPoints: {
    win: 25,
    loseFinal: 14,
    round2: 6,
    round1: 2
  },
  ranks: [
    { name: "Bronze IV", points: 25, icon: "B4", color: "#CD7F32", tier: "bronze" },
    { name: "Bronze III", points: 50, icon: "B3", color: "#CD7F32", tier: "bronze" },
    { name: "Bronze II", points: 75, icon: "B2", color: "#CD7F32", tier: "bronze" },
    { name: "Bronze I", points: 100, icon: "B1", color: "#CD7F32", tier: "bronze" },
    { name: "Silver IV", points: 150, icon: "S4", color: "#C0C0C0", tier: "silver" },
    { name: "Silver III", points: 200, icon: "S3", color: "#C0C0C0", tier: "silver" },
    { name: "Silver II", points: 250, icon: "S2", color: "#C0C0C0", tier: "silver" },
    { name: "Silver I", points: 300, icon: "S1", color: "#C0C0C0", tier: "silver" },
    { name: "Gold IV", points: 375, icon: "G4", color: "#FFD700", tier: "gold" },
    { name: "Gold III", points: 450, icon: "G3", color: "#FFD700", tier: "gold" },
    { name: "Gold II", points: 525, icon: "G2", color: "#FFD700", tier: "gold" },
    { name: "Gold I", points: 600, icon: "G1", color: "#FFD700", tier: "gold" },
    { name: "Platinum IV", points: 700, icon: "P4", color: "#E5E4E2", tier: "platinum" },
    { name: "Platinum III", points: 800, icon: "P3", color: "#E5E4E2", tier: "platinum" },
    { name: "Platinum II", points: 900, icon: "P2", color: "#E5E4E2", tier: "platinum" },
    { name: "Platinum I", points: 1000, icon: "P1", color: "#E5E4E2", tier: "platinum" },
    { name: "Diamond IV", points: 1150, icon: "D4", color: "#B9F2FF", tier: "diamond" },
    { name: "Diamond III", points: 1300, icon: "D3", color: "#B9F2FF", tier: "diamond" },
    { name: "Diamond II", points: 1450, icon: "D2", color: "#B9F2FF", tier: "diamond" },
    { name: "Diamond I", points: 1600, icon: "D1", color: "#B9F2FF", tier: "diamond" },
    { name: "Emerald IV", points: 1800, icon: "E4", color: "#50C878", tier: "emerald" },
    { name: "Emerald III", points: 2000, icon: "E3", color: "#50C878", tier: "emerald" },
    { name: "Emerald II", points: 2200, icon: "E2", color: "#50C878", tier: "emerald" },
    { name: "Emerald I", points: 2400, icon: "E1", color: "#50C878", tier: "emerald" }
  ]
};

// Load settings from localStorage
function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
function saveSettingsToStorage(newSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
}

// Calculate total season days
function calculateSeasonDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

// Settings Modal Functions
function openSettings() {
  document.getElementById('settingsModal').style.display = 'block';
  populateSettingsModal();
}

function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

function switchSettingsTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.settings-content').forEach(content => {
    content.style.display = 'none';
  });

  // Show selected tab
  document.getElementById(tab + 'Tab').style.display = 'block';

  // Update tab buttons
  document.querySelectorAll('.settings-tab').forEach(btn => {
    btn.style.color = '#888';
    btn.classList.remove('active');
  });

  const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
  if (activeBtn) {
    activeBtn.style.color = '#50c878';
    activeBtn.classList.add('active');
  }
}

function populateSettingsModal() {
  const settings = loadSettings();

  // Populate match points
  document.getElementById('winPoints').value = settings.matchPoints.win;
  document.getElementById('loseFinalPoints').value = settings.matchPoints.loseFinal;
  document.getElementById('round2Points').value = settings.matchPoints.round2;
  document.getElementById('round1Points').value = settings.matchPoints.round1;

  // Populate season info
  document.getElementById('seasonName').value = settings.seasonName;
  document.getElementById('seasonStart').value = settings.seasonStartDate;
  document.getElementById('seasonEnd').value = settings.seasonEndDate;
  updateTotalDays();

  // Populate ranks table
  const tbody = document.getElementById('ranksTableBody');
  tbody.innerHTML = '';
  settings.ranks.forEach((rank, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input type="text" value="${rank.name}" data-index="${index}" data-field="name" style="background: transparent; border: 1px solid #333; color: white; padding: 5px; width: 100%;"></td>
      <td><input type="number" value="${rank.points}" data-index="${index}" data-field="points" style="background: transparent; border: 1px solid #333; color: white; padding: 5px; width: 80px;"></td>
      <td><input type="text" value="${rank.icon}" data-index="${index}" data-field="icon" style="background: transparent; border: 1px solid #333; color: white; padding: 5px; width: 60px;"></td>
      <td><input type="text" value="${rank.tier}" data-index="${index}" data-field="tier" style="background: transparent; border: 1px solid #333; color: white; padding: 5px; width: 100px;"></td>
    `;
  });
}

function updateTotalDays() {
  const start = new Date(document.getElementById('seasonStart').value);
  const end = new Date(document.getElementById('seasonEnd').value);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  document.getElementById('totalDays').textContent = days + ' days';
}

function saveSettings() {
  const currentSettings = loadSettings();

  // Gather all settings
  const newSettings = {
    seasonName: document.getElementById('seasonName').value,
    seasonStartDate: document.getElementById('seasonStart').value,
    seasonEndDate: document.getElementById('seasonEnd').value,
    matchPoints: {
      win: parseInt(document.getElementById('winPoints').value),
      loseFinal: parseInt(document.getElementById('loseFinalPoints').value),
      round2: parseInt(document.getElementById('round2Points').value),
      round1: parseInt(document.getElementById('round1Points').value)
    },
    ranks: []
  };

  // Gather ranks from table
  const rankInputs = document.querySelectorAll('#ranksTableBody input');
  const tempRanks = [];
  rankInputs.forEach(input => {
    const index = parseInt(input.dataset.index);
    const field = input.dataset.field;

    if (!tempRanks[index]) {
      tempRanks[index] = { ...currentSettings.ranks[index] };
    }

    if (field === 'points') {
      tempRanks[index][field] = parseInt(input.value);
    } else {
      tempRanks[index][field] = input.value;
    }
  });
  newSettings.ranks = tempRanks;

  // Validate
  if (new Date(newSettings.seasonEndDate) <= new Date(newSettings.seasonStartDate)) {
    showNotification('End date must be after start date', 'error');
    return;
  }

  // Validate ranks are in ascending order
  for (let i = 1; i < newSettings.ranks.length; i++) {
    if (newSettings.ranks[i].points <= newSettings.ranks[i - 1].points) {
      showNotification('Rank points must be in ascending order', 'error');
      return;
    }
  }

  // Save and apply
  if (saveSettingsToStorage(newSettings)) {
    showNotification('Settings saved successfully!', 'success');
    closeSettings();
    setTimeout(() => location.reload(), 1000); // Reload to apply new settings
  } else {
    showNotification('Failed to save settings', 'error');
  }
}

function resetToDefaults() {
  if (confirm('Reset all settings to defaults? This cannot be undone.')) {
    saveSettingsToStorage(DEFAULT_SETTINGS);
    populateSettingsModal();
    showNotification('Settings reset to defaults', 'success');
  }
}

function exportSettings() {
  const settings = loadSettings();
  const dataStr = JSON.stringify(settings, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wt-tracker-settings-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('Settings exported successfully', 'success');
}

function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      // Validate structure
      if (!imported.matchPoints || !imported.ranks || !imported.seasonStartDate) {
        throw new Error('Invalid settings file');
      }
      saveSettingsToStorage(imported);
      populateSettingsModal();
      showNotification('Settings imported successfully', 'success');
      setTimeout(() => location.reload(), 1000);
    } catch (error) {
      showNotification('Failed to import settings: ' + error.message, 'error');
    }
  };
  reader.readAsText(file);
}

function shareSettings() {
  const settings = loadSettings();
  const text = `🎮 THE FINALS ${settings.seasonName} Configuration\n` +
              `📅 ${settings.seasonStartDate} to ${settings.seasonEndDate}\n` +
              `🏆 Win: ${settings.matchPoints.win} pts\n` +
              `🥉 Lose Final: ${settings.matchPoints.loseFinal} pts\n` +
              `✅ Round 2: ${settings.matchPoints.round2} pts\n` +
              `❌ Round 1: ${settings.matchPoints.round1} pts`;

  if (navigator.share) {
    navigator.share({
      title: 'World Tour Tracker Settings',
      text: text
    });
  } else {
    navigator.clipboard.writeText(text);
    showNotification('Settings copied to clipboard!', 'success');
  }
}

// Migration function for existing data
function migrateExistingData() {
  const version = localStorage.getItem('cacheVersion');
  if (version && version !== 'v9.0') {
    // Migrate from v8.0 to v9.0
    const existingSettings = {
      seasonName: 'Season 8',
      seasonStartDate: localStorage.getItem('seasonStartDate') || '2025-09-11',
      seasonEndDate: localStorage.getItem('seasonEndDate') || '2025-12-11',
      matchPoints: {
        win: 25,
        loseFinal: 14,
        round2: 6,
        round1: 2
      },
      ranks: DEFAULT_SETTINGS.ranks
    };

    saveSettingsToStorage(existingSettings);
    localStorage.setItem('cacheVersion', 'v9.0');
    console.log('Migrated settings to v9.0');
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Add event listeners for date changes
  const startInput = document.getElementById('seasonStart');
  const endInput = document.getElementById('seasonEnd');
  if (startInput) startInput.addEventListener('change', updateTotalDays);
  if (endInput) endInput.addEventListener('change', updateTotalDays);

  // Run migration if needed
  migrateExistingData();
});

// Export functions for use in main script
window.wtSettings = {
  load: loadSettings,
  save: saveSettingsToStorage,
  getMatchPoints: () => loadSettings().matchPoints,
  getRanks: () => loadSettings().ranks,
  getSeasonDates: () => {
    const s = loadSettings();
    return {
      start: s.seasonStartDate,
      end: s.seasonEndDate,
      name: s.seasonName
    };
  }
};
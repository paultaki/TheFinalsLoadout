/**
 * Diagnostic Overlay for Slot Machine
 * Shows real-time position data and detects issues
 */

(function() {
  'use strict';
  
  // Create diagnostic panel
  const panel = document.createElement('div');
  panel.id = 'diagnostic-panel';
  panel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    background: rgba(0, 0, 0, 0.9);
    color: #0f0;
    font-family: monospace;
    font-size: 11px;
    padding: 10px;
    border: 1px solid #0f0;
    border-radius: 4px;
    z-index: 99999;
    max-height: 400px;
    overflow-y: auto;
  `;
  
  // Add toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '🔍';
  toggleBtn.style.cssText = `
    position: fixed;
    top: 10px;
    right: 320px;
    width: 30px;
    height: 30px;
    background: #000;
    color: #0f0;
    border: 1px solid #0f0;
    border-radius: 4px;
    cursor: pointer;
    z-index: 99999;
    font-size: 16px;
  `;
  toggleBtn.onclick = () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };
  
  document.body.appendChild(panel);
  document.body.appendChild(toggleBtn);
  
  // Diagnostic data
  let diagnosticData = {
    constants: {},
    positions: [],
    issues: [],
    animationState: 'idle'
  };
  
  // Check constants
  function checkConstants() {
    diagnosticData.constants = {
      ITEM_H: window.ITEM_H || 'undefined',
      VIEWPORT_H: window.VIEWPORT_H || 'undefined',
      CENTER_OFFSET: window.CENTER_OFFSET || 'undefined',
      AnimationEngineV2: typeof AnimationEngineV2 !== 'undefined',
      SimpleSpinAnimation: typeof SimpleSpinAnimation !== 'undefined'
    };
    
    // Check for mismatches
    if (window.ITEM_H && window.ITEM_H !== 80) {
      diagnosticData.issues.push(`❌ ITEM_H is ${window.ITEM_H}, should be 80`);
    }
    if (window.VIEWPORT_H && window.VIEWPORT_H !== 240) {
      diagnosticData.issues.push(`❌ VIEWPORT_H is ${window.VIEWPORT_H}, should be 240`);
    }
  }
  
  // Monitor positions
  function monitorPositions() {
    const containers = document.querySelectorAll('.slot-items');
    diagnosticData.positions = [];
    
    containers.forEach((container, index) => {
      const transform = container.style.transform;
      const match = transform ? transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/) : null;
      const position = match ? parseFloat(match[1]) : 0;
      
      const column = container.closest('.slot-column');
      const isSpinning = column ? column.classList.contains('spinning') || column.classList.contains('spinning-fast') : false;
      
      const positionInfo = {
        column: index,
        position: position.toFixed(1),
        isSpinning,
        isCorrect: Math.abs(position - (-1440)) < 1,
        transform: transform || 'none'
      };
      
      diagnosticData.positions.push(positionInfo);
      
      // Check for issues
      if (!isSpinning && !positionInfo.isCorrect && position !== 0) {
        const issue = `Column ${index}: Wrong position ${position.toFixed(1)}px (should be -1440px)`;
        if (!diagnosticData.issues.includes(issue)) {
          diagnosticData.issues.push(issue);
        }
      }
    });
    
    // Check alignment
    if (diagnosticData.positions.length > 0) {
      const finalPositions = diagnosticData.positions
        .filter(p => !p.isSpinning && p.position !== '0.0')
        .map(p => parseFloat(p.position));
      
      if (finalPositions.length > 1) {
        const allSame = finalPositions.every(pos => Math.abs(pos - finalPositions[0]) < 1);
        if (!allSame) {
          diagnosticData.issues.push('❌ Columns are misaligned!');
        }
      }
    }
  }
  
  // Check viewport heights
  function checkViewports() {
    const windows = document.querySelectorAll('.slot-window');
    windows.forEach((window, index) => {
      const height = window.offsetHeight;
      if (height !== 240) {
        diagnosticData.issues.push(`❌ Viewport ${index} height is ${height}px, should be 240px`);
      }
    });
    
    // Check item heights
    const items = document.querySelectorAll('.slot-item');
    const wrongHeights = [];
    items.forEach(item => {
      const height = item.offsetHeight;
      if (height !== 80 && !wrongHeights.includes(height)) {
        wrongHeights.push(height);
      }
    });
    
    if (wrongHeights.length > 0) {
      diagnosticData.issues.push(`❌ Items have wrong heights: ${wrongHeights.join(', ')}px (should be 80px)`);
    }
  }
  
  // Check for gaps
  function checkForGaps() {
    const slotMachine = document.querySelector('.slot-machine');
    const slotHeader = document.querySelector('.slot-header');
    const slotColumns = document.querySelector('.slot-columns');
    
    if (slotMachine && slotHeader && slotColumns) {
      const headerBottom = slotHeader.getBoundingClientRect().bottom;
      const columnsTop = slotColumns.getBoundingClientRect().top;
      const gap = columnsTop - headerBottom;
      
      if (gap > 20) {
        diagnosticData.issues.push(`❌ Gap detected: ${gap.toFixed(1)}px between header and columns`);
      }
    }
  }
  
  // Update display
  function updateDisplay() {
    // Clear issues for fresh check
    diagnosticData.issues = [];
    
    checkConstants();
    monitorPositions();
    checkViewports();
    checkForGaps();
    
    let html = '<h4 style="margin:0 0 10px 0;color:#0f0;">🔍 Slot Machine Diagnostics</h4>';
    
    // Constants
    html += '<div style="border-bottom:1px solid #333;padding-bottom:5px;margin-bottom:5px;">';
    html += '<strong>Constants:</strong><br>';
    Object.entries(diagnosticData.constants).forEach(([key, value]) => {
      const isCorrect = 
        (key === 'ITEM_H' && value === 80) ||
        (key === 'VIEWPORT_H' && value === 240) ||
        (key === 'CENTER_OFFSET' && value === 160) ||
        (key === 'AnimationEngineV2' && value === true) ||
        (key === 'SimpleSpinAnimation' && value === true);
      
      const color = isCorrect ? '#0f0' : '#f00';
      html += `<span style="color:${color}">${key}: ${value}</span><br>`;
    });
    html += '</div>';
    
    // Positions
    html += '<div style="border-bottom:1px solid #333;padding-bottom:5px;margin-bottom:5px;">';
    html += '<strong>Column Positions:</strong><br>';
    diagnosticData.positions.forEach(pos => {
      const color = pos.isCorrect ? '#0f0' : (pos.isSpinning ? '#ff0' : '#f00');
      const status = pos.isSpinning ? '🔄' : (pos.isCorrect ? '✅' : '❌');
      html += `<span style="color:${color}">Col ${pos.column}: ${pos.position}px ${status}</span><br>`;
    });
    html += '</div>';
    
    // Issues
    if (diagnosticData.issues.length > 0) {
      html += '<div style="border-bottom:1px solid #333;padding-bottom:5px;margin-bottom:5px;">';
      html += '<strong style="color:#f00;">Issues Detected:</strong><br>';
      diagnosticData.issues.forEach(issue => {
        html += `<span style="color:#f00;">• ${issue}</span><br>`;
      });
      html += '</div>';
    } else {
      html += '<div style="color:#0f0;font-weight:bold;">✅ No issues detected!</div>';
    }
    
    // Animation state
    html += `<div style="margin-top:5px;color:#0ff;">State: ${diagnosticData.animationState}</div>`;
    
    panel.innerHTML = html;
  }
  
  // Monitor animation state
  function monitorAnimationState() {
    const spinning = document.querySelectorAll('.slot-column.spinning').length;
    const complete = document.querySelectorAll('.animation-complete').length;
    
    if (spinning > 0) {
      diagnosticData.animationState = `Spinning (${spinning} columns)`;
    } else if (complete > 0) {
      diagnosticData.animationState = 'Complete';
    } else {
      diagnosticData.animationState = 'Idle';
    }
  }
  
  // Auto-update
  setInterval(() => {
    monitorAnimationState();
    updateDisplay();
  }, 100);
  
  // Initial update
  updateDisplay();
  
  // Log to console
  console.log('%c🔍 Diagnostic Overlay Loaded', 'color: #0f0; font-weight: bold;');
  console.log('Toggle with button or set window.diagnostics = false to hide');
  
  // Global control
  window.diagnostics = true;
  window.toggleDiagnostics = () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };
  
})();
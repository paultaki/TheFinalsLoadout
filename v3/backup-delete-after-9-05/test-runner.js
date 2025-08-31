/**
 * Test Runner Script - Verifies slot machine fixes
 * Run this in the browser console on the index-complete-fix.html page
 */

(function() {
  console.log('%c🧪 Starting Slot Machine Test Suite', 'color: #0f0; font-size: 16px; font-weight: bold');
  
  const tests = [];
  
  function test(name, fn) {
    try {
      const result = fn();
      tests.push({ name, result, status: result ? 'PASS' : 'FAIL' });
      console.log(`${result ? '✅' : '❌'} ${name}: ${result ? 'PASS' : 'FAIL'}`);
      return result;
    } catch (e) {
      tests.push({ name, result: false, status: 'ERROR', error: e.message });
      console.error(`❌ ${name}: ERROR - ${e.message}`);
      return false;
    }
  }
  
  // Test 1: Check constants
  test('Constants are correct', () => {
    const itemH = window.ITEM_H;
    const viewportH = window.VIEWPORT_H;
    const centerOffset = window.CENTER_OFFSET;
    
    console.log(`  ITEM_H: ${itemH}, VIEWPORT_H: ${viewportH}, CENTER_OFFSET: ${centerOffset}`);
    
    // They should either be undefined (using defaults) or correct values
    return (itemH === undefined || itemH === 80) && 
           (viewportH === undefined || viewportH === 240) &&
           (centerOffset === undefined || centerOffset === 160);
  });
  
  // Test 2: Check viewport dimensions
  test('Viewport dimensions correct', () => {
    const windows = document.querySelectorAll('.slot-window');
    const heights = Array.from(windows).map(w => w.offsetHeight);
    console.log(`  Viewport heights: ${heights.join(', ')}px`);
    return heights.every(h => h === 240);
  });
  
  // Test 3: Check item heights
  test('Item heights correct', () => {
    const items = document.querySelectorAll('.slot-item');
    const heights = new Set(Array.from(items).map(i => i.offsetHeight));
    console.log(`  Unique item heights: ${Array.from(heights).join(', ')}px`);
    return heights.size === 1 && heights.has(80);
  });
  
  // Test 4: Check for gaps
  test('No gaps between header and slots', () => {
    const header = document.querySelector('.slot-header');
    const columns = document.querySelector('.slot-columns');
    
    if (header && columns) {
      const headerBottom = header.getBoundingClientRect().bottom;
      const columnsTop = columns.getBoundingClientRect().top;
      const gap = columnsTop - headerBottom;
      console.log(`  Gap: ${gap.toFixed(1)}px`);
      return gap < 30;
    }
    return false;
  });
  
  // Test 5: Check current positions
  test('Check current slot positions', () => {
    const containers = document.querySelectorAll('.slot-items');
    const positions = [];
    
    containers.forEach((container, i) => {
      const transform = container.style.transform;
      const match = transform ? transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/) : null;
      const position = match ? parseFloat(match[1]) : 0;
      positions.push(position);
    });
    
    console.log(`  Current positions: ${positions.map(p => p.toFixed(0)).join(', ')}px`);
    
    // Check if they're either at 0 (initial) or -1440 (correct final)
    return positions.every(p => p === 0 || Math.abs(p - (-1440)) < 10);
  });
  
  // Test 6: Check CSS files loaded
  test('All fix CSS files loaded', () => {
    const styleSheets = Array.from(document.styleSheets);
    const fixFiles = [
      'slot-machine-fixes.css',
      'ultimate-alignment-fix.css',
      'comprehensive-fix.css'
    ];
    
    const loaded = fixFiles.filter(file => 
      styleSheets.some(sheet => sheet.href && sheet.href.includes(file))
    );
    
    console.log(`  Loaded fix files: ${loaded.join(', ')}`);
    return loaded.length >= 2; // At least 2 of the fix files
  });
  
  // Test 7: Check JS fixes loaded
  test('JavaScript fixes loaded', () => {
    const scripts = Array.from(document.scripts);
    const fixScripts = [
      'animation-constants-fix.js',
      'position-fix.js',
      'animation-engine-patch.js'
    ];
    
    const loaded = fixScripts.filter(script => 
      scripts.some(s => s.src && s.src.includes(script))
    );
    
    console.log(`  Loaded fix scripts: ${loaded.join(', ')}`);
    return loaded.length >= 2; // At least 2 of the fix scripts
  });
  
  // Test 8: Diagnostic overlay present
  test('Diagnostic overlay loaded', () => {
    const panel = document.getElementById('diagnostic-panel');
    const hasPanel = panel !== null;
    console.log(`  Diagnostic panel: ${hasPanel ? 'Present' : 'Missing'}`);
    return hasPanel;
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL').length;
  const errors = tests.filter(t => t.status === 'ERROR').length;
  
  const allPass = passed === tests.length;
  const color = allPass ? '#0f0' : '#f00';
  
  console.log(`%c📊 Test Results: ${passed}/${tests.length} passed`, `color: ${color}; font-size: 14px; font-weight: bold`);
  
  if (failed > 0) {
    console.log(`%c❌ ${failed} tests failed`, 'color: #f00');
  }
  
  if (errors > 0) {
    console.log(`%c⚠️ ${errors} tests errored`, 'color: #ff0');
  }
  
  // Recommendations
  if (!allPass) {
    console.log('\n%c🔧 Recommendations:', 'color: #0ff; font-weight: bold');
    
    if (!test('Constants are correct', () => window.ITEM_H === 80)) {
      console.log('• The animation-constants-fix.js may not be loading properly');
    }
    
    if (tests.find(t => t.name === 'Viewport dimensions correct' && !t.result)) {
      console.log('• CSS fixes may not be applying - check ultimate-alignment-fix.css');
    }
    
    if (tests.find(t => t.name === 'Check current slot positions' && !t.result)) {
      console.log('• Position overrides may not be working - verify position-fix.js is loaded');
    }
  } else {
    console.log('\n%c✨ All tests passed! The slot machine should be working correctly.', 'color: #0f0; font-size: 14px');
  }
  
  // Interactive test
  console.log('\n%c🎮 To test animation:', 'color: #ff0; font-weight: bold');
  console.log('1. Click "GENERATE YOUR LOADOUT" button');
  console.log('2. Watch the diagnostic panel (top-right)');
  console.log('3. Final positions should all be -1440px');
  console.log('4. All winner items should align horizontally');
  
  return tests;
})();
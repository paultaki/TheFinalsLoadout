/**
 * Animation Verification Script
 * Run this in the browser console to check if animations are working
 */

(function() {
  console.log('%c🔍 Animation Verification Starting...', 'color: #0ff; font-size: 16px; font-weight: bold');
  
  const checks = [];
  
  // Check 1: CSS not blocking transforms
  function checkCSSTransforms() {
    const testEl = document.createElement('div');
    testEl.className = 'slot-items';
    testEl.style.transform = 'translateY(-100px)';
    document.body.appendChild(testEl);
    
    const computed = window.getComputedStyle(testEl);
    const transform = computed.transform;
    document.body.removeChild(testEl);
    
    const canSetTransform = transform && transform !== 'none';
    
    checks.push({
      name: 'CSS allows transform changes',
      passed: canSetTransform,
      details: `Transform test: ${transform}`
    });
    
    return canSetTransform;
  }
  
  // Check 2: Animation engines loaded
  function checkAnimationEngines() {
    const engines = {
      'SmoothSpinAnimation': typeof window.SmoothSpinAnimation !== 'undefined',
      'smoothAnimation': typeof window.smoothAnimation !== 'undefined',
      'SimpleSpinAnimation': typeof window.SimpleSpinAnimation !== 'undefined',
      'AnimationEngineV2': typeof window.AnimationEngineV2 !== 'undefined'
    };
    
    Object.entries(engines).forEach(([name, loaded]) => {
      checks.push({
        name: `${name} loaded`,
        passed: loaded,
        details: loaded ? 'Available' : 'Not found'
      });
    });
    
    return engines.smoothAnimation || engines.SimpleSpinAnimation;
  }
  
  // Check 3: Constants are correct
  function checkConstants() {
    const correct = {
      ITEM_H: window.ITEM_H === 80 || window.ITEM_H === undefined,
      VIEWPORT_H: window.VIEWPORT_H === 240 || window.VIEWPORT_H === undefined,
      CENTER_OFFSET: window.CENTER_OFFSET === 160 || window.CENTER_OFFSET === undefined
    };
    
    checks.push({
      name: 'Animation constants',
      passed: correct.ITEM_H && correct.VIEWPORT_H && correct.CENTER_OFFSET,
      details: `ITEM_H: ${window.ITEM_H}, VIEWPORT_H: ${window.VIEWPORT_H}, CENTER_OFFSET: ${window.CENTER_OFFSET}`
    });
    
    return correct.ITEM_H && correct.VIEWPORT_H && correct.CENTER_OFFSET;
  }
  
  // Check 4: No CSS forcing position
  function checkCSSOverrides() {
    const styleSheets = Array.from(document.styleSheets);
    let hasForceTransform = false;
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          if (rule.style && rule.selectorText && rule.selectorText.includes('slot-items')) {
            const transform = rule.style.transform;
            if (transform && transform.includes('!important') && transform.includes('translateY(-1440px)')) {
              hasForceTransform = true;
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheets can't be read
      }
    });
    
    checks.push({
      name: 'No CSS forcing position',
      passed: !hasForceTransform,
      details: hasForceTransform ? 'CSS has !important transform override' : 'CSS allows animation'
    });
    
    return !hasForceTransform;
  }
  
  // Check 5: Test actual animation
  async function testAnimation() {
    console.log('%c🎮 Testing actual animation...', 'color: #ff0; font-weight: bold');
    
    const columns = document.querySelectorAll('.slot-column');
    if (columns.length === 0) {
      checks.push({
        name: 'Animation test',
        passed: false,
        details: 'No slot columns found'
      });
      return false;
    }
    
    // Get first column's items container
    const container = columns[0].querySelector('.slot-items');
    if (!container) {
      checks.push({
        name: 'Animation test',
        passed: false,
        details: 'No items container found'
      });
      return false;
    }
    
    // Try to animate it
    const startPos = 0;
    const endPos = -100;
    let currentPos = startPos;
    let frameCount = 0;
    const maxFrames = 60;
    
    return new Promise(resolve => {
      const animate = () => {
        frameCount++;
        currentPos -= 2;
        container.style.transform = `translateY(${currentPos}px)`;
        
        if (frameCount < maxFrames && currentPos > endPos) {
          requestAnimationFrame(animate);
        } else {
          // Check if animation worked
          const finalTransform = container.style.transform;
          const animated = finalTransform && finalTransform.includes('translateY');
          
          // Reset
          container.style.transform = 'translateY(0)';
          
          checks.push({
            name: 'Animation test',
            passed: animated,
            details: `Animated ${frameCount} frames, final: ${finalTransform}`
          });
          
          resolve(animated);
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  // Run all checks
  async function runChecks() {
    checkCSSTransforms();
    checkAnimationEngines();
    checkConstants();
    checkCSSOverrides();
    await testAnimation();
    
    // Display results
    console.log('\n%c📊 Animation Verification Results:', 'color: #0ff; font-size: 14px; font-weight: bold');
    
    const passed = checks.filter(c => c.passed).length;
    const total = checks.length;
    const allPassed = passed === total;
    
    checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      const color = check.passed ? '#0f0' : '#f00';
      console.log(`%c${icon} ${check.name}: ${check.details}`, `color: ${color}`);
    });
    
    console.log('\n%c' + '='.repeat(50), 'color: #666');
    const resultColor = allPassed ? '#0f0' : '#f00';
    console.log(`%c${passed}/${total} checks passed`, `color: ${resultColor}; font-size: 16px; font-weight: bold`);
    
    if (!allPassed) {
      console.log('\n%c🔧 Fixes needed:', 'color: #ff0; font-weight: bold');
      
      if (!checks.find(c => c.name === 'CSS allows transform changes').passed) {
        console.log('• CSS is blocking transforms - check for !important overrides');
      }
      
      if (!checks.find(c => c.name === 'smoothAnimation loaded').passed) {
        console.log('• Smooth animation engine not loaded - check script inclusion');
      }
      
      if (!checks.find(c => c.name === 'No CSS forcing position').passed) {
        console.log('• CSS has forced position - remove translateY(-1440px) !important');
      }
    } else {
      console.log('\n%c✨ Animation system is ready!', 'color: #0f0; font-size: 14px; font-weight: bold');
      console.log('Click "GENERATE YOUR LOADOUT" to test the full animation');
    }
    
    return { passed, total, allPassed, checks };
  }
  
  // Run the verification
  runChecks();
  
})();
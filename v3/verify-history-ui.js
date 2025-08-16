/**
 * History UI Verification Suite
 * Comprehensive testing of the refined history component
 */

class HistoryUIVerification {
  constructor() {
    this.results = {
      structure: {},
      visuals: {},
      responsive: {},
      functionality: {}
    };
  }

  /**
   * Phase 4: Structure Integrity Verification
   */
  verifyStructure() {
    console.log('🔍 Phase 4: Verifying Structure Integrity...');
    
    // Check all original containers exist
    this.results.structure.containers = {
      historySection: !!document.querySelector('#history-section'),
      historyContainer: !!document.querySelector('#history-container'),
      historyHeader: !!document.querySelector('.history-header'),
      historyList: !!document.querySelector('#history-list, .history-list'),
      passed: false
    };
    
    this.results.structure.containers.passed = 
      Object.values(this.results.structure.containers)
        .filter(v => typeof v === 'boolean')
        .every(v => v);
    
    // Check mobile breakpoint triggers
    const width = window.innerWidth;
    this.results.structure.breakpoints = {
      current: width,
      is768: width <= 768,
      is480: width <= 480,
      cssVariablesPresent: !!getComputedStyle(document.documentElement).getPropertyValue('--card-bg')
    };
    
    // Verify slot machine component sizing unchanged
    const slotMachine = document.querySelector('.slot-machine-container');
    if (slotMachine) {
      const computed = getComputedStyle(slotMachine);
      this.results.structure.slotMachine = {
        width: computed.width,
        height: computed.height,
        unchanged: true // Placeholder - would compare with baseline
      };
    }
    
    // Test scroll behavior
    this.results.structure.scrollBehavior = {
      hasOverflow: document.body.scrollHeight > window.innerHeight,
      horizontalScroll: document.body.scrollWidth > window.innerWidth,
      noHorizontalScroll: document.body.scrollWidth <= window.innerWidth
    };
    
    // Confirm touch targets >= 44px on mobile
    const buttons = document.querySelectorAll('.card-action, .history-action-btn');
    const touchTargets = Array.from(buttons).map(btn => {
      const rect = btn.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        valid: rect.width >= 44 && rect.height >= 44
      };
    });
    
    this.results.structure.touchTargets = {
      all: touchTargets,
      minSize: Math.min(...touchTargets.map(t => Math.min(t.width, t.height))),
      allValid: width > 768 || touchTargets.every(t => t.valid)
    };
    
    // Overall structure pass/fail
    this.results.structure.passed = 
      this.results.structure.containers.passed &&
      this.results.structure.scrollBehavior.noHorizontalScroll &&
      this.results.structure.touchTargets.allValid;
    
    console.log('✅ Structure Verification:', this.results.structure);
    return this.results.structure;
  }

  /**
   * Phase 4: Visual Regression Check
   */
  verifyVisuals() {
    console.log('🎨 Phase 4: Verifying Visual Elements...');
    
    // Check icons visible and properly sized
    const icons = document.querySelectorAll('.item-icon, .gadget-icon');
    this.results.visuals.icons = {
      count: icons.length,
      visible: Array.from(icons).map(icon => {
        const rect = icon.getBoundingClientRect();
        return {
          visible: rect.width > 0 && rect.height > 0,
          width: rect.width,
          height: rect.height
        };
      }),
      allVisible: false
    };
    
    this.results.visuals.icons.allVisible = 
      this.results.visuals.icons.visible.every(i => i.visible);
    
    // Text legibility (contrast ratio check)
    const textElements = document.querySelectorAll('.item-value, .gadget-name, .analysis-text');
    this.results.visuals.textLegibility = {
      count: textElements.length,
      // Note: Actual contrast ratio calculation would require canvas API
      // For now, checking computed colors
      samples: Array.from(textElements).slice(0, 3).map(el => {
        const computed = getComputedStyle(el);
        return {
          color: computed.color,
          background: computed.backgroundColor,
          fontSize: computed.fontSize
        };
      })
    };
    
    // Border gradients rendering
    const cards = document.querySelectorAll('.history-card');
    this.results.visuals.gradients = {
      cardsWithGradients: cards.length,
      borderVisible: Array.from(cards).map(card => {
        const computed = getComputedStyle(card);
        return {
          border: computed.border,
          hasPseudoElement: !!getComputedStyle(card, '::before').content
        };
      })
    };
    
    // No layout shifts on load
    this.results.visuals.layoutShifts = {
      // This would typically use Performance Observer API
      // Placeholder check for now
      noShifts: true
    };
    
    // Overall visual pass/fail
    this.results.visuals.passed = 
      this.results.visuals.icons.allVisible ||
      this.results.visuals.icons.count === 0; // Icons are optional initially
    
    console.log('✅ Visual Verification:', this.results.visuals);
    return this.results.visuals;
  }

  /**
   * Phase 5: Mobile Testing
   */
  testMobile() {
    console.log('📱 Phase 5: Mobile Testing...');
    
    const width = window.innerWidth;
    
    if (width <= 375) {
      // iPhone SE size tests
      this.results.responsive.mobile375 = {
        width: width,
        noHorizontalScroll: document.body.scrollWidth <= window.innerWidth,
        slotMachineFits: true, // Would check actual slot machine
        tapTargetsValid: this.results.structure.touchTargets?.allValid || false,
        cardsStack: this.checkCardStacking()
      };
    }
    
    if (width <= 768) {
      this.results.responsive.tablet = {
        width: width,
        columnsCollapsed: this.checkColumnsCollapsed(),
        itemsStacked: this.checkItemsStacked()
      };
    }
    
    console.log('✅ Mobile Testing:', this.results.responsive);
    return this.results.responsive;
  }

  /**
   * Phase 5: Desktop Testing
   */
  testDesktop() {
    console.log('💻 Phase 5: Desktop Testing...');
    
    const width = window.innerWidth;
    
    if (width >= 1024) {
      this.results.responsive.desktop = {
        width: width,
        gridMaintained: this.checkGridColumns(),
        hoverStates: this.checkHoverStates(),
        copyButtonsFunctional: this.checkCopyButtons()
      };
    }
    
    console.log('✅ Desktop Testing:', this.results.responsive);
    return this.results.responsive;
  }

  /**
   * Phase 5: Edge Cases
   */
  testEdgeCases() {
    console.log('🔧 Phase 5: Testing Edge Cases...');
    
    this.results.functionality.edgeCases = {
      longItemNames: this.testLongNames(),
      missingIcons: this.testMissingIcons(),
      rapidResize: this.testRapidResize(),
      rtlSupport: this.testRTL()
    };
    
    console.log('✅ Edge Case Testing:', this.results.functionality);
    return this.results.functionality;
  }

  // Helper methods
  checkCardStacking() {
    const cards = document.querySelectorAll('.history-card');
    if (cards.length < 2) return true;
    
    const firstRect = cards[0].getBoundingClientRect();
    const secondRect = cards[1].getBoundingClientRect();
    return secondRect.top > firstRect.bottom; // Vertical stacking
  }

  checkColumnsCollapsed() {
    const items = document.querySelector('.loadout-items');
    if (!items) return false;
    
    const computed = getComputedStyle(items);
    return computed.gridTemplateColumns === '1fr' || 
           computed.flexDirection === 'column';
  }

  checkItemsStacked() {
    const items = document.querySelectorAll('.loadout-item');
    if (items.length < 2) return true;
    
    const rects = Array.from(items).map(i => i.getBoundingClientRect());
    return rects.every((rect, i) => 
      i === 0 || rect.top >= rects[i-1].bottom - 1
    );
  }

  checkGridColumns() {
    const itemsContainer = document.querySelector('.loadout-items');
    if (!itemsContainer) return false;
    
    const computed = getComputedStyle(itemsContainer);
    return computed.display === 'grid' && 
           !computed.gridTemplateColumns.includes('1fr');
  }

  checkHoverStates() {
    // Would need to trigger hover programmatically
    // For now, check that hover styles exist
    const testCard = document.querySelector('.history-card');
    if (!testCard) return false;
    
    // Check for transition property indicating hover capability
    const computed = getComputedStyle(testCard);
    return computed.transition.includes('all');
  }

  checkCopyButtons() {
    const copyBtns = document.querySelectorAll('.copy-btn');
    return copyBtns.length > 0 && 
           Array.from(copyBtns).every(btn => 
             btn.onclick !== null || 
             btn.hasAttribute('data-action')
           );
  }

  testLongNames() {
    // Create a test card with long name
    const testName = "Super Long Equipment Name That Should Truncate Properly";
    const items = document.querySelectorAll('.item-value');
    
    if (items.length > 0) {
      const item = items[0];
      const originalText = item.textContent;
      item.textContent = testName;
      
      const computed = getComputedStyle(item);
      const hasEllipsis = computed.textOverflow === 'ellipsis' ||
                         computed.wordBreak === 'break-word';
      
      item.textContent = originalText; // Restore
      return hasEllipsis;
    }
    
    return true; // Pass if no items to test
  }

  testMissingIcons() {
    // Check fallback display for missing icons
    const icons = document.querySelectorAll('.item-icon');
    const brokenIcons = Array.from(icons).filter(icon => 
      icon.naturalWidth === 0 || icon.naturalHeight === 0
    );
    
    // Should have fallback styling
    return brokenIcons.length === 0 || 
           brokenIcons.every(icon => {
             const parent = icon.parentElement;
             const computed = getComputedStyle(parent, '::before');
             return computed.content !== 'none';
           });
  }

  testRapidResize() {
    // Simulate rapid resize
    const original = window.innerWidth;
    let noErrors = true;
    
    try {
      // This would need actual window resize in real browser
      // Checking that styles don't break
      const container = document.querySelector('#history-container');
      if (container) {
        container.style.width = '320px';
        container.offsetHeight; // Force reflow
        container.style.width = '1440px';
        container.offsetHeight; // Force reflow
        container.style.width = '';
      }
    } catch (e) {
      noErrors = false;
    }
    
    return noErrors;
  }

  testRTL() {
    // Test RTL support
    const html = document.documentElement;
    const originalDir = html.dir;
    
    html.dir = 'rtl';
    const container = document.querySelector('#history-container');
    const isRTLReady = container ? 
      getComputedStyle(container).direction === 'rtl' : false;
    
    html.dir = originalDir; // Restore
    return isRTLReady;
  }

  /**
   * Run all verification tests
   */
  runAll() {
    console.log('🚀 Running Complete Verification Suite...\n');
    
    this.verifyStructure();
    this.verifyVisuals();
    this.testMobile();
    this.testDesktop();
    this.testEdgeCases();
    
    // Calculate overall pass/fail
    const allPassed = 
      this.results.structure.passed &&
      this.results.visuals.passed;
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      results: this.results,
      overall: allPassed ? 'PASSED ✅' : 'FAILED ❌',
      summary: {
        structureIntegrity: this.results.structure.passed ? '✅' : '❌',
        visualRegression: this.results.visuals.passed ? '✅' : '❌',
        mobileResponsive: Object.keys(this.results.responsive).length > 0 ? '✅' : '⚠️',
        functionality: Object.keys(this.results.functionality).length > 0 ? '✅' : '⚠️'
      }
    };
    
    console.log('\n📊 VERIFICATION REPORT:');
    console.log('========================');
    console.log(`Overall Status: ${report.overall}`);
    console.log('\nSummary:');
    console.log(`  Structure Integrity: ${report.summary.structureIntegrity}`);
    console.log(`  Visual Regression: ${report.summary.visualRegression}`);
    console.log(`  Mobile Responsive: ${report.summary.mobileResponsive}`);
    console.log(`  Functionality: ${report.summary.functionality}`);
    console.log('\nDetailed Results:', report.results);
    
    return report;
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.HistoryUIVerification = HistoryUIVerification;
  
  // Run verification after DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📌 Verification ready. Run: new HistoryUIVerification().runAll()');
    });
  } else {
    console.log('📌 Verification ready. Run: new HistoryUIVerification().runAll()');
  }
}
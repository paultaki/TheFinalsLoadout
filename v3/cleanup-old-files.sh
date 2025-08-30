#!/bin/bash

# Cleanup script for The Finals Loadout v3
# This script removes old CSS and JS files that have been consolidated

echo "The Finals Loadout v3 - Cleanup Script"
echo "======================================"
echo ""
echo "This will remove old CSS and JS files that have been consolidated."
echo "Make sure you have tested the new consolidated files first!"
echo ""
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Cleanup cancelled."
    exit 0
fi

echo "Starting cleanup..."

# Old CSS files to remove (keeping styles-consolidated.css)
OLD_CSS_FILES=(
    "animation-friendly-fix.css"
    "automated-flow-styles.css"
    "bonus-styles.css"
    "column-alignment-fix.css"
    "complete-animation-fix.css"
    "comprehensive-fix.css"
    "history-styles-refined.css"
    "history-styles.css"
    "layout-fixes.css"
    "polish-styles-fixed.css"
    "polish-styles.css"
    "real-slot-machine.css"
    "selection-styles.css"
    "slot-center-fix.css"
    "slot-machine-fixes.css"
    "spin-animation.css"
    "style-override-fix.css"
    "style.css"
    "ultimate-alignment-fix.css"
    "ultimate-fix-v2.css"
    "ultimate-height-fix.css"
    "unified-fix.css"
    "viewport-fix.css"
)

# Old JS files to remove (keeping app-optimized.js)
OLD_JS_FILES=(
    "animation-constants-fix.js"
    "animation-engine-patch.js"
    "animation-engine-v2.js"
    "app.js"
    "automated-flow.js"
    "bonus-system.js"
    "consistent-spin-animation.js"
    "diagnostic-overlay.js"
    "downward-spin-fix.js"
    "filter-system.js"
    "final-position-fix.js"
    "history-system-enhanced.js"
    "history-system.js"
    "image-preloader.js"
    "lazy-images.js"
    "loadout-loader.js"
    "position-fix.js"
    "quick-spins-fix.js"
    "real-slot-machine.js"
    "simple-spin-animation.js"
    "slot-machine.js"
    "smooth-animation-engine.js"
    "sound-integration-patch.js"
    "sound-manager-fixed.js"
    "sound-manager.js"
    "test-runner.js"
    "verify-animation.js"
    "winner-lock.js"
)

# Remove old CSS files
echo "Removing old CSS files..."
for file in "${OLD_CSS_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  Removed: $file"
    fi
done

# Remove old JS files
echo "Removing old JS files..."
for file in "${OLD_JS_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  Removed: $file"
    fi
done

# Remove test HTML files
echo "Removing test HTML files..."
TEST_HTML_FILES=$(find . -maxdepth 1 -name "*test*.html" -o -name "*fix*.html" -o -name "*verify*.html" 2>/dev/null)
for file in $TEST_HTML_FILES; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  Removed: $file"
    fi
done

echo ""
echo "Cleanup complete!"
echo ""
echo "Remaining files:"
echo "  - index.html (main file)"
echo "  - index-backup.html (backup)"
echo "  - styles-consolidated.css (new consolidated CSS)"
echo "  - app-optimized.js (new consolidated JS)"
echo ""
echo "Remember to update any deployment scripts to use the new files."
#!/bin/bash

# Step 1: Abort any in-progress rebase
echo "🔄 Aborting any in-progress rebase..."
git rebase --abort 2>/dev/null || echo "No rebase in progress"

# Step 2: Create a new orphan branch (no history)
echo "🌱 Creating new orphan branch 'clean-main'..."
git checkout --orphan clean-main

# Step 3: Remove all files from the index
echo "🧹 Clearing the index..."
git rm -rf --cached .

# Step 4: Delete v2 and v2-react folders completely
echo "🗑️  Deleting v2 and v2-react folders..."
rm -rf v2 v2-react

# Step 5: Delete any .env files
echo "🔐 Removing all .env files..."
find . -name ".env*" -type f -delete

# Step 6: Remove any other sensitive files
echo "🔍 Removing other sensitive files..."
rm -f .anthropic-key .claude-key api-key.txt
rm -rf .env.local .env.production .env.development

# Step 7: Stage only the files you want to keep
echo "📦 Staging clean root files..."
# Core files
git add index.html app.js style.css vite.config.js package.json package-lock.json

# Directories
git add js/ images/ sounds/ src/ styles/ css/

# Other important files
git add loadout-history.html loadout-history.js
git add jest.config.js tsconfig.json setupTests.ts
git add playwright.config.ts .github/ .gitignore

# Legal and docs
git add legal/ feedback/ patch-notes/ ragequit/

# Test files
git add test-overlay-sequence.html

# Step 8: Create the clean commit
echo "💾 Creating clean commit..."
git commit -m "Clean production build - root files only

- Removed all v2 and v2-react directories
- Removed all .env files and API keys
- Kept only production-ready root files
- Clean history with no sensitive data"

# Step 9: Force push to overwrite main branch
echo "🚀 Force pushing to main (this will overwrite history)..."
echo "⚠️  WARNING: This will permanently overwrite the main branch!"
echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

git branch -M main
git push origin main --force

echo "✅ Repository cleaned successfully!"
echo "📋 Summary:"
echo "  - All v2 and v2-react folders deleted"
echo "  - All .env files removed"
echo "  - Git history completely rewritten"
echo "  - Only root production files remain"
echo "  - Main branch force-pushed with clean history"
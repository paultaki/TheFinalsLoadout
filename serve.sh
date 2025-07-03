#!/bin/bash

# ============================================
# LIVE SERVER LAUNCHER FOR WSL
# ============================================
#
# SAVE & SETUP:
#   1. Save this file as serve.sh
#   2. Make executable: chmod +x serve.sh
#   3. Run: ./serve.sh
#
# CREATE ALIAS (optional):
#   1. Add to ~/.bashrc:
#      alias serve='~/path/to/serve.sh'
#   2. Reload: source ~/.bashrc
#   3. Use anywhere: serve
#
# REQUIREMENTS:
#   - Node.js/npm installed
#   - WSL with Windows interop enabled
# ============================================

# Kill existing live-server processes
echo "🔍 Checking for existing live-server processes..."
PIDS=$(ps aux | grep '[n]px live-server' | awk '{print $2}')
if [ ! -z "$PIDS" ]; then
    echo "⚠️  Found live-server process(es): $PIDS"
    echo "🔪 Killing existing processes..."
    echo $PIDS | xargs kill -9 2>/dev/null
    echo "✅ Cleaned up old processes"
else
    echo "✅ No existing live-server processes found"
fi

# Start new live-server instance
echo "🚀 Starting live-server on port 5500..."
nohup npx live-server --port=5500 --no-browser > /dev/null 2>&1 &
SERVER_PID=$!
echo "✅ Server started with PID: $SERVER_PID"

# Wait for server initialization
echo "⏳ Waiting for server to initialize..."
sleep 1

# Open in Windows browser
echo "🌐 Opening http://localhost:5500 in default browser..."
cmd.exe /c start http://localhost:5500 2>/dev/null

echo "🎉 Done! Server running on http://localhost:5500"
echo "💡 To stop: kill $SERVER_PID"

# Auto-create alias suggestion
echo ""
echo "📝 To create 'serve' alias, add this to ~/.bashrc:"
echo "   alias serve='$(realpath $0)'"

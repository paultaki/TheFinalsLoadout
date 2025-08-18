/**
 * Animation Debug Overlay for V4 Testing
 * Real-time monitoring of slot machine animations
 */

class AnimationDebugOverlay {
    constructor() {
        this.overlay = null;
        this.monitors = new Map();
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fps = 0;
        this.isMonitoring = false;
        this.animationStates = new Map();
        
        this.init();
    }
    
    init() {
        // Create main overlay container
        this.createOverlay();
        
        // Start monitoring
        this.startMonitoring();
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        console.log('🔍 Debug Overlay Initialized - Press D to toggle visibility');
    }
    
    createOverlay() {
        // Remove existing overlay if present
        const existing = document.getElementById('debug-overlay');
        if (existing) existing.remove();
        
        // Create new overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'debug-overlay';
        this.overlay.innerHTML = `
            <div class="debug-header">
                <span class="debug-title">🔍 Animation Debug</span>
                <button class="debug-toggle" onclick="debugOverlay.toggle()">_</button>
            </div>
            <div class="debug-content">
                <!-- FPS Monitor -->
                <div class="debug-section">
                    <div class="debug-label">FPS</div>
                    <div class="debug-value" id="debug-fps">0</div>
                </div>
                
                <!-- Animation State -->
                <div class="debug-section">
                    <div class="debug-label">State</div>
                    <div class="debug-value" id="debug-state">IDLE</div>
                </div>
                
                <!-- Column Positions -->
                <div class="debug-section">
                    <div class="debug-label">Positions</div>
                    <div class="debug-columns" id="debug-positions">
                        <div class="col-monitor">W: <span>0</span></div>
                        <div class="col-monitor">S: <span>0</span></div>
                        <div class="col-monitor">G1: <span>0</span></div>
                        <div class="col-monitor">G2: <span>0</span></div>
                        <div class="col-monitor">G3: <span>0</span></div>
                    </div>
                </div>
                
                <!-- Velocities -->
                <div class="debug-section">
                    <div class="debug-label">Velocity</div>
                    <div class="debug-columns" id="debug-velocities">
                        <div class="vel-monitor">W: <span>0</span></div>
                        <div class="vel-monitor">S: <span>0</span></div>
                        <div class="vel-monitor">G1: <span>0</span></div>
                        <div class="vel-monitor">G2: <span>0</span></div>
                        <div class="vel-monitor">G3: <span>0</span></div>
                    </div>
                </div>
                
                <!-- Target Distances -->
                <div class="debug-section">
                    <div class="debug-label">Distance to Target</div>
                    <div class="debug-value" id="debug-distances">-</div>
                </div>
                
                <!-- Animation Timeline -->
                <div class="debug-section">
                    <div class="debug-label">Timeline</div>
                    <div class="debug-timeline">
                        <div class="timeline-bar" id="debug-timeline"></div>
                    </div>
                </div>
                
                <!-- Performance Metrics -->
                <div class="debug-section">
                    <div class="debug-label">Performance</div>
                    <div class="debug-metrics">
                        <div>Frames: <span id="debug-frames">0</span></div>
                        <div>Duration: <span id="debug-duration">0s</span></div>
                        <div>Reflows: <span id="debug-reflows">0</span></div>
                    </div>
                </div>
                
                <!-- Event Log -->
                <div class="debug-section">
                    <div class="debug-label">Events</div>
                    <div class="debug-events" id="debug-events"></div>
                </div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
        
        // Append to body
        document.body.appendChild(this.overlay);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #debug-overlay {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 320px;
                background: rgba(10, 10, 15, 0.95);
                border: 2px solid #667eea;
                border-radius: 8px;
                color: #fff;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                z-index: 99999;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
            }
            
            #debug-overlay.minimized {
                height: 40px;
                overflow: hidden;
            }
            
            #debug-overlay.hidden {
                display: none;
            }
            
            .debug-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 8px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 6px 6px 0 0;
            }
            
            .debug-title {
                font-weight: bold;
                font-size: 14px;
            }
            
            .debug-toggle {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .debug-content {
                padding: 12px;
                max-height: 600px;
                overflow-y: auto;
            }
            
            .debug-section {
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .debug-section:last-child {
                border-bottom: none;
            }
            
            .debug-label {
                color: #a0aec0;
                font-size: 10px;
                text-transform: uppercase;
                margin-bottom: 4px;
                letter-spacing: 1px;
            }
            
            .debug-value {
                font-size: 18px;
                font-weight: bold;
                color: #48bb78;
            }
            
            #debug-state {
                padding: 4px 8px;
                background: rgba(72, 187, 120, 0.2);
                border-radius: 4px;
                display: inline-block;
            }
            
            #debug-state.spinning {
                background: rgba(246, 173, 85, 0.2);
                color: #f6ad55;
            }
            
            #debug-state.stopping {
                background: rgba(237, 137, 54, 0.2);
                color: #ed8936;
            }
            
            #debug-state.complete {
                background: rgba(72, 187, 120, 0.2);
                color: #48bb78;
            }
            
            .debug-columns {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .col-monitor, .vel-monitor {
                background: rgba(45, 55, 72, 0.5);
                padding: 4px 8px;
                border-radius: 4px;
                flex: 1;
                text-align: center;
            }
            
            .col-monitor span, .vel-monitor span {
                color: #63b3ed;
                font-weight: bold;
            }
            
            .debug-timeline {
                height: 20px;
                background: rgba(45, 55, 72, 0.5);
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }
            
            .timeline-bar {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #48bb78 100%);
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .debug-metrics {
                display: flex;
                gap: 12px;
                font-size: 11px;
            }
            
            .debug-metrics span {
                color: #f6ad55;
                font-weight: bold;
            }
            
            .debug-events {
                max-height: 100px;
                overflow-y: auto;
                background: rgba(45, 55, 72, 0.3);
                padding: 6px;
                border-radius: 4px;
                font-size: 10px;
                line-height: 1.4;
            }
            
            .debug-event {
                margin-bottom: 2px;
                opacity: 0.8;
            }
            
            .debug-event.new {
                color: #48bb78;
                opacity: 1;
            }
            
            /* Highlight on data change */
            .debug-value.changed {
                animation: highlight 0.5s ease;
            }
            
            @keyframes highlight {
                0% { background: rgba(246, 173, 85, 0.5); }
                100% { background: transparent; }
            }
        `;
        document.head.appendChild(style);
    }
    
    startMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        
        const monitor = () => {
            if (!this.isMonitoring) return;
            
            // Update FPS
            this.updateFPS();
            
            // Monitor slot positions
            this.monitorSlotPositions();
            
            // Monitor animation state
            this.monitorAnimationState();
            
            // Update timeline
            this.updateTimeline();
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }
    
    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        
        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta);
            document.getElementById('debug-fps').textContent = this.fps;
            
            // Highlight if FPS drops below 30
            const fpsEl = document.getElementById('debug-fps');
            if (this.fps < 30) {
                fpsEl.style.color = '#f56565';
            } else if (this.fps < 50) {
                fpsEl.style.color = '#f6ad55';
            } else {
                fpsEl.style.color = '#48bb78';
            }
            
            this.frameCount = 0;
            this.lastFrameTime = now;
        }
    }
    
    monitorSlotPositions() {
        const slots = document.querySelectorAll('.slot-items');
        const positionsEl = document.getElementById('debug-positions');
        const velocitiesEl = document.getElementById('debug-velocities');
        const distancesEl = document.getElementById('debug-distances');
        
        if (!slots.length) return;
        
        const positions = [];
        const velocities = [];
        const distances = [];
        const labels = ['W', 'S', 'G1', 'G2', 'G3'];
        
        slots.forEach((slot, index) => {
            // Get current position
            const transform = slot.style.transform || '';
            const match = transform.match(/translateY\(([-\d.]+)px\)/);
            const currentPos = match ? parseFloat(match[1]) : 0;
            
            // Calculate velocity (position change per frame)
            const lastPos = this.animationStates.get(`pos_${index}`) || 0;
            const velocity = Math.abs(currentPos - lastPos);
            this.animationStates.set(`pos_${index}`, currentPos);
            
            // Calculate distance to target (-1520px)
            const targetPos = -1520;
            const distance = Math.abs(currentPos - targetPos);
            
            positions.push(currentPos);
            velocities.push(velocity);
            distances.push(distance);
        });
        
        // Update position displays
        const posMonitors = positionsEl.querySelectorAll('.col-monitor span');
        positions.forEach((pos, i) => {
            if (posMonitors[i]) {
                posMonitors[i].textContent = pos.toFixed(0);
            }
        });
        
        // Update velocity displays
        const velMonitors = velocitiesEl.querySelectorAll('.vel-monitor span');
        velocities.forEach((vel, i) => {
            if (velMonitors[i]) {
                velMonitors[i].textContent = vel.toFixed(1);
                // Color code based on speed
                if (vel > 100) {
                    velMonitors[i].style.color = '#f56565';
                } else if (vel > 50) {
                    velMonitors[i].style.color = '#f6ad55';
                } else if (vel > 10) {
                    velMonitors[i].style.color = '#63b3ed';
                } else {
                    velMonitors[i].style.color = '#48bb78';
                }
            }
        });
        
        // Update average distance
        if (distances.length > 0) {
            const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
            distancesEl.textContent = `Avg: ${avgDistance.toFixed(1)}px`;
            
            // Color code based on accuracy
            if (avgDistance < 2) {
                distancesEl.style.color = '#48bb78';
            } else if (avgDistance < 10) {
                distancesEl.style.color = '#f6ad55';
            } else {
                distancesEl.style.color = '#f56565';
            }
        }
    }
    
    monitorAnimationState() {
        const stateEl = document.getElementById('debug-state');
        
        // Check if slot machine is active
        const slotMachine = window.slotMachine;
        if (!slotMachine) {
            stateEl.textContent = 'NO SLOT MACHINE';
            return;
        }
        
        // Determine current state
        let state = 'IDLE';
        
        if (slotMachine.isSpinning) {
            state = 'SPINNING';
            stateEl.className = 'debug-value spinning';
        } else if (slotMachine.animationEngine && slotMachine.animationEngine.isSpinning) {
            state = 'ANIMATION RUNNING';
            stateEl.className = 'debug-value spinning';
        } else {
            const result = document.getElementById('loadout-result');
            if (result && result.style.display !== 'none') {
                state = 'COMPLETE';
                stateEl.className = 'debug-value complete';
            } else {
                stateEl.className = 'debug-value';
            }
        }
        
        if (stateEl.textContent !== state) {
            stateEl.textContent = state;
            stateEl.classList.add('changed');
            setTimeout(() => stateEl.classList.remove('changed'), 500);
            
            // Log state change
            this.logEvent(`State: ${state}`);
        }
    }
    
    updateTimeline() {
        const timeline = document.getElementById('debug-timeline');
        const durationEl = document.getElementById('debug-duration');
        
        // Track animation duration
        if (window.slotMachine && window.slotMachine.isSpinning) {
            if (!this.animationStartTime) {
                this.animationStartTime = Date.now();
            }
            
            const elapsed = (Date.now() - this.animationStartTime) / 1000;
            durationEl.textContent = elapsed.toFixed(1) + 's';
            
            // Update timeline bar (max 10 seconds)
            const progress = Math.min((elapsed / 10) * 100, 100);
            timeline.style.width = progress + '%';
            
        } else if (this.animationStartTime) {
            // Animation ended
            const totalDuration = (Date.now() - this.animationStartTime) / 1000;
            this.logEvent(`Animation completed in ${totalDuration.toFixed(1)}s`);
            this.animationStartTime = null;
        }
        
        // Update frame counter
        document.getElementById('debug-frames').textContent = this.frameCount;
    }
    
    logEvent(message) {
        const eventsEl = document.getElementById('debug-events');
        if (!eventsEl) return;
        
        const event = document.createElement('div');
        event.className = 'debug-event new';
        event.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        eventsEl.insertBefore(event, eventsEl.firstChild);
        
        // Remove 'new' class after animation
        setTimeout(() => event.classList.remove('new'), 1000);
        
        // Keep only last 10 events
        while (eventsEl.children.length > 10) {
            eventsEl.removeChild(eventsEl.lastChild);
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Press 'D' to toggle debug overlay
            if (e.key === 'd' || e.key === 'D') {
                this.toggleVisibility();
            }
            
            // Press 'M' to minimize/maximize
            if (e.key === 'm' || e.key === 'M') {
                this.toggle();
            }
            
            // Press 'C' to clear events
            if (e.key === 'c' || e.key === 'C') {
                this.clearEvents();
            }
        });
    }
    
    toggle() {
        this.overlay.classList.toggle('minimized');
    }
    
    toggleVisibility() {
        this.overlay.classList.toggle('hidden');
    }
    
    clearEvents() {
        const eventsEl = document.getElementById('debug-events');
        if (eventsEl) {
            eventsEl.innerHTML = '';
            this.logEvent('Events cleared');
        }
    }
    
    destroy() {
        this.isMonitoring = false;
        if (this.overlay) {
            this.overlay.remove();
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.debugOverlay = new AnimationDebugOverlay();
    });
} else {
    window.debugOverlay = new AnimationDebugOverlay();
}
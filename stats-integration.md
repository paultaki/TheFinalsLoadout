# Simple Stats Integration

## 1. Setup Supabase
Run `supabase-simple-schema.sql` in your Supabase SQL editor

## 2. Add to HTML (both index.html and ragequit/index.html)
```html
<!-- Before </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/js/stats-tracker.js"></script>
```

## 3. Update stats-tracker.js
Replace these lines with your actual credentials:
```javascript
SUPABASE_URL: 'YOUR_PROJECT_URL',
SUPABASE_KEY: 'YOUR_ANON_KEY',
```

## 4. Track Spins

### Main site (app.js) - in displayLoadout or finalizeSpin:
```javascript
// After successful spin display
if (window.StatsTracker) {
  window.StatsTracker.track('loadout');
}
```

### Rage quit (loadout-app.js) - in finalizeSpin:
```javascript
// After spin completes (line ~520)
if (window.StatsTracker) {
  window.StatsTracker.track('ragequit');
}
```

## 5. Optional: Display Stats
```html
<!-- Add where you want to show counts -->
<div class="stats-display">
  <span>Total Spins: <span id="loadoutTotal">0</span></span>
  <!-- OR for rage quit page: -->
  <span>Total Rage Quits: <span id="ragequitTotal">0</span></span>
</div>
```

## That's it!

The tracker will:
- Batch updates (sends every 10 spins or 30 seconds)
- Save pending counts in localStorage (won't lose data)
- Update display immediately (feels responsive)
- Fail silently if Supabase is down
- Sync remaining counts when page closes

## For OBS Overlay (separate implementation)

In your overlay code:
```javascript
// When overlay starts
const sessionId = await supabase.rpc('overlay_start');

// Every 5 minutes
await supabase.rpc('overlay_heartbeat', { p_session_id: sessionId });

// When overlay stops
await supabase.rpc('overlay_end', { p_session_id: sessionId });
```

## Privacy Features
- ✅ No user tracking
- ✅ No IP addresses
- ✅ No personal data
- ✅ Just anonymous counters
- ✅ Batched to reduce requests
- ✅ Works offline (syncs later)
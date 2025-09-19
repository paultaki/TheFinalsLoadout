# Supabase Setup for Real-time OBS Overlay

## Quick Setup (5 minutes)

### 1. Get your Supabase credentials
- Go to your Supabase project dashboard
- Click on "Settings" → "API"
- Copy these two values:
  - **Project URL**: `https://xxxxx.supabase.co`
  - **Anon/Public Key**: `eyJhbGc...` (the long one)

### 2. Enable Realtime
- In Supabase dashboard, go to "Database" → "Replication"
- Make sure "Realtime" is enabled (it usually is by default)

### 3. Update the files

#### In `index.html` (main site)
Add before `</body>`:
```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
    // Initialize Supabase
    const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE';
    const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Create a unique channel for this user/session
    const overlayChannel = localStorage.getItem('overlayChannel') || 'default';

    // Modified sendLastLoadoutQuick function
    function sendLastLoadoutSupabase(overlayData) {
        const channel = supabase.channel('overlay_' + overlayChannel);

        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                channel.send({
                    type: 'broadcast',
                    event: 'loadout_update',
                    payload: overlayData
                });
                console.log('Sent via Supabase!');
            }
        });
    }
</script>
```

#### In `overlay/index.html`
Add before `</body>`:
```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
    // Initialize Supabase (same credentials)
    const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE';
    const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Listen for updates
    const channel = supabase.channel('overlay_' + (config.channel || 'default'));

    channel
        .on('broadcast', { event: 'loadout_update' }, (payload) => {
            console.log('Received from Supabase:', payload);
            renderLoadout(payload.payload);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Connected to Supabase overlay channel');
            }
        });
</script>
```

### 4. Test it!
1. Open OBS with the overlay URL: `http://localhost:8000/overlay/`
2. Generate a loadout on main site
3. Click "Send Current" - it should instantly appear in OBS!

## Benefits
- ✅ Real-time updates (no polling)
- ✅ Works across different contexts (OBS, different browsers, etc.)
- ✅ No server setup needed
- ✅ Free tier is more than enough (10,000 messages/month)
- ✅ Can support multiple streamers with unique channels

## Optional: Unique Channels per User
To prevent interference between multiple users:

```javascript
// Generate a unique channel ID per browser
if (!localStorage.getItem('myOverlayId')) {
    localStorage.setItem('myOverlayId', 'user_' + Math.random().toString(36).substr(2, 9));
}
const myChannel = localStorage.getItem('myOverlayId');

// Use this in the overlay URL:
// http://localhost:8000/overlay/?channel=user_abc123def
```

## Troubleshooting
- Check browser console for connection messages
- Make sure both files use the same channel name
- Verify your Supabase project URL and key are correct
- Realtime usually has a ~100ms delay which is perfect for streaming
// Supabase configuration for overlay sync
// You'll need to add this to your index.html and overlay/index.html

// Initialize Supabase client
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Your public anon key

// Import this in your HTML files:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Channel name based on user or session
const channelName = 'overlay_channel_default'; // You can make this unique per user

// Function to send loadout to overlay (use in main site)
async function sendLoadoutToOverlay(loadoutData) {
    try {
        // Broadcast the loadout update
        const channel = supabase.channel(channelName);

        await channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                channel.send({
                    type: 'broadcast',
                    event: 'loadout_update',
                    payload: loadoutData
                });
                console.log('Loadout sent via Supabase:', loadoutData);
            }
        });

        return true;
    } catch (error) {
        console.error('Error sending loadout:', error);
        return false;
    }
}

// Function to listen for loadout updates (use in overlay)
function listenForLoadoutUpdates(callback) {
    const channel = supabase.channel(channelName);

    channel
        .on('broadcast', { event: 'loadout_update' }, (payload) => {
            console.log('Received loadout update:', payload);
            callback(payload.payload);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Listening for loadout updates on channel:', channelName);
            }
        });

    return channel;
}

// Example usage in main site:
/*
function sendToSupabaseOverlay(loadoutData) {
    sendLoadoutToOverlay(loadoutData);
}
*/

// Example usage in overlay:
/*
listenForLoadoutUpdates((loadout) => {
    renderLoadout(loadout);
});
*/
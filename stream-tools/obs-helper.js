// Supabase Helper with retry logic
const SupabaseHelper = {
    SUPABASE_URL: 'https://lalgvijlctrxbqtsctum.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbGd2aWpsY3RyeGJxdHNjdHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMzM4NzAsImV4cCI6MjA3NDYwOTg3MH0.GexJt5wtdif5H-QTFExzuukOVZToa9_tRpbl9RrEiQ4',

    maxRetries: 5,
    retryDelay: 1000,
    currentRetry: 0,
    channel: null,
    supabase: null,

    init() {
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase library not loaded');
            return false;
        }

        try {
            this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY, {
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            });
            console.log('✅ Supabase client initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return false;
        }
    },

    async connectWithRetry(channelName = 'obs_default', onMessage) {
        if (!this.supabase) {
            if (!this.init()) {
                console.error('Cannot initialize Supabase');
                return false;
            }
        }

        // Clean up existing channel
        if (this.channel) {
            await this.channel.unsubscribe();
            this.channel = null;
        }

        return new Promise((resolve) => {
            const attemptConnection = () => {
                console.log(`🔄 Connection attempt ${this.currentRetry + 1}/${this.maxRetries}`);

                this.channel = this.supabase.channel(channelName, {
                    config: {
                        broadcast: { self: true }
                    }
                });

                let connectionTimeout = setTimeout(() => {
                    console.log('⏱️ Connection timeout, retrying...');
                    this.retry(attemptConnection, resolve);
                }, 10000); // 10 second timeout

                this.channel
                    .on('broadcast', { event: 'loadout_update' }, (payload) => {
                        console.log('✅ Received loadout update:', payload);
                        if (onMessage) onMessage(payload.payload);
                    })
                    .subscribe((status, error) => {
                        clearTimeout(connectionTimeout);

                        if (error) {
                            console.error(`❌ Subscription error: ${error.message}`);
                            this.retry(attemptConnection, resolve);
                        } else if (status === 'SUBSCRIBED') {
                            console.log(`✅ Successfully connected to channel: ${channelName}`);
                            this.currentRetry = 0; // Reset retry count on success
                            resolve(true);
                        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                            console.error(`❌ Channel status: ${status}`);
                            this.retry(attemptConnection, resolve);
                        } else {
                            console.log(`Channel status: ${status}`);
                        }
                    });
            };

            attemptConnection();
        });
    },

    retry(attemptConnection, resolve) {
        this.currentRetry++;

        if (this.currentRetry >= this.maxRetries) {
            console.error('❌ Max retries reached. Connection failed.');
            resolve(false);
            return;
        }

        const delay = this.retryDelay * Math.pow(2, this.currentRetry - 1); // Exponential backoff
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);

        setTimeout(() => {
            if (this.channel) {
                this.channel.unsubscribe();
                this.channel = null;
            }
            attemptConnection();
        }, delay);
    },

    async sendLoadout(loadout) {
        if (!this.channel) {
            console.error('No active channel. Connect first.');
            return false;
        }

        try {
            await this.channel.send({
                type: 'broadcast',
                event: 'loadout_update',
                payload: loadout
            });
            console.log('📤 Loadout sent successfully');
            return true;
        } catch (error) {
            console.error('Failed to send loadout:', error);
            return false;
        }
    },

    disconnect() {
        if (this.channel) {
            this.channel.unsubscribe();
            this.channel = null;
            console.log('Disconnected from Supabase');
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseHelper;
}
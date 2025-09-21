-- Fix Realtime broadcast permissions for anonymous users
-- Run this in your Supabase SQL Editor

-- Grant SELECT permission to anon role for broadcast messages
GRANT SELECT ON "realtime"."messages" TO anon;

-- If RLS is enabled on realtime.messages, add a policy
-- (Only run if you get an error about RLS being enabled)
DO $$
BEGIN
    -- Check if RLS is enabled
    IF EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'realtime'
        AND tablename = 'messages'
    ) THEN
        -- Create policy for anon users to receive broadcasts
        CREATE POLICY IF NOT EXISTS "anon_can_receive_broadcasts"
        ON "realtime"."messages"
        FOR SELECT
        TO anon
        USING (true);
    END IF;
END $$;

-- Verify the permissions were granted
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE
    table_schema = 'realtime'
    AND table_name = 'messages'
    AND grantee = 'anon';
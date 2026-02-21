-- Migration: Enable Realtime for Core Tables
-- Version: 2.3.2
-- Date: 2026-02-21

-- To enable real-time for a table, we must add it to the 'supabase_realtime' publication.
-- We also set REPLICA IDENTITY FULL to ensure DELETE and UPDATE events contain full data for better UI sync.

-- 1. Enable Realtime Publication
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- 2. Add Tables to Publication
-- This allows Supabase to broadcast changes (INSERT, UPDATE, DELETE) for these tables.
ALTER PUBLICATION supabase_realtime ADD TABLE wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE debts;
ALTER PUBLICATION supabase_realtime ADD TABLE debt_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;
ALTER PUBLICATION supabase_realtime ADD TABLE reminders;

-- 3. Set Replica Identity
-- This ensures that for DELETE events, the old record data is included in the broadcast.
ALTER TABLE wallets REPLICA IDENTITY FULL;
ALTER TABLE transactions REPLICA IDENTITY FULL;
ALTER TABLE debts REPLICA IDENTITY FULL;
ALTER TABLE debt_payments REPLICA IDENTITY FULL;
ALTER TABLE budgets REPLICA IDENTITY FULL;
ALTER TABLE goals REPLICA IDENTITY FULL;
ALTER TABLE reminders REPLICA IDENTITY FULL;

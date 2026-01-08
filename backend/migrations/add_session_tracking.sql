-- Migration: Add session tracking to student14 table
-- This enables single-session enforcement and heartbeat checking

-- Add session_id column to track unique login sessions
ALTER TABLE student14 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255) DEFAULT NULL;

-- Add last_heartbeat column to track active sessions
ALTER TABLE student14 
ADD COLUMN IF NOT EXISTS last_heartbeat DATETIME DEFAULT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_session_id ON student14(session_id);
CREATE INDEX IF NOT EXISTS idx_last_heartbeat ON student14(last_heartbeat);

-- Initialize existing records
UPDATE student14 SET session_id = NULL, last_heartbeat = NULL WHERE session_id IS NULL;
